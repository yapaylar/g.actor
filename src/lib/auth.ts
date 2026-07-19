"use client";

import { useSyncExternalStore } from "react";
import { getSupabase, supabaseEnabled } from "./supabase";
import { reloadRemote } from "./store";
import { setIdentity } from "./identity";
import type { TeamMember } from "./types";

export type AuthStatus =
  | "loading" // checking session / membership
  | "signedOut" // no session — show login
  | "notMember" // signed in but email is not on the team allowlist
  | "signedIn"; // full access

export interface AuthState {
  status: AuthStatus;
  email: string | null;
  member: TeamMember | null;
  members: TeamMember[];
}

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function rowToMember(r: Row): TeamMember {
  return {
    email: r.email,
    name: r.name,
    role: r.role,
    userId: r.user_id ?? undefined,
    createdAt: Date.parse(r.created_at),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// Without Supabase the app runs in local prototype mode: no login screen.
const LOCAL_STATE: AuthState = {
  status: "signedIn",
  email: null,
  member: null,
  members: [],
};

let auth: AuthState = supabaseEnabled
  ? { status: "loading", email: null, member: null, members: [] }
  : LOCAL_STATE;
let started = false;
const listeners = new Set<() => void>();

function emit(next: AuthState) {
  auth = next;
  listeners.forEach((l) => l());
}

async function loadMembership(email: string) {
  const sb = getSupabase();
  const { data, error } = await sb.from("team_members").select("*");
  if (error) {
    console.error("team_members load failed", error);
    emit({ status: "notMember", email, member: null, members: [] });
    return;
  }
  const members = (data ?? []).map(rowToMember);
  const member =
    members.find((m) => m.email.toLowerCase() === email.toLowerCase()) ?? null;

  if (!member) {
    // RLS hides all rows from non-members, so an empty list means "not on the team".
    emit({ status: "notMember", email, member: null, members: [] });
    return;
  }

  // Adopt the team profile as chat/update identity.
  if (member.name) setIdentity(member.name);

  // Link auth user id to the row on first login (best effort).
  if (!member.userId) {
    const { data: userData } = await sb.auth.getUser();
    const uid = userData.user?.id;
    if (uid) {
      void sb
        .from("team_members")
        .update({ user_id: uid })
        .eq("email", member.email);
    }
  }

  emit({ status: "signedIn", email, member, members });
  reloadRemote();
}

function start() {
  if (started || !supabaseEnabled || typeof window === "undefined") return;
  started = true;
  const sb = getSupabase();

  void sb.auth.getSession().then(({ data }) => {
    const email = data.session?.user?.email ?? null;
    if (email) void loadMembership(email);
    else emit({ ...auth, status: "signedOut" });
  });

  sb.auth.onAuthStateChange((event, session) => {
    if (event === "SIGNED_OUT") {
      emit({ status: "signedOut", email: null, member: null, members: [] });
      return;
    }
    const email = session?.user?.email;
    if (email && auth.status !== "signedIn") void loadMembership(email);
  });
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useAuth(): AuthState {
  return useSyncExternalStore(
    subscribe,
    () => {
      start();
      return auth;
    },
    () => (supabaseEnabled ? auth : LOCAL_STATE)
  );
}

// ---- Actions ----

export async function signInWithEmail(email: string): Promise<string | null> {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOtp({
    email: email.trim().toLowerCase(),
    options: { emailRedirectTo: window.location.origin },
  });
  return error ? error.message : null;
}

export async function signInWithGoogle(): Promise<string | null> {
  const sb = getSupabase();
  const { error } = await sb.auth.signInWithOAuth({
    provider: "google",
    options: { redirectTo: window.location.origin },
  });
  return error ? error.message : null;
}

export async function signOut() {
  await getSupabase().auth.signOut();
}

export async function refreshMembers() {
  if (auth.status !== "signedIn" || !auth.email) return;
  const sb = getSupabase();
  const { data, error } = await sb.from("team_members").select("*");
  if (error || !data) return;
  const members = data.map(rowToMember);
  const member =
    members.find(
      (m) => m.email.toLowerCase() === auth.email!.toLowerCase()
    ) ?? auth.member;
  emit({ ...auth, members, member });
}

export async function addMember(
  email: string,
  name: string,
  role: TeamMember["role"]
): Promise<string | null> {
  const sb = getSupabase();
  const { error } = await sb.from("team_members").insert({
    email: email.trim().toLowerCase(),
    name: name.trim(),
    role,
  });
  if (error) return error.message;
  await refreshMembers();
  return null;
}

export async function removeMember(email: string): Promise<string | null> {
  const sb = getSupabase();
  const { error } = await sb.from("team_members").delete().eq("email", email);
  if (error) return error.message;
  await refreshMembers();
  return null;
}

export async function setMemberRole(
  email: string,
  role: TeamMember["role"]
): Promise<string | null> {
  const sb = getSupabase();
  const { error } = await sb
    .from("team_members")
    .update({ role })
    .eq("email", email);
  if (error) return error.message;
  await refreshMembers();
  return null;
}

export async function updateOwnName(name: string): Promise<string | null> {
  if (!supabaseEnabled || !auth.member) {
    setIdentity(name);
    return null;
  }
  const sb = getSupabase();
  const trimmed = name.trim();
  if (!trimmed) return null;
  const { error } = await sb
    .from("team_members")
    .update({ name: trimmed })
    .eq("email", auth.member.email);
  if (error) return error.message;
  setIdentity(trimmed);
  emit({
    ...auth,
    member: { ...auth.member, name: trimmed },
    members: auth.members.map((m) =>
      m.email === auth.member!.email ? { ...m, name: trimmed } : m
    ),
  });
  return null;
}
