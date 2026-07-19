"use client";

import { useSyncExternalStore } from "react";
import type {
  AppNotification,
  AppState,
  Attachment,
  ChatMessage,
  Note,
  Project,
  Update,
} from "./types";
import { getSupabase, supabaseEnabled } from "./supabase";

const STORAGE_KEY = "g-world:state:v5";

function uid(): string {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

const now = Date.now();
const minute = 60 * 1000;
const hour = 60 * minute;
const day = 24 * hour;

function seed(): AppState {
  const projects: Project[] = [
    {
      id: "g-act",
      name: "G-ACT",
      initials: "GA",
      tagline: "Global cardiovascular access",
      description:
        "Building cardiovascular access systems — earlier detection, expanded diagnostic capacity, and evidence that improves outcomes at scale.",
      accent: "#4f46e5",
      status: "active",
      logo: "/g-actfavicon.png",
      links: [{ label: "Website", url: "https://g-act.org" }],
      createdAt: now - 40 * day,
    },
    {
      id: "v-loop",
      name: "V-loop",
      initials: "VL",
      tagline: "Community front door to structural heart care",
      description:
        "A standardized, AI-enabled pathway that identifies structural heart disease in the community and connects every patient to specialty care.",
      accent: "#0ea5e9",
      status: "active",
      logo: "/vloop-logo.svg",
      logoWide: true,
      links: [
        { label: "Website", url: "https://v-loop.health" },
        { label: "VLOOP App", url: "https://v-loop.health" },
      ],
      createdAt: now - 28 * day,
    },
    {
      id: "heartlink",
      name: "Heartlink",
      initials: "HL",
      tagline: "Training & education platform",
      description:
        "Heartlink+ modules and the LMS — training the workforce behind the cardiovascular access network.",
      accent: "#ec4899",
      status: "active",
      logo: "/hlplogo.png",
      logoWide: true,
      links: [
        { label: "Website", url: "https://heartlink.plus" },
        { label: "Heartlink+ App", url: "https://heartlink.plus" },
        { label: "LMS System", url: "https://heartlink.plus" },
      ],
      createdAt: now - 14 * day,
    },
    {
      id: "regnova",
      name: "Regnova",
      initials: "RG",
      tagline: "Ghana medical device registration",
      description:
        "On-the-ground partner for Ghana FDA approvals, compliant distribution, and post-market surveillance.",
      accent: "#10b981",
      status: "active",
      links: [
        { label: "Website", url: "https://regnovagh.com" },
        { label: "Portal", url: "https://portal.regnovagh.com" },
      ],
      createdAt: now - 10 * day,
    },
    {
      id: "social",
      name: "Social",
      initials: "SO",
      tagline: "Social media management",
      description:
        "One home to plan, schedule, and manage every social channel for the team.",
      accent: "#f59e0b",
      status: "planning",
      logos: ["/linkedin-logo.svg", "/x-logo.svg"],
      links: [
        { label: "LinkedIn", url: "https://linkedin.com" },
        { label: "X", url: "https://x.com" },
      ],
      createdAt: now - 6 * day,
    },
  ];

  const updates: Update[] = [
    {
      id: uid(),
      projectId: "g-act",
      author: "Berker",
      title: "Kickoff & scope locked",
      body: "Defined the v1 scope and the core workflow. Ready to start building the action pipeline.",
      kind: "milestone",
      createdAt: now - 5 * day,
    },
    {
      id: uid(),
      projectId: "g-act",
      author: "Berker",
      title: "First draft of the dashboard",
      body: "Shared an early look at how operators will see live actions in one place.",
      kind: "update",
      createdAt: now - 2 * day,
    },
    {
      id: uid(),
      projectId: "v-loop",
      author: "Berker",
      title: "Feedback intake form is live",
      body: "We can now collect structured feedback. Next: route it to the right owner automatically.",
      kind: "release",
      createdAt: now - 1 * day,
    },
    {
      id: uid(),
      projectId: "heartlink",
      author: "Berker",
      title: "Concept exploration",
      body: "Sketching the relationship model and what 'a link' really means for users.",
      kind: "update",
      createdAt: now - 3 * hour,
    },
    {
      id: uid(),
      projectId: "regnova",
      author: "Berker",
      title: "Website & portal are live",
      body: "regnovagh.com is up with the full service catalog, and the client portal is running at portal.regnovagh.com.",
      kind: "release",
      createdAt: now - 2 * day,
    },
    {
      id: uid(),
      projectId: "social",
      author: "Berker",
      title: "Channels we want to manage",
      body: "Listed the priority platforms and the must-have scheduling features for launch.",
      kind: "update",
      createdAt: now - 30 * minute,
    },
  ];

  const notes: Note[] = [
    {
      id: uid(),
      projectId: "g-act",
      author: "Berker",
      body: "Let's keep the first version focused — one workflow, done really well.",
      createdAt: now - 4 * day,
    },
    {
      id: uid(),
      projectId: "v-loop",
      author: "Berker",
      body: "Idea: weekly digest of all feedback so nothing slips through.",
      createdAt: now - 20 * hour,
    },
  ];

  const notifications: AppNotification[] = [
    {
      id: uid(),
      projectId: "v-loop",
      title: "Feedback form shipped",
      body: "The intake form is live for the whole team to try.",
      audience: "Team",
      createdAt: now - 1 * day,
      read: false,
    },
  ];

  return { projects, updates, notes, notifications, messages: [] };
}

// ---- Row mapping (snake_case DB rows <-> camelCase app types) ----

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>;

function rowToProject(r: Row): Project {
  return {
    id: r.id,
    name: r.name,
    initials: r.initials,
    tagline: r.tagline,
    description: r.description,
    accent: r.accent,
    status: r.status,
    logo: r.logo ?? undefined,
    logoWide: r.logo_wide ?? undefined,
    logos: r.logos ?? undefined,
    focus: r.focus ?? undefined,
    links: r.links ?? undefined,
    createdAt: Date.parse(r.created_at),
  };
}

function projectToRow(p: Project): Row {
  return {
    id: p.id,
    name: p.name,
    initials: p.initials,
    tagline: p.tagline,
    description: p.description,
    accent: p.accent,
    status: p.status,
    logo: p.logo ?? null,
    logo_wide: p.logoWide ?? null,
    logos: p.logos ?? null,
    focus: p.focus ?? null,
    links: p.links ?? null,
    created_at: new Date(p.createdAt).toISOString(),
  };
}

function rowToUpdate(r: Row): Update {
  return {
    id: r.id,
    projectId: r.project_id,
    author: r.author,
    title: r.title,
    body: r.body,
    kind: r.kind,
    attachments: r.attachments ?? undefined,
    createdAt: Date.parse(r.created_at),
  };
}

function updateToRow(u: Update): Row {
  return {
    id: u.id,
    project_id: u.projectId,
    author: u.author,
    title: u.title,
    body: u.body,
    kind: u.kind,
    attachments: u.attachments ?? null,
    created_at: new Date(u.createdAt).toISOString(),
  };
}

function rowToNote(r: Row): Note {
  return {
    id: r.id,
    projectId: r.project_id,
    author: r.author,
    body: r.body,
    attachments: r.attachments ?? undefined,
    createdAt: Date.parse(r.created_at),
  };
}

function noteToRow(n: Note): Row {
  return {
    id: n.id,
    project_id: n.projectId,
    author: n.author,
    body: n.body,
    attachments: n.attachments ?? null,
    created_at: new Date(n.createdAt).toISOString(),
  };
}

function rowToNotification(r: Row): AppNotification {
  return {
    id: r.id,
    projectId: r.project_id,
    title: r.title,
    body: r.body,
    audience: r.audience,
    read: r.read,
    createdAt: Date.parse(r.created_at),
  };
}

function notificationToRow(n: AppNotification): Row {
  return {
    id: n.id,
    project_id: n.projectId,
    title: n.title,
    body: n.body,
    audience: n.audience,
    read: n.read,
    created_at: new Date(n.createdAt).toISOString(),
  };
}

function rowToMessage(r: Row): ChatMessage {
  return {
    id: r.id,
    projectId: r.project_id,
    author: r.author,
    body: r.body,
    createdAt: Date.parse(r.created_at),
  };
}

function messageToRow(m: ChatMessage): Row {
  return {
    id: m.id,
    project_id: m.projectId,
    author: m.author,
    body: m.body,
    created_at: new Date(m.createdAt).toISOString(),
  };
}
/* eslint-enable @typescript-eslint/no-explicit-any */

// ---- State container ----

const EMPTY_STATE: AppState = {
  projects: [],
  updates: [],
  notes: [],
  notifications: [],
  messages: [],
};

let state: AppState = EMPTY_STATE;
let started = false;
let ready = false;
let remoteLoaded = false;
const listeners = new Set<() => void>();

function notifyListeners() {
  listeners.forEach((l) => l());
}

function commit(next: AppState) {
  state = next;
  if (!supabaseEnabled && typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      window.alert(
        "Couldn't save — local storage is full. Try removing some large attachments."
      );
    }
  }
  notifyListeners();
}

