"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProject, updateProject } from "@/lib/store";
import type { Project, ProjectLink } from "@/lib/types";
import { ACCENTS } from "@/lib/util";
import { Modal } from "./ui/Modal";
import { IsoBadge } from "./IsoBadge";
import { StatusBadge } from "./StatusBadge";

const STATUSES: Project["status"][] = ["planning", "active", "paused"];

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "?"
  );
}

function normalizeUrl(url: string): string {
  const u = url.trim();
  if (!u) return "";
  return /^https?:\/\//i.test(u) ? u : `https://${u}`;
}

/** Create a new project, or edit an existing one when `project` is given. */
export function NewProjectModal({
  open,
  onClose,
  project,
}: {
  open: boolean;
  onClose: () => void;
  project?: Project;
}) {
  // Modal unmounts its children when closed, so ProjectForm re-initializes
  // its state from props on every open.
  if (!open) return null;
  return <ProjectForm onClose={onClose} project={project} />;
}

function ProjectForm({
  onClose,
  project,
}: {
  onClose: () => void;
  project?: Project;
}) {
  const router = useRouter();
  const editing = Boolean(project);
  const [name, setName] = useState(project?.name ?? "");
  const [tagline, setTagline] = useState(project?.tagline ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [accent, setAccent] = useState(project?.accent ?? ACCENTS[0]);
  const [status, setStatus] = useState<Project["status"]>(
    project?.status ?? "planning"
  );
  const [links, setLinks] = useState<ProjectLink[]>(project?.links ?? []);

  const submit = () => {
    if (!name.trim()) return;
    const cleanLinks = links
      .map((l) => ({ label: l.label.trim(), url: normalizeUrl(l.url) }))
      .filter((l) => l.label && l.url);
    if (editing && project) {
      updateProject(project.id, {
        name,
        tagline: tagline.trim(),
        description: description.trim(),
        accent,
        status,
        links: cleanLinks,
      });
      onClose();
    } else {
      const created = addProject({
        name,
        tagline,
        description,
        accent,
        status,
        links: cleanLinks,
      });
      onClose();
      router.push(`/project/${created.id}`);
    }
  };

  return (
    <Modal
      open
      onClose={onClose}
      title={editing ? "Edit layer" : "New layer"}
    >
      {/* Live preview of the layer */}
      <div className="mb-5 flex items-center gap-4 rounded-xl border border-dashed border-border-strong px-4 py-3">
        <IsoBadge
          logo={project?.logo}
          logos={project?.logos}
          wide={project?.logoWide}
          fallback={initialsOf(name)}
          accent={accent}
          size={56}
        />
        <div className="min-w-0">
          <p className="truncate text-sm font-semibold">
            {name.trim() || "Untitled project"}
          </p>
          <p className="truncate text-xs text-muted">
            {tagline.trim() ||
              (editing ? "\u00A0" : "Joins the bottom of the stack")}
          </p>
        </div>
        <span className="eyebrow ml-auto shrink-0" style={{ color: accent }}>
          {editing ? "[ edit ]" : "[ new ]"}
        </span>
      </div>

      <div className="space-y-4">
        <label className="block">
          <span className="form-label">Name</span>
          <input
            autoFocus={!editing}
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Roadmap"
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="form-label">Tagline</span>
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="One short line about it"
            className="field-input"
          />
        </label>
        <label className="block">
          <span className="form-label">Description</span>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="field-input resize-none"
          />
        </label>

        <div>
          <span className="form-label">Status</span>
          <div className="flex flex-wrap gap-2">
            {STATUSES.map((s) => (
              <button
                key={s}
                onClick={() => setStatus(s)}
                className={`rounded-full transition ${
                  status === s
                    ? "ring-1 ring-foreground"
                    : "opacity-55 hover:opacity-100"
                }`}
                aria-label={`Status ${s}`}
              >
                <StatusBadge status={s} />
              </button>
            ))}
          </div>
        </div>

        <div>
          <span className="form-label">Links</span>
          <div className="space-y-2">
            {links.map((l, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  value={l.label}
                  onChange={(e) =>
                    setLinks((ls) =>
                      ls.map((x, j) =>
                        j === i ? { ...x, label: e.target.value } : x
                      )
                    )
                  }
                  placeholder="Label"
                  className="field-input w-32 shrink-0"
                />
                <input
                  value={l.url}
                  onChange={(e) =>
                    setLinks((ls) =>
                      ls.map((x, j) =>
                        j === i ? { ...x, url: e.target.value } : x
                      )
                    )
                  }
                  placeholder="https://…"
                  className="field-input"
                />
                <button
                  onClick={() =>
                    setLinks((ls) => ls.filter((_, j) => j !== i))
                  }
                  className="shrink-0 text-subtle transition hover:text-red-600"
                  aria-label="Remove link"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M18 6 6 18M6 6l12 12" />
                  </svg>
                </button>
              </div>
            ))}
            <button
              onClick={() => setLinks((ls) => [...ls, { label: "", url: "" }])}
              className="flex items-center gap-1.5 font-mono text-[11px] font-semibold uppercase tracking-[0.12em] text-muted transition hover:text-foreground"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Add link
            </button>
          </div>
        </div>

        <div>
          <span className="form-label">Accent</span>
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`h-7 w-7 rounded-full transition ${
                  accent === c ? "ring-2 ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{
                  background: c,
                  boxShadow: accent === c ? `0 0 0 2px ${c}` : undefined,
                }}
                aria-label={`Accent ${c}`}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button onClick={submit} disabled={!name.trim()} className="btn-primary">
          {editing ? "Save changes" : "Add to stack"}
        </button>
      </div>
    </Modal>
  );
}
