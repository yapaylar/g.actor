"use client";

import Link from "next/link";
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
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-6">
        <Link href="/" className="group flex items-center gap-2.5">
          <span className="grid h-7 w-7 place-items-center rounded-lg bg-foreground text-background">
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
          </span>
          <span className="text-[15px] font-semibold tracking-tight">
            g-world
          </span>
        </Link>

        <div className="flex items-center gap-2.5">
          <button
            onClick={openCommandPalette}
            className="flex h-9 items-center gap-2 rounded-lg border border-border bg-surface px-3 text-muted transition hover:border-border-strong hover:text-foreground"
            aria-label="Search"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="7" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <span className="hidden text-xs sm:block">Search</span>
            <kbd className="hidden rounded border border-border bg-background px-1.5 py-0.5 text-[10px] font-medium text-subtle sm:block">
              ⌘K
            </kbd>
          </button>
          <button
            onClick={toggleTheme}
            className="grid h-9 w-9 place-items-center rounded-lg border border-border bg-surface text-muted transition hover:border-border-strong hover:text-foreground"
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
              className="h-9 w-32 rounded-lg border border-border-strong bg-surface px-3 text-sm outline-none focus:border-foreground"
              placeholder="Your name"
            />
          ) : (
            <button
              onClick={() => {
                setDraft(name);
                setEditing(true);
              }}
              className="flex items-center gap-2 rounded-lg border border-border bg-surface py-1 pl-1 pr-3 transition hover:border-border-strong"
              title="Click to change your name"
            >
              <span className="grid h-7 w-7 place-items-center rounded-md bg-foreground text-xs font-semibold text-background">
                {initialsOf(name)}
              </span>
              <span className="text-sm font-medium">{name}</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