function markReady() {
  if (!ready) {
    ready = true;
    notifyListeners();
  }
}

// ---- Local fallback (no Supabase env configured) ----

/**
 * Stored state can predate seed changes (logos etc.). Refresh the visual
 * fields of seed projects in place without touching user-created content.
 */
function syncSeedVisuals(stored: AppState): AppState {
  const seedProjects = new Map(seed().projects.map((p) => [p.id, p]));
  let changed = false;
  const projects = stored.projects.map((p) => {
    const s = seedProjects.get(p.id);
    if (!s) return p;
    if (
      p.logo !== s.logo ||
      p.logoWide !== s.logoWide ||
      JSON.stringify(p.logos) !== JSON.stringify(s.logos)
    ) {
      changed = true;
      return { ...p, logo: s.logo, logoWide: s.logoWide, logos: s.logos };
    }
    return p;
  });
  if (!changed) return stored;
  const next = { ...stored, projects };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  return next;
}

function loadLocal(): AppState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    return syncSeedVisuals(JSON.parse(raw) as AppState);
  } catch {
    return seed();
  }
}

// ---- Remote (Supabase) ----

async function initRemote() {
  remoteLoaded = true;
  const sb = getSupabase();
  try {
    const [p, u, n, nf, m] = await Promise.all([
      sb.from("projects").select("*").order("created_at", { ascending: true }),
      sb.from("updates").select("*").order("created_at", { ascending: false }),
      sb.from("notes").select("*").order("created_at", { ascending: false }),
      sb
        .from("notifications")
        .select("*")
        .order("created_at", { ascending: false }),
      sb.from("messages").select("*").order("created_at", { ascending: true }),
    ]);
    const firstError =
      p.error ?? u.error ?? n.error ?? nf.error ?? m.error ?? null;
    if (firstError) throw firstError;

    let next: AppState = {
      projects: (p.data ?? []).map(rowToProject),
      updates: (u.data ?? []).map(rowToUpdate),
      notes: (n.data ?? []).map(rowToNote),
      notifications: (nf.data ?? []).map(rowToNotification),
      messages: (m.data ?? []).map(rowToMessage),
    };

    // First boot on an empty database: plant the seed content.
    if (next.projects.length === 0) {
      const s = seed();
      const inserts = [
        sb.from("projects").insert(s.projects.map(projectToRow)),
        sb.from("updates").insert(s.updates.map(updateToRow)),
        sb.from("notes").insert(s.notes.map(noteToRow)),
        sb.from("notifications").insert(s.notifications.map(notificationToRow)),
      ];
      for (const q of inserts) {
        const { error } = await q;
        if (error) console.error("Seed insert failed", error);
      }
      next = s;
    }

    commit(next);
  } catch (err) {
    console.error("Supabase load failed", err);
  } finally {
    markReady();
    subscribeRealtime();
  }
}

