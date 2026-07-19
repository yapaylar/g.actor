"use client";

import { useSyncExternalStore } from "react";
import type {
  AppNotification,
  AppState,
  ChatMessage,
  Note,
  Project,
  Update,
} from "./types";

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

let state: AppState | null = null;
const listeners = new Set<() => void>();

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

function load(): AppState {
  if (typeof window === "undefined") return emptyState();
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      const seeded = seed();
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(seeded));
      return seeded;
    }
    const stored = JSON.parse(raw) as AppState;
    return syncSeedVisuals(stored);
  } catch {
    return seed();
  }
}

const EMPTY_STATE: AppState = {
  projects: [],
  updates: [],
  notes: [],
  notifications: [],
  messages: [],
};

function emptyState(): AppState {
  return EMPTY_STATE;
}

function ensure(): AppState {
  if (state === null) state = load();
  return state;
}

function commit(next: AppState) {
  state = next;
  if (typeof window !== "undefined") {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    } catch {
      // Likely storage quota exceeded (e.g. large attachments).
      if (typeof window !== "undefined") {
        window.alert(
          "Couldn't save — local storage is full. Try removing some large attachments."
        );
      }
    }
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AppState {
  return ensure();
}

function getServerSnapshot(): AppState {
  return emptyState();
}

export function useStore(): AppState {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

// ---- Mutations ----

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
  const s = ensure();
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
  commit({ ...s, projects: [...s.projects, project] });
  return project;
}

export function updateProject(
  projectId: string,
  patch: Partial<
    Pick<
      Project,
      "name" | "tagline" | "description" | "accent" | "status" | "links"
    >
  >
) {
  const s = ensure();
  commit({
    ...s,
    projects: s.projects.map((p) => {
      if (p.id !== projectId) return p;
      const next = { ...p, ...patch };
      if (patch.name !== undefined) {
        next.name = patch.name.trim() || p.name;
        next.initials = initialsOf(next.name);
      }
      if (patch.links !== undefined) {
        next.links = patch.links.length ? patch.links : undefined;
      }
      return next;
    }),
  });
}

export function deleteProject(projectId: string) {
  const s = ensure();
  commit({
    projects: s.projects.filter((p) => p.id !== projectId),
    updates: s.updates.filter((u) => u.projectId !== projectId),
    notes: s.notes.filter((n) => n.projectId !== projectId),
    notifications: s.notifications.filter((n) => n.projectId !== projectId),
    messages: s.messages.filter((m) => m.projectId !== projectId),
  });
}

export function addUpdate(input: Omit<Update, "id" | "createdAt">) {
  const s = ensure();
  const update: Update = { ...input, id: uid(), createdAt: Date.now() };
  commit({ ...s, updates: [update, ...s.updates] });
}

export function deleteUpdate(id: string) {
  const s = ensure();
  commit({ ...s, updates: s.updates.filter((u) => u.id !== id) });
}

export function addNote(input: Omit<Note, "id" | "createdAt">) {
  const s = ensure();
  const note: Note = { ...input, id: uid(), createdAt: Date.now() };
  commit({ ...s, notes: [note, ...s.notes] });
}

export function deleteNote(id: string) {
  const s = ensure();
  commit({ ...s, notes: s.notes.filter((n) => n.id !== id) });
}

export function sendNotification(input: Omit<AppNotification, "id" | "createdAt" | "read">) {
  const s = ensure();
  const n: AppNotification = {
    ...input,
    id: uid(),
    read: false,
    createdAt: Date.now(),
  };
  commit({ ...s, notifications: [n, ...s.notifications] });
}

export function markNotificationRead(id: string) {
  const s = ensure();
  commit({
    ...s,
    notifications: s.notifications.map((n) =>
      n.id === id ? { ...n, read: true } : n
    ),
  });
}

export function markAllNotificationsRead() {
  const s = ensure();
  commit({
    ...s,
    notifications: s.notifications.map((n) => ({ ...n, read: true })),
  });
}

export function addMessage(input: Omit<ChatMessage, "id" | "createdAt">) {
  const s = ensure();
  const m: ChatMessage = { ...input, id: uid(), createdAt: Date.now() };
  commit({ ...s, messages: [...s.messages, m] });
}

export function resetAll() {
  commit(seed());
}
