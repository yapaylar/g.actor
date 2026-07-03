"use client";

import Link from "next/link";
import type { Project, ProjectLink } from "@/lib/types";
import { GlassSphere } from "./GlassSphere";

export function ProjectCard({ project }: { project: Project }) {
  const links = project.links ?? [];

  return (
    <div className="mx-auto flex w-full max-w-[240px] flex-col items-center gap-3">
      <Link
        href={`/project/${project.id}`}
        className="group flex w-full flex-col items-center text-center"
      >
        <GlassSphere logo={project.logo} fallback={project.initials} size={132} />
        <h3 className="mt-4 text-[15px] font-semibold tracking-tight text-foreground">
          {project.name}
        </h3>
      </Link>

      {links.length > 0 && <WebsiteLinks links={links} />}
    </div>
  );
}

function WebsiteLinks({ links }: { links: ProjectLink[] }) {
  return (
    <div className="flex w-full flex-wrap items-center justify-center gap-x-4 gap-y-1.5 rounded-xl border border-border bg-surface px-4 py-2.5">
      {links.map((l) => {
        const brand = brandOf(l.label);
        return (
          <a
            key={l.url}
            href={l.url}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 text-xs font-medium text-muted transition hover:text-foreground"
          >
            {brand === "linkedin" ? (
              <LinkedInIcon />
            ) : brand === "x" ? (
              <XIcon />
            ) : (
              <GlobeIcon />
            )}
            {l.label}
          </a>
        );
      })}
    </div>
  );
}

function GlobeIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-subtle">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function LinkedInIcon() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" className="text-subtle">
      <path d="M4.98 3.5C4.98 4.88 3.87 6 2.5 6S0 4.88 0 3.5 1.12 1 2.5 1 4.98 2.12 4.98 3.5zM.5 8h4V23h-4V8zm7.5 0h3.8v2.05h.05c.53-1 1.83-2.05 3.77-2.05 4.03 0 4.78 2.65 4.78 6.1V23h-4v-6.6c0-1.57-.03-3.6-2.2-3.6-2.2 0-2.54 1.72-2.54 3.49V23h-4V8z" />
    </svg>
  );
}

function XIcon() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" className="text-subtle">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.16 17.52h1.833L7.084 4.126H5.117L17.083 19.77z" />
    </svg>
  );
}

function brandOf(label: string): "linkedin" | "x" | null {
  const l = label.trim().toLowerCase();
  if (l === "linkedin") return "linkedin";
  if (l === "x" || l === "twitter") return "x";
  return null;
}

export function AddProjectCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="group flex w-full flex-col items-center gap-3 text-muted transition hover:text-foreground"
    >
      <div
        className="relative grid place-items-center rounded-full border border-dashed border-border-strong bg-surface/50 transition duration-200 group-hover:border-foreground group-hover:bg-surface"
        style={{ width: 132, height: 132 }}
      >
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 5v14M5 12h14" />
        </svg>
      </div>
      <span className="text-[15px] font-semibold tracking-tight">New project</span>
    </button>
  );
}