/** Merge live DB changes from other clients into local state. */
function subscribeRealtime() {
  const sb = getSupabase();
  sb.channel("g-actor-db")
    .on(
      "postgres_changes",
      { event: "*", schema: "public" },
      (payload: {
        table: string;
        eventType: string;
        new: Row;
        old: Row;
      }) => {
        applyRemoteChange(payload.table, payload.eventType, payload.new, payload.old);
      }
    )
    .subscribe();
}

function upsertById<T extends { id: string }>(
  list: T[],
  item: T,
  position: "head" | "tail"
): T[] {
  if (list.some((x) => x.id === item.id)) {
    return list.map((x) => (x.id === item.id ? item : x));
  }
  return position === "head" ? [item, ...list] : [...list, item];
}

function applyRemoteChange(
  table: string,
  eventType: string,
  newRow: Row,
  oldRow: Row
) {
  const s = state;
  if (eventType === "DELETE") {
    const id = oldRow?.id as string | undefined;
    if (!id) return;
    if (table === "projects") {
      // FK cascades already removed children in the DB; mirror that locally.
      commit({
        projects: s.projects.filter((x) => x.id !== id),
        updates: s.updates.filter((x) => x.projectId !== id),
        notes: s.notes.filter((x) => x.projectId !== id),
        notifications: s.notifications.filter((x) => x.projectId !== id),
        messages: s.messages.filter((x) => x.projectId !== id),
      });
      return;
    }
    const strip = <T extends { id: string }>(list: T[]) =>
      list.filter((x) => x.id !== id);
    if (table === "updates") commit({ ...s, updates: strip(s.updates) });
    else if (table === "notes") commit({ ...s, notes: strip(s.notes) });
    else if (table === "notifications")
      commit({ ...s, notifications: strip(s.notifications) });
    else if (table === "messages") commit({ ...s, messages: strip(s.messages) });
    return;
  }

  if (!newRow) return;
  switch (table) {
    case "projects":
      commit({
        ...s,
        projects: upsertById(s.projects, rowToProject(newRow), "tail"),
      });
      break;
    case "updates":
      commit({
        ...s,
        updates: upsertById(s.updates, rowToUpdate(newRow), "head"),
      });
      break;
    case "notes":
      commit({ ...s, notes: upsertById(s.notes, rowToNote(newRow), "head") });
      break;
    case "notifications":
      commit({
        ...s,
        notifications: upsertById(
          s.notifications,
          rowToNotification(newRow),
          "head"
        ),
      });
      break;
    case "messages":
      commit({
        ...s,
        messages: upsertById(s.messages, rowToMessage(newRow), "tail"),
      });
      break;
  }
}

