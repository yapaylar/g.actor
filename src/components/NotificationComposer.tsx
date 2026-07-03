"use client";

import { useState } from "react";
import { sendNotification } from "@/lib/store";
import type { Project } from "@/lib/types";
import { Modal } from "./ui/Modal";

const AUDIENCES = ["Team", "Project members", "Everyone"];

export function NotificationComposer({
  project,
  open,
  onClose,
}: {
  project: Project;
  open: boolean;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [audience, setAudience] = useState(AUDIENCES[0]);
  const [sent, setSent] = useState(false);

  const close = () => {
    setTitle("");
    setBody("");
    setAudience(AUDIENCES[0]);
    setSent(false);
    onClose();
  };

  const submit = () => {
    if (!title.trim()) return;
    sendNotification({
      projectId: project.id,
      title: title.trim(),
      body: body.trim(),
      audience,
    });
    setSent(true);
    setTimeout(close, 900);
  };

  return (
    <Modal open={open} onClose={close} title={`Notify about ${project.name}`}>
      {sent ? (
        <div className="flex flex-col items-center py-6 text-center">
          <span className="grid h-12 w-12 place-items-center rounded-full bg-green-50 text-green-600">
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 6 9 17l-5-5" />
            </svg>
          </span>
          <p className="mt-3 text-sm font-medium">Notification sent</p>
          <p className="mt-1 text-xs text-subtle">
            The team will see it in the bell.
          </p>
        </div>
      ) : (
        <>
          <div className="space-y-4">
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">
                Title
              </span>
              <input
                autoFocus
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="What happened?"
                className="field-input"
              />
            </label>
            <label className="block">
              <span className="mb-1.5 block text-xs font-medium text-muted">
                Message
              </span>
              <textarea
                value={body}
                onChange={(e) => setBody(e.target.value)}
                placeholder="Add a little more context (optional)"
                rows={3}
                className="field-input resize-none"
              />
            </label>
            <div>
              <span className="mb-1.5 block text-xs font-medium text-muted">
                Audience
              </span>
              <div className="flex flex-wrap gap-2">
                {AUDIENCES.map((a) => (
                  <button
                    key={a}
                    onClick={() => setAudience(a)}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition ${
                      audience === a
                        ? "border-foreground bg-foreground text-background"
                        : "border-border-strong bg-surface text-muted hover:text-foreground"
                    }`}
                  >
                    {a}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <div className="mt-6 flex justify-end gap-2">
            <button onClick={close} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={submit}
              disabled={!title.trim()}
              className="btn-primary"
            >
              Send notification
            </button>
          </div>
        </>
      )}
    </Modal>
  );
}
