-- g.actor — Supabase schema
-- Run this once in the Supabase SQL Editor (Dashboard → SQL Editor → New query).

-- ---------- Tables ----------

create table if not exists projects (
  id          text primary key,
  name        text not null,
  initials    text not null,
  tagline     text not null default '',
  description text not null default '',
  accent      text not null,
  status      text not null default 'planning'
              check (status in ('active', 'planning', 'paused')),
  logo        text,
  logo_wide   boolean,
  logos       text[],
  focus       text,
  links       jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists updates (
  id          text primary key,
  project_id  text not null references projects (id) on delete cascade,
  author      text not null,
  title       text not null,
  body        text not null default '',
  kind        text not null default 'update'
              check (kind in ('update', 'milestone', 'release', 'blocker')),
  attachments jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists notes (
  id          text primary key,
  project_id  text not null references projects (id) on delete cascade,
  author      text not null,
  body        text not null default '',
  attachments jsonb,
  created_at  timestamptz not null default now()
);

create table if not exists notifications (
  id         text primary key,
  project_id text not null references projects (id) on delete cascade,
  title      text not null,
  body       text not null default '',
  audience   text not null default 'Team',
  read       boolean not null default false,
  created_at timestamptz not null default now()
);

create table if not exists messages (
  id         text primary key,
  project_id text not null references projects (id) on delete cascade,
  author     text not null,
  body       text not null,
  created_at timestamptz not null default now()
);

create index if not exists updates_project_idx on updates (project_id, created_at desc);
create index if not exists notes_project_idx on notes (project_id, created_at desc);
create index if not exists messages_project_idx on messages (project_id, created_at);
create index if not exists notifications_created_idx on notifications (created_at desc);

-- ---------- Row Level Security ----------
-- v1: the app is a private team tool; permissive policies for now.
-- These will be tightened to authenticated-team-only once Supabase Auth lands.

alter table projects      enable row level security;
alter table updates       enable row level security;
alter table notes         enable row level security;
alter table notifications enable row level security;
alter table messages      enable row level security;

do $$
declare t text;
begin
  foreach t in array array['projects','updates','notes','notifications','messages'] loop
    execute format('drop policy if exists "open access v1" on %I', t);
    execute format(
      'create policy "open access v1" on %I for all using (true) with check (true)', t
    );
  end loop;
end $$;

-- ---------- Realtime ----------
-- Live team chat + instant updates across open tabs.

do $$
begin
  alter publication supabase_realtime add table messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table notifications;
exception when duplicate_object then null;
end $$;

-- ---------- Storage ----------
-- Bucket for update/note attachments (replaces base64-in-localStorage).

insert into storage.buckets (id, name, public)
values ('attachments', 'attachments', true)
on conflict (id) do nothing;

drop policy if exists "attachments read v1" on storage.objects;
create policy "attachments read v1" on storage.objects
  for select using (bucket_id = 'attachments');

drop policy if exists "attachments write v1" on storage.objects;
create policy "attachments write v1" on storage.objects
  for insert with check (bucket_id = 'attachments');

drop policy if exists "attachments delete v1" on storage.objects;
create policy "attachments delete v1" on storage.objects
  for delete using (bucket_id = 'attachments');
