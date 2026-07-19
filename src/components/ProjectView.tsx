"use client";

import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import {
  addNote,
  addUpdate,
  deleteNote,
  deleteProject,
  deleteUpdate,
  sendNotification,
  updateProject,
  useStore,
} from "@/lib/store";
import { useIdentity } from "@/lib/identity";
import type { Attachment, Note, Project, Update, UpdateKind } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/util";
import { TopBar } from "./TopBar";
import { ChatPanel } from "./ChatPanel";
import { NotificationComposer } from "./NotificationComposer";
import { AttachmentEditor, AttachmentView } from "./Attachments";
import { IsoBadge } from "./IsoBadge";
import { LinkChip } from "./ProjectStack";
import { NewProjectModal } from "./NewProjectModal";

const KIND_META: Record<UpdateKind, { label: string; color: string }> = {
  update: { label: "Update", color: "#4f46e5" },
  milestone: { label: "Milestone", color: "#10b981" },
  release: { label: "Release", color: "#0ea5e9" },
  blocker: { label: "Blocker", color: "#ef4444" },
};

type Tab = "updates" | "notes" | "files";

export function ProjectView({ projectId }: { projectId: string }) {
  const { projects, updates, notes, messages } = useStore();
  const me = useIdentity();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<Tab>(
    searchParams.get("tab") === "notes" ? "notes" : "updates"
  );
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [chatOpen, setChatOpen] = useState(false);

  const project = projects.find((p) => p.id === projectId);

  const projectUpdates = updates
    .filter((u) => u.projectId === projectId)
    .sort((a, b) => b.createdAt - a.createdAt);
  const projectNotes = notes
    .filter((n) => n.projectId === projectId)
    .sort((a, b) => b.createdAt - a.createdAt);

  if (!project) {
    return (
      <div className="min-h-screen">
        <TopBar />
        <div className="mx-auto flex max-w-md flex-col items-center px-6 py-32 text-center">
          <h1 className="text-xl font-semibold">Project not found</h1>
          <p className="mt-2 text-sm text-muted">
            It may have been removed or never existed.
          </p>
          <Link href="/" className="btn-primary mt-6">
            Back to g.actor
          </Link>
        </div>
      </div>
    );
  }

  const remove = () => {
    if (confirm(`Delete "${project.name}"? This cannot be undone.`)) {
      deleteProject(project.id);
      router.push("/");
    }
  };

  const fileCount =
    projectUpdates.reduce((n, u) => n + (u.attachments?.length ?? 0), 0) +
    projectNotes.reduce((n, x) => n + (x.attachments?.length ?? 0), 0);
  const lastActivity = Math.max(
    0,
    ...projectUpdates.map((u) => u.createdAt),
    ...projectNotes.map((n) => n.createdAt),
    ...messages.filter((m) => m.projectId === projectId).map((m) => m.createdAt)
  );

  return (
    <div
      className="flex min-h-screen flex-col"
      style={{ "--accent": project.accent } as React.CSSProperties}
    >
      <TopBar />

      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-4 py-6 pb-24 sm:px-6 sm:py-8 lg:pb-8">
            {/* Header */}
            <div
              className="animate-fade-up relative overflow-hidden rounded-2xl border border-border px-4 py-4 sm:px-6 sm:py-5"
              style={{
                background: `linear-gradient(135deg, color-mix(in srgb, ${project.accent} 8%, var(--surface)) 0%, var(--surface) 60%)`,
              }}
            >
              <div className="flex flex-wrap items-start gap-3 sm:gap-4">
                <IsoBadge
                  logo={project.logo}
                  logos={project.logos}
                  wide={project.logoWide}
                  fallback={project.initials}
                  accent={project.accent}
                  size={64}
                />
                <div className="min-w-0 flex-1 basis-40">
                  <p
                    className="eyebrow whitespace-nowrap"
                    style={{ color: project.accent }}
                  >
                    [ {project.status} layer ]
                  </p>
                  <h1 className="mt-0.5 truncate text-xl font-semibold tracking-tight sm:text-2xl">
                    {project.name}
                  </h1>
                  <p className="mt-0.5 text-sm text-muted sm:text-[15px]">
                    {project.tagline}
                  </p>
                </div>

                <div className="relative flex items-center gap-2">
                  <button
                    onClick={() => setNotifyOpen(true)}
                    className="btn-ghost"
                  >
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                      <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
                    </svg>
                    Notify
                  </button>
                  <button
                    onClick={() => setMenuOpen((o) => !o)}
                    onBlur={() => setTimeout(() => setMenuOpen(false), 150)}
                    className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted transition hover:text-foreground hover:border-border-strong"
                    aria-label="More"
                  >
                    <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                      <circle cx="5" cy="12" r="1.6" />
                      <circle cx="12" cy="12" r="1.6" />
                      <circle cx="19" cy="12" r="1.6" />
                    </svg>
                  </button>
                  {menuOpen && (
                    <div className="absolute right-0 top-11 z-30 w-40 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-xl animate-pop-in">
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          setEditOpen(true);
                        }}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm transition hover:bg-background"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
                        </svg>
                        Edit project
                      </button>
                      <button
                        onClick={remove}
                        className="flex w-full items-center gap-2 px-3 py-2.5 text-left text-sm text-red-600 transition hover:bg-background"
                      >
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                        </svg>
                        Delete project
                      </button>
                    </div>
                  )}
                </div>
              </div>

              {(project.links?.length ?? 0) > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {project.links!.map((l) => (
                    <LinkChip key={`${l.label}-${l.url}`} link={l} />
                  ))}
                </div>
              )}

              {/* Stats strip */}
              <div className="mt-4 flex flex-wrap items-center gap-x-4 gap-y-1.5 border-t border-dashed border-border-strong pt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
                <Stat label="Updates" value={String(projectUpdates.length).padStart(2, "0")} accent={project.accent} />
                <Stat label="Notes" value={String(projectNotes.length).padStart(2, "0")} accent={project.accent} />
                <Stat label="Files" value={String(fileCount).padStart(2, "0")} accent={project.accent} />
                <Stat
                  label="Last activity"
                  value={lastActivity ? timeAgo(lastActivity) : "—"}
                  accent={project.accent}
                />
                <Stat label="Created" value={formatDate(project.createdAt)} accent={project.accent} />
              </div>
            </div>

            {/* Now / focus band */}
            <FocusBand project={project} />

            {project.description && (
              <p
                className="mt-5 border-l border-dashed py-0.5 pl-4 text-sm leading-relaxed text-muted"
                style={{
                  borderColor: `color-mix(in srgb, ${project.accent} 45%, var(--border-strong))`,
                }}
              >
                {project.description}
              </p>
            )}

            {/* Tabs */}
            <div className="mt-6 flex items-center gap-1 overflow-x-auto border-b border-border">
              <TabButton
                active={tab === "updates"}
                onClick={() => setTab("updates")}
                index={1}
                label="Updates"
                count={projectUpdates.length}
              />
              <TabButton
                active={tab === "notes"}
                onClick={() => setTab("notes")}
                index={2}
                label="Notes"
                count={projectNotes.length}
              />
              <TabButton
                active={tab === "files"}
                onClick={() => setTab("files")}
                index={3}
                label="Files"
                count={fileCount}
              />
            </div>

            <div className="py-5">
              {tab === "updates" ? (
                <UpdatesTab
                  project={project}
                  me={me}
                  updates={projectUpdates}
                />
              ) : tab === "notes" ? (
                <NotesTab projectId={project.id} me={me} notes={projectNotes} />
              ) : (
                <FilesTab updates={projectUpdates} notes={projectNotes} />
              )}
            </div>
          </div>
        </main>

        <div className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[360px] shrink-0 lg:block">
          <ChatPanel project={project} />
        </div>
      </div>

      {/* Mobile chat: floating button + bottom sheet */}
      <button
        onClick={() => setChatOpen(true)}
        className="fixed bottom-5 right-5 z-40 grid h-12 w-12 place-items-center rounded-full text-white shadow-lg transition active:scale-95 lg:hidden"
        style={{ background: project.accent }}
        aria-label="Open team chat"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
        </svg>
      </button>
      {chatOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="absolute inset-0 bg-black/30 backdrop-blur-[2px] animate-fade-up"
            onClick={() => setChatOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 h-[78dvh] overflow-hidden rounded-t-2xl border-t border-border-strong bg-surface shadow-2xl animate-fade-up">
            <ChatPanel project={project} onClose={() => setChatOpen(false)} />
          </div>
        </div>
      )}

      <NotificationComposer
        project={project}
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
      <NewProjectModal
        open={editOpen}
        onClose={() => setEditOpen(false)}
        project={project}
      />
    </div>
  );
}

