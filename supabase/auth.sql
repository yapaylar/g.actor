-- g.actor — Team auth & roles
-- Run AFTER schema.sql in the Supabase SQL Editor.
-- IMPORTANT: replace the owner email in the last section before running.

-- ---------- Team members ----------

create table if not exists team_members (
  email      text primary key,
  name       text not null default '',
  role       text not null default 'member' check (role in ('owner', 'member')),
  user_id    uuid unique,
  created_at timestamptz not null default now()
);

alter table team_members enable row level security;

-- ---------- Helper functions (security definer so policies can read team_members) ----------

create or replace function public.jwt_email() returns text
language sql stable as $$
  select lower(coalesce(auth.jwt() ->> 'email', ''))
$$;

create or replace function public.is_team_member() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from team_members where email = public.jwt_email())
$$;

create or replace function public.is_owner() returns boolean
language sql stable security definer set search_path = public as $$
  select exists (
    select 1 from team_members
    where email = public.jwt_email() and role = 'owner'
  )
$$;

-- ---------- team_members policies ----------

drop policy if exists "team read" on team_members;
create policy "team read" on team_members
  for select to authenticated using (public.is_team_member());

drop policy if exists "owner insert" on team_members;
create policy "owner insert" on team_members
  for insert to authenticated with check (public.is_owner());

drop policy if exists "owner delete" on team_members;
create policy "owner delete" on team_members
  for delete to authenticated
  using (public.is_owner() and email <> public.jwt_email());

drop policy if exists "self or owner update" on team_members;
create policy "self or owner update" on team_members
  for update to authenticated
  using (public.is_owner() or email = public.jwt_email())
  with check (public.is_owner() or email = public.jwt_email());

-- Members may edit their own row (name), but only owners may change roles.
create or replace function public.guard_role_change() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  if new.role is distinct from old.role and not public.is_owner() then
    raise exception 'Only owners can change roles';
  end if;
  return new;
end $$;

drop trigger if exists team_members_guard on team_members;
create trigger team_members_guard
  before update on team_members
  for each row execute function public.guard_role_change();

-- ---------- Tighten app-table access to team members ----------

do $$
declare t text;
begin
  foreach t in array array['projects','updates','notes','notifications','messages'] loop
    execute format('drop policy if exists "open access v1" on %I', t);
    execute format('drop policy if exists "team access" on %I', t);
    execute format(
      'create policy "team access" on %I for all to authenticated
       using (public.is_team_member()) with check (public.is_team_member())', t
    );
  end loop;
end $$;

-- ---------- Storage: writes require team membership (reads stay public) ----------

drop policy if exists "attachments write v1" on storage.objects;
create policy "attachments write v1" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'attachments' and public.is_team_member());

drop policy if exists "attachments delete v1" on storage.objects;
create policy "attachments delete v1" on storage.objects
  for delete to authenticated
  using (bucket_id = 'attachments' and public.is_team_member());

-- ---------- Seed the first owner ----------
-- >>> REPLACE the email below with your own before running <<<

insert into team_members (email, name, role)
values ('BURAYA-KENDI-EPOSTANI-YAZ@ornek.com', 'Berker', 'owner')
on conflict (email) do nothing;
