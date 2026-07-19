"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import Image from "next/image";
import type { Project, ProjectLink } from "@/lib/types";
import { cn } from "@/lib/util";
import { StatusBadge } from "./StatusBadge";

/* Vertical geometry of the hover choreography (desktop only). The hovered
 * layer never moves; neighbours slide away from it while the rest of the
 * stack packs together. Values are for the full 96px row height and scale
 * down with it on shorter viewports. */
const BASE_ROW_H = 96;
const GAP_ABOVE = 64;
const GAP_BELOW = 36;
const SQUEEZE = 22;

function rowOffset(index: number, active: number | null): number {
  if (active === null || index === active) return 0;
  if (index < active) return (active - index - 1) * SQUEEZE - GAP_ABOVE;
  return GAP_BELOW - (index - active - 1) * SQUEEZE;
}

function subscribeResize(cb: () => void) {
  window.addEventListener("resize", cb);
  return () => window.removeEventListener("resize", cb);
}

/* Mirrors the CSS clamp() that drives .stack-list row height. */
function useRowHeight(rows: number): number {
  return useSyncExternalStore(
    subscribeResize,
    () => Math.max(56, Math.min((window.innerHeight - 300) / rows, BASE_ROW_H)),
    () => BASE_ROW_H
  );
}

export function ProjectStack({
  projects,
  onNewProject,
}: {
  projects: Project[];
  onNewProject: () => void;
}) {
  const [active, setActive] = useState<number | null>(null);
  const rowHeight = useRowHeight(projects.length + 1);
  const scale = rowHeight / BASE_ROW_H;

  return (
    <div className="relative">
      {/* Dashed spine behind the slabs */}
      <div
        aria-hidden
        className="absolute left-1/2 top-6 bottom-6 hidden w-px -translate-x-1/2 border-l border-dashed border-border-strong md:block"
      />

      <ol
        className="stack-list relative flex flex-col gap-10 md:gap-0"
        style={{ "--rows": String(projects.length + 1) } as React.CSSProperties}
      >
        {projects.map((project, i) => (
          <StackRow
            key={project.id}
            project={project}
            index={i}
            zIndex={projects.length - i}
            side={i % 2 === 0 ? "right" : "left"}
            active={active === i}
            ty={rowOffset(i, active) * scale}
            onHover={(over) => setActive(over ? i : null)}
          />
        ))}

        {/* New project row — deepest layer, lowest in the stack */}
        <li
          className="stack-item relative z-0 grid justify-items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-0"
          style={
            {
              "--accent": "var(--foreground)",
              "--ty": `${rowOffset(projects.length, active) * scale}px`,
            } as React.CSSProperties
          }
        >
          <div className="hidden md:block" />
          <button
            onClick={onNewProject}
            className="iso-wrap group"
            aria-label="New project"
          >
            <div className="iso-slab iso-slab--dashed">
              <div className="iso-content">
                <svg
                  width="26"
                  height="26"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-subtle transition group-hover:text-foreground"
                >
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </div>
            </div>
          </button>
          <div className="hidden items-center md:flex">
            <div className="h-px w-10 border-t border-dashed border-border-strong lg:w-16" />
            <button
              onClick={onNewProject}
              className="rounded-xl border border-dashed border-border-strong px-4 py-3 text-left transition hover:border-foreground"
            >
              <span className="text-sm font-semibold">New project</span>
              <span className="mt-0.5 block text-xs text-muted">
                Add a new layer to the stack.
              </span>
            </button>
          </div>
          <button onClick={onNewProject} className="text-xs font-medium text-muted transition hover:text-foreground md:hidden">
            New project
          </button>
        </li>
      </ol>
    </div>
  );
}