function Stat({
  label,
  value,
  accent,
}: {
  label: string;
  value: string;
  accent: string;
}) {
  return (
    <span className="inline-flex items-baseline gap-1.5 whitespace-nowrap">
      {label}
      <span className="font-semibold" style={{ color: accent }}>
        {value}
      </span>
    </span>
  );
}

function FocusBand({ project }: { project: Project }) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  const save = () => {
    updateProject(project.id, { focus: draft });
    setEditing(false);
  };

  if (editing) {
    return (
      <div
        className="mt-4 flex items-center gap-2 rounded-xl border border-dashed px-4 py-3"
        style={{
          borderColor: `color-mix(in srgb, ${project.accent} 50%, var(--border-strong))`,
        }}
      >
        <span className="eyebrow shrink-0" style={{ color: project.accent }}>
          [ Now ]
        </span>
        <input
          autoFocus
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          onBlur={save}
          onKeyDown={(e) => {
            if (e.key === "Enter") save();
            if (e.key === "Escape") setEditing(false);
          }}
          placeholder="What is the team on right now?"
          className="w-full bg-transparent text-sm outline-none placeholder:text-subtle"
        />
      </div>
    );
  }

  if (!project.focus) {
    return (
      <button
        onClick={() => {
          setDraft("");
          setEditing(true);
        }}
        className="mt-4 flex w-full items-center gap-2 rounded-xl border border-dashed border-border-strong px-4 py-3 text-left text-sm text-subtle transition hover:border-foreground hover:text-foreground"
      >
        <span className="eyebrow shrink-0">[ Now ]</span>
        Set the current focus…
      </button>
    );
  }

  return (
    <div
      className="group mt-4 flex items-center gap-3 rounded-xl border border-dashed px-4 py-3"
      style={{
        borderColor: `color-mix(in srgb, ${project.accent} 50%, var(--border-strong))`,
        background: `color-mix(in srgb, ${project.accent} 4%, var(--surface))`,
      }}
    >
      <span className="eyebrow shrink-0" style={{ color: project.accent }}>
        [ Now ]
      </span>
      <p className="min-w-0 flex-1 text-sm font-medium">{project.focus}</p>
      <button
        onClick={() => {
          setDraft(project.focus ?? "");
          setEditing(true);
        }}
        className="shrink-0 text-subtle transition hover:text-foreground sm:opacity-0 sm:group-hover:opacity-100"
        aria-label="Edit focus"
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
        </svg>
      </button>
    </div>
  );
}

