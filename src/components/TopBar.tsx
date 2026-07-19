"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { setIdentity, useIdentity } from "@/lib/identity";
import { toggleTheme, useTheme } from "@/lib/theme";
import { NotificationBell } from "./NotificationBell";
import { openCommandPalette } from "./CommandPalette";

function initialsOf(name: string) {
  return (
    name
      .trim()
      .split(/\s+/)
      .map((w) => w[0])
      .join("")
      .slice(0, 2)
      .toUpperCase() || "Y"
  );
}

export function TopBar() {
  const name = useIdentity();
  const theme = useTheme();
  const pathname = usePathname();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <div className="flex items-center gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="brand-mark" aria-hidden />
            <span className="eyebrow text-foreground">g.actor</span>
          </Link>
          {pathname !== "/" && (
            <>
              <span className="h-4 w-px bg-border-strong" aria-hidden />
              <Link
                href="/"
                className="eyebrow text-subtle transition-colors hover:text-foreground"
              >
                [ home ]
              </Link>
            </>
          )}
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCommandPalette}
            className="flex h-8 items-center gap-2 rounded-md border border-border bg-surface px-2.5 text-muted transition hover:border-border-strong hover:text-foreground"
            aria-label="Search"
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden font-mono text-[10px] font-semibold uppercase tracking-[0.14em] sm:block">
              Search
            </span>
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px] text-subtle sm:block">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={toggleTheme}
            className="grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-muted transition hover:border-border-strong hover:text-foreground"
            aria-label="Toggle theme"
            title={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
          >
            {theme === "dark" ? (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="4" />
                <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" />
              </svg>
            ) : (
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z" />
              </svg>
            )}
          </button>
          <NotificationBell />
          {editing ? (
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onBlur={() => {
                setIdentity(draft);
                setEditing(false);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  setIdentity(draft);
                  setEditing(false);
                }
              }}
              className="h-8 w-32 rounded-md border border-border-strong bg-surface px-2.5 font-mono text-xs outline-none focus:border-foreground"
              placeholder="Your name"
            />
          ) : (
            <button
              onClick={() => {
                setDraft(name);
                setEditing(true);
              }}
              className="flex h-8 items-center gap-2 rounded-md border border-dashed border-border-strong bg-surface pl-1 pr-2.5 transition hover:border-solid hover:border-foreground"
              title="Click to change your name"
            >
              <span className="grid h-6 w-6 place-items-center rounded bg-foreground font-mono text-[10px] font-bold text-background">
                {initialsOf(name)}
              </span>
              <span className="font-mono text-[11px] font-semibold uppercase tracking-[0.1em]">
                {name}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
