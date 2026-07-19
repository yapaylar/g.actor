"use client";

import { useEffect, useRef, useState } from "react";
import {
  markAllNotificationsRead,
  markNotificationRead,
  useStore,
} from "@/lib/store";
import { timeAgo } from "@/lib/util";

export function NotificationBell() {
  const { notifications, projects } = useStore();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const unread = notifications.filter((n) => !n.read).length;
  const projectName = (id: string) =>
    projects.find((p) => p.id === id)?.name ?? "Project";

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  return (
    <div className="relative" ref={ref}>
      <button
        onClick={() => setOpen((o) => !o)}
        className="relative grid h-8 w-8 place-items-center rounded-md border border-border bg-surface text-muted transition hover:text-foreground hover:border-border-strong"
        aria-label="Notifications"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
          <path d="M10.3 21a1.94 1.94 0 0 0 3.4 0" />
        </svg>
        {unread > 0 && (
          <span className="absolute -right-1 -top-1 grid h-4 min-w-4 place-items-center rounded-full bg-red-500 px-1 text-[10px] font-semibold text-white">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 overflow-hidden rounded-xl border border-border-strong bg-surface shadow-xl animate-pop-in">
          <div className="flex items-center justify-between border-b border-dashed border-border-strong px-4 py-3">
            <span className="eyebrow text-muted">[ Notifications ]</span>
            {unread > 0 && (
              <button
                onClick={markAllNotificationsRead}
                className="text-xs text-muted hover:text-foreground"
              >
                Mark all read
              </button>
            )}
          </div>
          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 ? (
              <p className="px-4 py-8 text-center text-sm text-subtle">
                Nothing here yet.
              </p>
            ) : (
              notifications.map((n) => (
                <button
                  key={n.id}
                  onClick={() => markNotificationRead(n.id)}
                  className="flex w-full gap-3 border-b border-border px-4 py-3 text-left transition hover:bg-background"
                >
                  <span
                    className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${
                      n.read ? "bg-transparent" : "bg-red-500"
                    }`}
                  />
                  <span className="min-w-0">
                    <span className="block text-sm font-medium">{n.title}</span>
                    <span className="block truncate text-xs text-muted">
                      {n.body}
                    </span>
                    <span className="mt-1 block text-[11px] text-subtle">
                      {projectName(n.projectId)} · {n.audience} · {timeAgo(n.createdAt)}
                    </span>
                  </span>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