function TabButton({
  active,
  onClick,
  index,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  index: number;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px flex shrink-0 items-center gap-1.5 whitespace-nowrap border-b-2 px-2 pb-2.5 pt-1 font-mono text-xs font-semibold uppercase tracking-[0.12em] transition sm:gap-2 sm:px-3 ${
        active
          ? "border-[var(--accent)] text-foreground"
          : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      <span
        className={`hidden sm:inline ${
          active ? "text-[var(--accent)]" : "text-subtle"
        }`}
      >
        {String(index).padStart(2, "0")}
      </span>
      {label}
      <span
        className={`rounded-full px-1.5 py-0.5 text-[10px] ${
          active ? "bg-foreground text-background" : "bg-border text-subtle"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function UpdatesTab({
  project,
  me,
  updates,
}: {
  project: Project;
  me: string;
  updates: Update[];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<UpdateKind>("update");
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [notifyTeam, setNotifyTeam] = useState(false);
  const [filter, setFilter] = useState<UpdateKind | "all">("all");

  const submit = () => {
    if (!title.trim()) return;
    addUpdate({
      projectId: project.id,
      author: me,
      title: title.trim(),
      body: body.trim(),
      kind,
      attachments: attachments.length ? attachments : undefined,
    });
    if (notifyTeam) {
      sendNotification({
        projectId: project.id,
        title: `${project.name}: ${title.trim()}`,
        body: body.trim() || KIND_META[kind].label,
        audience: "Team",
      });
    }
    setTitle("");
    setBody("");
    setKind("update");
    setAttachments([]);
    setNotifyTeam(false);
    setOpen(false);
  };

  const kindCounts = updates.reduce(
    (acc, u) => ({ ...acc, [u.kind]: (acc[u.kind] ?? 0) + 1 }),
    {} as Partial<Record<UpdateKind, number>>
  );
  const visible =
    filter === "all" ? updates : updates.filter((u) => u.kind === filter);

  return (
    <div>
      {open ? (
        <div className="mb-6 rounded-xl border border-border-strong bg-surface p-4 animate-pop-in">
          <input
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Update title"
            className="field-input"
          />
          <textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Share what's new…"
            rows={3}
            className="field-input mt-2 resize-none"
          />
          <AttachmentEditor attachments={attachments} onChange={setAttachments} />
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
            <div className="flex flex-wrap gap-1.5">
              {(Object.keys(KIND_META) as UpdateKind[]).map((k) => (
                <button
                  key={k}
                  onClick={() => setKind(k)}
                  className={`rounded-full border px-2.5 py-1 text-xs font-medium transition ${
                    kind === k
                      ? "text-white"
                      : "border-border-strong bg-surface text-muted hover:text-foreground"
                  }`}
                  style={
                    kind === k
                      ? {
                          background: KIND_META[k].color,
                          borderColor: KIND_META[k].color,
                        }
                      : undefined
                  }
                >
                  {KIND_META[k].label}
                </button>
              ))}
            </div>
            <div className="flex gap-2">
              <button onClick={() => setOpen(false)} className="btn-ghost">
                Cancel
              </button>
              <button onClick={submit} disabled={!title.trim()} className="btn-primary">
                Post update
              </button>
            </div>
          </div>
          <label className="mt-3 flex w-fit cursor-pointer items-center gap-2 font-mono text-[11px] uppercase tracking-[0.12em] text-muted">
            <input
              type="checkbox"
              checked={notifyTeam}
              onChange={(e) => setNotifyTeam(e.target.checked)}
              className="h-3.5 w-3.5 accent-[var(--accent)]"
            />
            Also notify the team
          </label>
        </div>
      ) : (
        <button
          onClick={() => setOpen(true)}
          className="mb-6 flex w-full items-center gap-2 rounded-xl border border-dashed border-border-strong bg-surface px-4 py-3 text-sm text-muted transition hover:border-foreground hover:text-foreground"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          Post an update
        </button>
      )}

      {updates.length > 1 && (
        <div className="mb-5 flex flex-wrap items-center gap-1.5">
          <FilterChip
            label="All"
            count={updates.length}
            active={filter === "all"}
            onClick={() => setFilter("all")}
          />
          {(Object.keys(KIND_META) as UpdateKind[])
            .filter((k) => kindCounts[k])
            .map((k) => (
              <FilterChip
                key={k}
                label={KIND_META[k].label}
                count={kindCounts[k]!}
                color={KIND_META[k].color}
                active={filter === k}
                onClick={() => setFilter(filter === k ? "all" : k)}
              />
            ))}
        </div>
      )}

      {updates.length === 0 ? (
        <EmptyState
          title="No updates yet"
          subtitle="Post the first update to start the timeline."
        />
      ) : (
        <ol className="relative space-y-1">
          {visible.map((u, i) => (
            <li key={u.id} className="relative flex gap-4 pb-6">
              <div className="flex flex-col items-center">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background"
                  style={{ background: KIND_META[u.kind].color }}
                />
                {i < visible.length - 1 && (
                  <span className="mt-1 w-0 flex-1 border-l border-dashed border-border-strong" />
                )}
              </div>
              <div className="group accent-card min-w-0 flex-1 rounded-xl p-4">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 font-mono text-[10px] font-semibold uppercase tracking-wide text-white"
                    style={{ background: KIND_META[u.kind].color }}
                  >
                    {KIND_META[u.kind].label}
                  </span>
                  <span className="text-sm font-semibold">{u.title}</span>
                  <button
                    onClick={() => deleteUpdate(u.id)}
                    className="ml-auto text-subtle opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                    aria-label="Delete update"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {u.body && (
                  <p className="mt-1.5 whitespace-pre-wrap text-sm text-muted">
                    {u.body}
                  </p>
                )}
                <AttachmentView attachments={u.attachments} />
                <p className="mt-2 text-xs text-subtle">
                  {u.author} · {timeAgo(u.createdAt)}
                </p>
              </div>
            </li>
          ))}
        </ol>
      )}
    </div>
  );
}

function FilterChip({
  label,
  count,
  color,
  active,
  onClick,
}: {
  label: string;
  count: number;
  color?: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 font-mono text-[10px] font-semibold uppercase tracking-[0.1em] transition ${
        active
          ? "border-foreground bg-foreground text-background"
          : "border-border-strong bg-surface text-muted hover:text-foreground"
      }`}
    >
      {color && (
        <span
          className="h-1.5 w-1.5 rounded-full"
          style={{ background: color }}
        />
      )}
      {label}
      <span className={active ? "opacity-70" : "text-subtle"}>{count}</span>
    </button>
  );
}

function NotesTab({
  projectId,
  me,
  notes,
}: {
  projectId: string;
  me: string;
  notes: Note[];
}) {
  const [body, setBody] = useState("");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const submit = () => {
    if (!body.trim() && attachments.length === 0) return;
    addNote({
      projectId,
      author: me,
      body: body.trim(),
      attachments: attachments.length ? attachments : undefined,
    });
    setBody("");
    setAttachments([]);
  };

  return (
    <div>
      <div className="mb-6 rounded-xl border border-border-strong bg-surface p-3">
        <textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          onKeyDown={(e) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "Enter") submit();
          }}
          placeholder="Leave a note or comment for the team…"
          rows={3}
          className="field-input resize-none border-0 bg-transparent p-1 focus:border-0"
        />
        <div className="flex items-center justify-between gap-2">
          <AttachmentEditor attachments={attachments} onChange={setAttachments} />
          <button
            onClick={submit}
            disabled={!body.trim() && attachments.length === 0}
            className="btn-primary shrink-0"
          >
            Add note
          </button>
        </div>
      </div>

      {notes.length === 0 ? (
        <EmptyState
          title="No notes yet"
          subtitle="Notes and comments from the team will show up here."
        />
      ) : (
        <div className="space-y-3">
          {notes.map((n) => (
            <div
              key={n.id}
              className="group accent-card flex gap-3 rounded-xl p-4"
            >
              <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-background text-xs font-semibold text-muted">
                {n.author.slice(0, 2).toUpperCase()}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-semibold">{n.author}</span>
                  <span className="text-xs text-subtle">{timeAgo(n.createdAt)}</span>
                  <button
                    onClick={() => deleteNote(n.id)}
                    className="ml-auto text-subtle opacity-0 transition hover:text-red-600 group-hover:opacity-100"
                    aria-label="Delete note"
                  >
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </div>
                {n.body && (
                  <p className="mt-1 whitespace-pre-wrap break-words text-sm text-foreground">
                    {n.body}
                  </p>
                )}
                <AttachmentView attachments={n.attachments} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function FilesTab({ updates, notes }: { updates: Update[]; notes: Note[] }) {
  const items = [
    ...updates.flatMap((u) =>
      (u.attachments ?? []).map((a) => ({
        attachment: a,
        source: u.title,
        sourceKind: "Update" as const,
        author: u.author,
        createdAt: u.createdAt,
      }))
    ),
    ...notes.flatMap((n) =>
      (n.attachments ?? []).map((a) => ({
        attachment: a,
        source: n.body.slice(0, 60) || "Note",
        sourceKind: "Note" as const,
        author: n.author,
        createdAt: n.createdAt,
      }))
    ),
  ].sort((x, y) => y.createdAt - x.createdAt);

  if (items.length === 0) {
    return (
      <EmptyState
        title="No files yet"
        subtitle="Images and files attached to updates or notes will be collected here."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2">
      {items.map(({ attachment: a, source, sourceKind, author, createdAt }) => (
        <div key={a.id} className="accent-card overflow-hidden rounded-xl">
          {a.type.startsWith("image/") ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={a.dataUrl}
              alt={a.name}
              className="h-36 w-full border-b border-border object-cover"
            />
          ) : (
            <div className="grid h-20 place-items-center border-b border-dashed border-border bg-background text-subtle">
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                <path d="M14 2v6h6" />
              </svg>
            </div>
          )}
          <div className="p-3">
            <div className="flex items-center justify-between gap-2">
              <p className="min-w-0 truncate text-sm font-medium">{a.name}</p>
              <a
                href={a.dataUrl}
                download={a.name}
                className="shrink-0 text-subtle transition hover:text-foreground"
                aria-label={`Download ${a.name}`}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            </div>
            <p className="mt-1.5 truncate font-mono text-[10px] uppercase tracking-[0.1em] text-subtle">
              {sourceKind} · {source}
            </p>
            <p className="mt-0.5 text-xs text-subtle">
              {author} · {timeAgo(createdAt)}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-subtle">{subtitle}</p>
    </div>
  );
}