function StackRow({
  project,
  index,
  zIndex,
  side,
  active,
  ty,
  onHover,
}: {
  project: Project;
  index: number;
  zIndex: number;
  side: "left" | "right";
  active: boolean;
  ty: number;
  onHover: (over: boolean) => void;
}) {
  const callout = (
    <div
      className={cn(
        "hidden items-center md:flex",
        side === "left" && "flex-row-reverse justify-self-end"
      )}
      onMouseEnter={() => onHover(true)}
      onMouseLeave={() => onHover(false)}
    >
      <div className="h-px w-10 border-t border-dashed border-border-strong lg:w-16" />
      <Callout project={project} index={index} side={side} />
    </div>
  );

  return (
    <li
      className="stack-row stack-item grid justify-items-center gap-3 md:grid-cols-[minmax(0,1fr)_auto_minmax(0,1fr)] md:items-center md:gap-0"
      data-active={active || undefined}
      style={
        {
          "--accent": project.accent,
          "--z": String(zIndex),
          "--ty": `${ty}px`,
        } as React.CSSProperties
      }
    >
      {side === "left" ? callout : <div className="hidden md:block" />}

      <Link
        href={`/project/${project.id}`}
        className="iso-wrap"
        aria-label={project.name}
        onMouseEnter={() => onHover(true)}
        onMouseLeave={() => onHover(false)}
      >
        <div className="iso-slab">
          <span className="iso-dot" style={{ top: 16, left: 16 }} />
          <span className="iso-dot" style={{ top: 16, right: 16 }} />
          <span className="iso-dot" style={{ bottom: 16, left: 16 }} />
          <span className="iso-dot" style={{ bottom: 16, right: 16 }} />
          <div className="iso-content">
            <SlabMark project={project} />
          </div>
        </div>
      </Link>

      {side === "right" ? callout : <div className="hidden md:block" />}

      {/* Mobile: callout below the slab */}
      <div className="md:hidden">
        <Callout project={project} index={index} side="right" />
      </div>
    </li>
  );
}

function SlabMark({ project }: { project: Project }) {
  if (project.logos && project.logos.length > 0) {
    return (
      <span className="flex items-center">
        {project.logos.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={40}
            height={40}
            className={cn(
              "rounded-xl shadow-md",
              i === 0 ? "-translate-y-1" : "-ml-2 translate-y-1"
            )}
          />
        ))}
      </span>
    );
  }

  if (project.logo && project.logoWide) {
    return (
      <span className="rounded-md bg-white/85 px-2 py-1 dark:bg-white/90">
        <Image
          src={project.logo}
          alt=""
          width={92}
          height={26}
          className="h-[26px] w-[92px] object-contain"
        />
      </span>
    );
  }

  if (project.logo) {
    return (
      <Image
        src={project.logo}
        alt=""
        width={52}
        height={52}
        className="object-contain opacity-90"
      />
    );
  }

  return (
    <span className="iso-initials text-2xl font-bold tracking-tight">
      {project.initials}
    </span>
  );
}

function Callout({
  project,
  index,
  side,
}: {
  project: Project;
  index: number;
  side: "left" | "right";
}) {
  const links = project.links ?? [];

  return (
    <div
      className={cn(
        "stack-callout w-72 rounded-xl border border-border bg-surface p-3.5 transition-all duration-200",
        side === "left" && "md:text-right"
      )}
    >
      <div
        className={cn(
          "flex items-center gap-2.5",
          side === "left" && "md:flex-row-reverse"
        )}
      >
        <span className="stack-num flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold">
          {index + 1}
        </span>
        <Link
          href={`/project/${project.id}`}
          className="truncate text-sm font-semibold hover:underline"
        >
          {project.name}
        </Link>
        <span className={cn("ml-auto shrink-0", side === "left" && "md:ml-0 md:mr-auto")}>
          <StatusBadge status={project.status} />
        </span>
      </div>

      <p className="mt-1.5 text-xs leading-relaxed text-muted">{project.tagline}</p>

      {links.length > 0 && (
        <div
          className={cn(
            "mt-2 flex flex-wrap gap-1.5",
            side === "left" && "md:justify-end"
          )}
        >
          {links.map((l) => (
            <LinkChip key={`${l.label}-${l.url}`} link={l} />
          ))}
        </div>
      )}
    </div>
  );
}

export function LinkChip({ link }: { link: ProjectLink }) {
  return (
    <a
      href={link.url}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1 rounded-full border border-border bg-background px-2 py-0.5 text-[11px] font-medium text-muted transition hover:border-border-strong hover:text-foreground"
    >
      <svg
        width="10"
        height="10"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="shrink-0 opacity-70"
      >
        <path d="M7 17 17 7M9 7h8v8" />
      </svg>
      {link.label}
    </a>
  );
}
