"use client";

import { useEffect, useRef, useState } from "react";
import { addMessage, useStore } from "@/lib/store";
import { useIdentity } from "@/lib/identity";
import type { Project } from "@/lib/types";
import { timeAgo } from "@/lib/util";

export function ChatPanel({
  project,
  onClose,
}: {
  project: Project;
  onClose?: () => void;
}) {
  const { messages } = useStore();
  const me = useIdentity();
  const [text, setText] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  const projectMessages = messages.filter((m) => m.projectId === project.id);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight });
  }, [projectMessages.length]);

  const send = () => {
    if (!text.trim()) return;
    addMessage({ projectId: project.id, author: me, body: text.trim() });
    setText("");
  };

  return (
    <aside className="flex h-full w-full flex-col border-l border-border bg-surface">
      <div className="flex items-center justify-between border-b border-dashed border-border-strong px-4 py-3.5">
        <span className="eyebrow" style={{ color: project.accent }}>
          [ Team chat ]
        </span>
        <span className="flex items-center gap-3">
          <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
            {project.name}
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="grid h-7 w-7 place-items-center rounded-md text-muted transition hover:bg-background hover:text-foreground"
              aria-label="Close chat"
            >
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          )}
        </span>
      </div>

      <div ref={scrollRef} className="flex-1 space-y-4 overflow-y-auto p-4">
        {projectMessages.length === 0 ? (
          <div className="flex h-full flex-col items-center justify-center px-6 text-center">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-border bg-background text-subtle">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </span>
            <p className="mt-3 text-sm font-medium">No messages yet</p>
            <p className="mt-1 text-xs text-subtle">
              Start the conversation with your team about {project.name}.
            </p>
          </div>
        ) : (
          projectMessages.map((m) => {
            const mine = m.author === me;
            return (
              <div key={m.id} className={`flex gap-2.5 ${mine ? "flex-row-reverse" : ""}`}>
                <span className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-md bg-background text-[11px] font-semibold text-muted">
                  {m.author.slice(0, 2).toUpperCase()}
                </span>
                <div className={`min-w-0 max-w-[80%] ${mine ? "items-end text-right" : ""}`}>
                  <div className={`flex items-baseline gap-2 ${mine ? "flex-row-reverse" : ""}`}>
                    <span className="text-xs font-semibold">{mine ? "You" : m.author}</span>
                    <span className="text-[10px] text-subtle">{timeAgo(m.createdAt)}</span>
                  </div>
                  <div
                    className={`mt-1 inline-block whitespace-pre-wrap break-words rounded-2xl px-3 py-2 text-sm ${
                      mine
                        ? "rounded-tr-sm text-white"
                        : "rounded-tl-sm bg-background text-foreground"
                    }`}
                    style={mine ? { background: project.accent } : undefined}
                  >
                    {m.body}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      <div className="border-t border-border p-3">
        <div className="flex items-end gap-2 rounded-xl border border-border-strong bg-background p-1.5 focus-within:border-foreground">
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
            rows={1}
            placeholder="Message the team…"
            className="max-h-28 flex-1 resize-none bg-transparent px-2 py-1.5 text-sm outline-none placeholder:text-subtle"
          />
          <button
            onClick={send}
            disabled={!text.trim()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-lg bg-foreground text-background transition disabled:opacity-30"
            aria-label="Send"
          >
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 2 11 13M22 2l-7 20-4-9-9-4z" />
            </svg>
          </button>
        </div>
      </div>
    </aside>
  );
}
