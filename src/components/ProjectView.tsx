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
  useStore,
} from "@/lib/store";
import { useIdentity } from "@/lib/identity";
import type { Attachment, UpdateKind } from "@/lib/types";
import { formatDate, timeAgo } from "@/lib/util";
import { TopBar } from "./TopBar";
import { StatusBadge } from "./StatusBadge";
import { ChatPanel } from "./ChatPanel";
import { NotificationComposer } from "./NotificationComposer";
import { AttachmentEditor, AttachmentView } from "./Attachments";
import { GlassSphere } from "./GlassSphere";

const KIND_META: Record<UpdateKind, { label: string; color: string }> = {
  update: { label: "Update", color: "#4f46e5" },
  milestone: { label: "Milestone", color: "#10b981" },
  release: { label: "Release", color: "#0ea5e9" },
  blocker: { label: "Blocker", color: "#ef4444" },
};

export function ProjectView({ projectId }: { projectId: string }) {
  const { projects, updates, notes } = useStore();
  const me = useIdentity();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [tab, setTab] = useState<"updates" | "notes">(
    searchParams.get("tab") === "notes" ? "notes" : "updates"
  );
  const [notifyOpen, setNotifyOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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
            Back to g-world
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

  return (
    <div className="flex min-h-screen flex-col">
      <TopBar />

      <div className="flex flex-1">
        <main className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-3xl px-6 py-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-surface py-1 pl-1 pr-3 transition hover:border-border-strong"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-background">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
                </svg>
              </span>
              <span className="text-sm font-medium">home</span>
            </Link>

            {/* Header */}
            <div className="mt-5 animate-fade-up">
              <div className="flex items-start gap-4">
                <GlassSphere
                  logo={project.logo}
                  fallback={project.initials}
                  size={56}
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-3">
                    <h1 className="truncate text-2xl font-semibold tracking-tight">
                      {project.name}
                    </h1>
                    <StatusBadge status={project.status} />
                  </div>
                  <p className="mt-1 text-[15px] text-muted">
                    {project.tagline}
                  </p>
                </div>

                <div className="relative flex items-center gap-2">
                  <button
                    onClick={() => setNotifyOpen(true)}
                    className="btn-primary"
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

              {project.description && (
                <p className="mt-4 rounded-xl border border-border bg-surface px-4 py-3 text-sm leading-relaxed text-muted">
                  {project.description}
                </p>
              )}

              <p className="mt-3 text-xs text-subtle">
                Created {formatDate(project.createdAt)}
              </p>
            </div>

            {/* Tabs */}
            <div className="mt-8 flex items-center gap-1 border-b border-border">
              <TabButton
                active={tab === "updates"}
                onClick={() => setTab("updates")}
                label="Updates"
                count={projectUpdates.length}
              />
              <TabButton
                active={tab === "notes"}
                onClick={() => setTab("notes")}
                label="Notes & comments"
                count={projectNotes.length}
              />
            </div>

            <div className="py-6">
              {tab === "updates" ? (
                <UpdatesTab
                  projectId={project.id}
                  me={me}
                  updates={projectUpdates}
                />
              ) : (
                <NotesTab projectId={project.id} me={me} notes={projectNotes} />
              )}
            </div>
          </div>
        </main>

        <div className="sticky top-14 hidden h-[calc(100vh-3.5rem)] w-[360px] shrink-0 lg:block">
          <ChatPanel project={project} />
        </div>
      </div>

      <NotificationComposer
        project={project}
        open={notifyOpen}
        onClose={() => setNotifyOpen(false)}
      />
    </div>
  );
}

function TabButton({
  active,
  onClick,
  label,
  count,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  count: number;
}) {
  return (
    <button
      onClick={onClick}
      className={`-mb-px border-b-2 px-3 pb-2.5 pt-1 text-sm font-medium transition ${
        active
          ? "border-foreground text-foreground"
          : "border-transparent text-muted hover:text-foreground"
      }`}
    >
      {label}
      <span
        className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[11px] ${
          active ? "bg-foreground text-background" : "bg-border text-subtle"
        }`}
      >
        {count}
      </span>
    </button>
  );
}

function UpdatesTab({
  projectId,
  me,
  updates,
}: {
  projectId: string;
  me: string;
  updates: ReturnType<typeof useStore>["updates"];
}) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [kind, setKind] = useState<UpdateKind>("update");
  const [attachments, setAttachments] = useState<Attachment[]>([]);

  const submit = () => {
    if (!title.trim()) return;
    addUpdate({
      projectId,
      author: me,
      title: title.trim(),
      body: body.trim(),
      kind,
      attachments: attachments.length ? attachments : undefined,
    });
    setTitle("");
    setBody("");
    setKind("update");
    setAttachments([]);
    setOpen(false);
  };

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

      {updates.length === 0 ? (
        <EmptyState
          title="No updates yet"
          subtitle="Post the first update to start the timeline."
        />
      ) : (
        <ol className="relative space-y-1">
          {updates.map((u, i) => (
            <li key={u.id} className="relative flex gap-4 pb-6">
              <div className="flex flex-col items-center">
                <span
                  className="mt-1 h-2.5 w-2.5 shrink-0 rounded-full ring-4 ring-background"
                  style={{ background: KIND_META[u.kind].color }}
                />
                {i < updates.length - 1 && (
                  <span className="mt-1 w-px flex-1 bg-border" />
                )}
              </div>
              <div className="group min-w-0 flex-1 rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong">
                <div className="flex items-center gap-2">
                  <span
                    className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-white"
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

function NotesTab({
  projectId,
  me,
  notes,
}: {
  projectId: string;
  me: string;
  notes: ReturnType<typeof useStore>["notes"];
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
              className="group flex gap-3 rounded-xl border border-border bg-surface p-4 transition hover:border-border-strong"
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

function EmptyState({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className="flex flex-col items-center rounded-xl border border-dashed border-border py-14 text-center">
      <p className="text-sm font-medium">{title}</p>
      <p className="mt-1 text-xs text-subtle">{subtitle}</p>
    </div>
  );
}
