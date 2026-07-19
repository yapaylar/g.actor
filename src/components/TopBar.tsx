"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { useIdentity } from "@/lib/identity";
import { signOut, updateOwnName, useAuth } from "@/lib/auth";
import { supabaseEnabled } from "@/lib/supabase";
import { toggleTheme, useTheme } from "@/lib/theme";
import { NotificationBell } from "./NotificationBell";
import { TeamModal } from "./TeamModal";
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
  const auth = useAuth();

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:px-6">
        <div className="flex items-center gap-2.5 sm:gap-4">
          <Link href="/" className="group flex items-center gap-2.5">
            <span className="brand-mark" aria-hidden />
            <span className="eyebrow whitespace-nowrap text-foreground">
              g.actor
            </span>
          </Link>
          {pathname !== "/" && (
            <>
              <span className="h-4 w-px bg-border-strong" aria-hidden />
              <Link
                href="/"
                className="eyebrow whitespace-nowrap text-subtle transition-colors hover:text-foreground"
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
          <AccountMenu name={name} email={auth.email} />
        </div>
      </div>
    </header>
  );
}

function AccountMenu({ name, email }: { name: string; email: string | null }) {
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(name);
  const [teamOpen, setTeamOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) {
        setOpen(false);
        setEditing(false);
      }
    };
    document.addEventListener("mousedown", onDown);
    return () => document.removeEventListener("mousedown", onDown);
  }, [open]);

  const saveName = () => {
    void updateOwnName(draft);
    setEditing(false);
  };

  return (
    <div ref={rootRef} className="relative">
      <button
        onClick={() => {
          setDraft(name);
          setOpen((v) => !v);
          setEditing(false);
        }}
        className="flex h-8 items-center gap-2 rounded-md border border-dashed border-border-strong bg-surface pl-1 pr-2.5 transition hover:border-solid hover:border-foreground"
        title="Account"
      >
        <span className="grid h-6 w-6 place-items-center rounded bg-foreground font-mono text-[10px] font-bold text-background">
          {initialsOf(name)}
        </span>
        <span className="hidden font-mono text-[11px] font-semibold uppercase tracking-[0.1em] sm:block">
          {name}
        </span>
      </button>

      {open && (
        <div className="absolute right-0 top-10 z-50 w-60 rounded-xl border border-border-strong bg-surface p-2 shadow-xl animate-pop-in">
          <div className="border-b border-dashed border-border px-2.5 pb-2 pt-1">
            {editing ? (
              <input
                autoFocus
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onBlur={saveName}
                onKeyDown={(e) => e.key === "Enter" && saveName()}
                className="h-8 w-full rounded-md border border-border-strong bg-background px-2 font-mono text-xs outline-none focus:border-foreground"
                placeholder="Your name"
              />
            ) : (
              <p className="truncate text-sm font-semibold">{name}</p>
            )}
            {email && (
              <p className="mt-0.5 truncate font-mono text-[11px] text-subtle">
                {email}
              </p>
            )}
          </div>
          <div className="pt-1.5">
            <MenuItem
              label="Change name"
              onClick={() => {
                setDraft(name);
                setEditing(true);
              }}
            />
            {supabaseEnabled && (
              <>
                <MenuItem
                  label="Team members"
                  onClick={() => {
                    setOpen(false);
                    setTeamOpen(true);
                  }}
                />
                <MenuItem
                  label="Sign out"
                  danger
                  onClick={() => {
                    setOpen(false);
                    void signOut();
                  }}
                />
              </>
            )}
          </div>
        </div>
      )}

      <TeamModal open={teamOpen} onClose={() => setTeamOpen(false)} />
    </div>
  );
}

function MenuItem({
  label,
  onClick,
  danger,
}: {
  label: string;
  onClick: () => void;
  danger?: boolean;
}) {
  return (
    <button
      onClick={onClick}
      className={`block w-full rounded-md px-2.5 py-1.5 text-left font-mono text-[11px] font-semibold uppercase tracking-[0.1em] transition ${
        danger
          ? "text-red-500 hover:bg-red-500/10"
          : "text-muted hover:bg-background hover:text-foreground"
      }`}
    >
      {label}
    </button>
  );
}
