"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/store";
import { toggleTheme, useTheme } from "@/lib/theme";

interface Item {
  id: string;
  group: string;
  title: string;
  subtitle?: string;
  icon: React.ReactNode;
  run: () => void;
}

export function openCommandPalette() {
  window.dispatchEvent(new Event("gworld:cmdk"));
}

export function CommandPalette() {
  const router = useRouter();
  const { projects, updates, notes } = useStore();
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [index, setIndex] = useState(0);
  const listRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const openFresh = () => {
      setQuery("");
      setIndex(0);
      setOpen(true);
    };
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => {
          if (!o) {
            setQuery("");
            setIndex(0);
          }
          return !o;
        });
      }
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("gworld:cmdk", openFresh);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("gworld:cmdk", openFresh);
    };
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const go = (path: string) => {
    setOpen(false);
    router.push(path);
  };

  const items = useMemo<Item[]>(() => {
    const q = query.trim().toLowerCase();
    const match = (...fields: string[]) =>
      q === "" || fields.some((f) => f.toLowerCase().includes(q));

    const result: Item[] = [];

    for (const p of projects) {
      if (match(p.name, p.tagline)) {
        result.push({
          id: `project-${p.id}`,
          group: "Projects",
          title: p.name,
          subtitle: p.tagline || undefined,
          icon: <SphereIcon />,
          run: () => go(`/project/${p.id}`),
        });
      }
    }

    if (q !== "") {
      const projectName = (id: string) =>
        projects.find((p) => p.id === id)?.name ?? "Project";
      for (const u of updates) {
        if (u.title.toLowerCase().includes(q) || u.body.toLowerCase().includes(q)) {
          result.push({
            id: `update-${u.id}`,
            group: "Updates",
            title: u.title,
            subtitle: `${projectName(u.projectId)} · ${u.author}`,
            icon: <PulseIcon />,
            run: () => go(`/project/${u.projectId}`),
          });
          if (result.length > 24) break;
        }
      }
      for (const n of notes) {
        if (n.body.toLowerCase().includes(q)) {
          result.push({
            id: `note-${n.id}`,
            group: "Notes",
            title: n.body.length > 64 ? `${n.body.slice(0, 64)}…` : n.body,
            subtitle: `${projectName(n.projectId)} · ${n.author}`,
            icon: <NoteIcon />,
            run: () => go(`/project/${n.projectId}?tab=notes`),
          });
          if (result.length > 32) break;
        }
      }
    }

    const actions: Item[] = [
      {
        id: "action-new",
        group: "Actions",
        title: "New project",
        icon: <PlusIcon />,
        run: () => go("/?new=1"),
      },
      {
        id: "action-theme",
        group: "Actions",
        title: theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
        icon: theme === "dark" ? <SunIcon /> : <MoonIcon />,
        run: () => {
          toggleTheme();
          setOpen(false);
        },
      },
      {
        id: "action-home",
        group: "Actions",
        title: "Go home",
        icon: <HomeIcon />,
        run: () => go("/"),
      },
    ];
    for (const a of actions) {
      if (match(a.title)) result.push(a);
    }

    return result;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [projects, updates, notes, query, theme]);

  useEffect(() => {
    listRef.current
      ?.querySelector('[data-active="true"]')
      ?.scrollIntoView({ block: "nearest" });
  }, [index]);

  if (!open) return null;

  const groups: string[] = [];
  for (const item of items) {
    if (!groups.includes(item.group)) groups.push(item.group);
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center px-4 pt-[16vh]">
      <div
        className="absolute inset-0 bg-black/30 backdrop-blur-[2px]"
        onClick={() => setOpen(false)}
      />
      <div className="relative w-full max-w-xl overflow-hidden rounded-2xl border border-border-strong bg-surface shadow-2xl animate-pop-in">
        <div className="flex items-center gap-3 border-b border-border px-4">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0 text-subtle">
            <circle cx="11" cy="11" r="7" />
            <path d="m21 21-4.3-4.3" />
          </svg>
          <input
            autoFocus
            value={query}
            onChange={(e) => {
              setQuery(e.target.value);
              setIndex(0);
            }}
            onKeyDown={(e) => {
              if (e.key === "ArrowDown") {
                e.preventDefault();
                setIndex((i) => Math.min(i + 1, items.length - 1));
              } else if (e.key === "ArrowUp") {
                e.preventDefault();
                setIndex((i) => Math.max(i - 1, 0));
              } else if (e.key === "Enter") {
                e.preventDefault();
                items[index]?.run();
              } else if (e.key === "Escape") {
                setOpen(false);
              }
            }}
            placeholder="Search projects, updates, notes…"
            className="h-12 flex-1 bg-transparent text-sm outline-none placeholder:text-subtle"
          />
          <kbd className="rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-subtle">
            esc
          </kbd>
        </div>

        <div ref={listRef} className="max-h-[46vh] overflow-y-auto p-2">
          {items.length === 0 ? (
            <p className="px-3 py-10 text-center text-sm text-subtle">
              No results for &ldquo;{query}&rdquo;
            </p>
          ) : (
            groups.map((group) => (
              <div key={group}>
                <p className="px-3 pb-1 pt-3 text-[11px] font-medium uppercase tracking-wide text-subtle">
                  {group}
                </p>
                {items.map((item, i) =>
                  item.group === group ? (
                    <button
                      key={item.id}
                      data-active={i === index}
                      onClick={item.run}
                      onMouseMove={() => setIndex(i)}
                      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${
                        i === index ? "bg-background" : ""
                      }`}
                    >
                      <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md border border-border bg-surface text-muted">
                        {item.icon}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate text-sm font-medium">
                          {item.title}
                        </span>
                        {item.subtitle && (
                          <span className="block truncate text-xs text-subtle">
                            {item.subtitle}
                          </span>
                        )}
                      </span>
                      {i === index && (
                        <kbd className="rounded border border-border bg-surface px-1.5 py-0.5 text-[10px] text-subtle">
                          ↵
                        </kbd>
                      )}
                    </button>
                  ) : null
                )}
              </div>
            ))
          )}
        </div>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-subtle">
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-border bg-background px-1 py-0.5">↑↓</kbd>
            navigate
          </span>
          <span className="inline-flex items-center gap-1">
            <kbd className="rounded border border-border bg-background px-1 py-0.5">↵</kbd>
            open
          </span>
        </div>
      </div>
    </div>
  );
}

function SphereIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
    </svg>
  );
}

function PulseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M22 12h-4l-3 9L9 3l-3 9H2" />
    </svg>
  );
}

function NoteIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6M16 13H8M16 17H8" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function MoonIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
    </svg>
  );
}

function SunIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="4" />
      <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
    </svg>
  );
}

function HomeIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 11.5 12 4l9 7.5M5 10v9a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-9" />
    </svg>
  );
}