/** Fire-and-forget remote write with error logging. */
function remote(
  run: (
    sb: ReturnType<typeof getSupabase>
  ) => PromiseLike<{ error: unknown }>
) {
  if (!supabaseEnabled) return;
  void Promise.resolve(run(getSupabase())).then(({ error }) => {
    if (error) console.error("Supabase write failed", error);
  });
}

/** Best-effort removal of Storage files referenced by deleted content. */
function removeAttachmentFiles(lists: (Attachment[] | undefined)[]) {
  if (!supabaseEnabled) return;
  const paths = lists
    .flat()
    .filter((a): a is Attachment => Boolean(a))
    .map((a) => a.url.split("/object/public/attachments/")[1])
    .filter((p): p is string => Boolean(p))
    .map((p) => decodeURIComponent(p));
  if (paths.length) {
    remote((sb) => sb.storage.from("attachments").remove(paths));
  }
}

// ---- Store bootstrap & hooks ----

function start() {
  if (started || typeof window === "undefined") return;
  started = true;
  if (supabaseEnabled) {
    // RLS requires a session; wait for auth before fetching. The auth store
    // calls reloadRemote() as soon as a session appears.
    void getSupabase()
      .auth.getSession()
      .then(({ data }) => {
        if (data.session) {
          if (!remoteLoaded) void initRemote();
        } else {
          markReady();
        }
      });
  } else {
    state = loadLocal();
    ready = true;
  }
}

/** Called by the auth store once a session is established. */
export function reloadRemote() {
  if (!supabaseEnabled || remoteLoaded) return;
  void initRemote();
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AppState {
  start();
  return state;
}

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, () => EMPTY_STATE);
}

/** False until the first load (local or remote) has finished. */
export function useStoreReady(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => {
      start();
      return ready;
    },
    () => false
  );
}

// ---- Mutations (optimistic local commit + remote write) ----

function initialsOf(name: string): string {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "P"
  );
}

export function addProject(input: {
  name: string;
  tagline: string;
  description: string;
  accent: string;
  status?: Project["status"];
  links?: Project["links"];
}): Project {
  const project: Project = {
    id: uid(),
    name: input.name.trim() || "Untitled",
    initials: initialsOf(input.name),
    tagline: input.tagline.trim(),
    description: input.description.trim(),
    accent: input.accent,
    status: input.status ?? "planning",
    links: input.links?.length ? input.links : undefined,
    createdAt: Date.now(),
  };
  commit({ ...state, projects: [...state.projects, project] });
  remote((sb) => sb.from("projects").insert(projectToRow(project)));
  return project;
}

export function updateProject(
  projectId: string,
  patch: Partial<
    Pick<
      Project,
      | "name"
      | "tagline"
      | "description"
      | "accent"
      | "status"
      | "links"
      | "focus"
    >
  >
) {
  let updated: Project | null = null;
  const projects = state.projects.map((p) => {
    if (p.id !== projectId) return p;
    const next = { ...p, ...patch };
    if (patch.name !== undefined) {
      next.name = patch.name.trim() || p.name;
      next.initials = initialsOf(next.name);
    }
    if (patch.links !== undefined) {
      next.links = patch.links.length ? patch.links : undefined;
    }
    if (patch.focus !== undefined) {
      next.focus = patch.focus.trim() || undefined;
    }
    updated = next;
    return next;
  });
  if (!updated) return;
  commit({ ...state, projects });
  const row = projectToRow(updated);
  remote((sb) => sb.from("projects").update(row).eq("id", projectId));
}

export function deleteProject(projectId: string) {
  removeAttachmentFiles([
    ...state.updates
      .filter((u) => u.projectId === projectId)
      .map((u) => u.attachments),
    ...state.notes
      .filter((n) => n.projectId === projectId)
      .map((n) => n.attachments),
  ]);
  commit({
    projects: state.projects.filter((p) => p.id !== projectId),
    updates: state.updates.filter((u) => u.projectId !== projectId),
    notes: state.notes.filter((n) => n.projectId !== projectId),
    notifications: state.notifications.filter(
      (n) => n.projectId !== projectId
    ),
    messages: state.messages.filter((m) => m.projectId !== projectId),
  });
  // Children are removed by FK cascade.
  remote((sb) => sb.from("projects").delete().eq("id", projectId));
}

export function addUpdate(input: Omit<Update, "id" | "createdAt">) {
  const update: Update = { ...input, id: uid(), createdAt: Date.now() };
  commit({ ...state, updates: [update, ...state.updates] });
  remote((sb) => sb.from("updates").insert(updateToRow(update)));
}

export function deleteUpdate(id: string) {
  removeAttachmentFiles([
    state.updates.find((u) => u.id === id)?.attachments,
  ]);
  commit({ ...state, updates: state.updates.filter((u) => u.id !== id) });
  remote((sb) => sb.from("updates").delete().eq("id", id));
}

export function addNote(input: Omit<Note, "id" | "createdAt">) {
  const note: Note = { ...input, id: uid(), createdAt: Date.now() };
  commit({ ...state, notes: [note, ...state.notes] });
  remote((sb) => sb.from("notes").insert(noteToRow(note)));
}

export function deleteNote(id: string) {
  removeAttachmentFiles([state.notes.find((n) => n.id === id)?.attachments]);
  commit({ ...state, notes: state.notes.filter((n) => n.id !== id) });
  remote((sb) => sb.from("notes").delete().eq("id", id));
}

export function sendNotification(
  input: Omit<AppNotification, "id" | "createdAt" | "read">
) {
  const n: AppNotification = {
    ...input,
    id: uid(),
    read: false,
    createdAt: Date.now(),
  };
  commit({ ...state, notifications: [n, ...state.notifications] });
  remote((sb) => sb.from("notifications").insert(notificationToRow(n)));
}

export function markNotificationRead(id: string) {
  commit({
    ...state,
    notifications: state.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  });
  remote((sb) => sb.from("notifications").update({ read: true }).eq("id", id));
}

export function markAllNotificationsRead() {
  commit({
    ...state,
    notifications: state.notifications.map((n) => ({ ...n, read: true })),
  });
  remote((sb) =>
    sb.from("notifications").update({ read: true }).eq("read", false)
  );
}

export function addMessage(input: Omit<ChatMessage, "id" | "createdAt">) {
  const m: ChatMessage = { ...input, id: uid(), createdAt: Date.now() };
  commit({ ...state, messages: [...state.messages, m] });
  remote((sb) => sb.from("messages").insert(messageToRow(m)));
}
