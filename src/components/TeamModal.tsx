"use client";

import { useEffect, useState } from "react";
import {
  addMember,
  refreshMembers,
  removeMember,
  setMemberRole,
  useAuth,
} from "@/lib/auth";
import { Modal } from "./ui/Modal";

export function TeamModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  return (
    <Modal open={open} onClose={onClose} title="Team members">
      {open && <TeamPanel />}
    </Modal>
  );
}

function TeamPanel() {
  const { member: me, members } = useAuth();
  const isOwner = me?.role === "owner";
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [role, setRole] = useState<"member" | "owner">("member");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    void refreshMembers();
  }, []);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const err = await addMember(email, name, role);
    setBusy(false);
    if (err) {
      setError(err);
    } else {
      setEmail("");
      setName("");
      setRole("member");
    }
  };

  return (
    <div className="space-y-5">
      <ul className="space-y-2">
        {members.map((m) => {
          const self = m.email === me?.email;
          return (
            <li
              key={m.email}
              className="flex items-center gap-3 rounded-lg border border-border bg-background px-3 py-2.5"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">
                  {m.name || m.email.split("@")[0]}
                  {self && (
                    <span className="ml-1.5 font-mono text-[10px] uppercase tracking-[0.12em] text-subtle">
                      (you)
                    </span>
                  )}
                </p>
                <p className="truncate font-mono text-[11px] text-subtle">
                  {m.email}
                </p>
              </div>
              {isOwner && !self ? (
                <>
                  <select
                    value={m.role}
                    onChange={(e) =>
                      void setMemberRole(
                        m.email,
                        e.target.value as "owner" | "member"
                      )
                    }
                    className="h-7 rounded border border-border bg-surface px-1.5 font-mono text-[11px] uppercase tracking-[0.08em] text-muted outline-none"
                  >
                    <option value="member">member</option>
                    <option value="owner">owner</option>
                  </select>
                  <button
                    onClick={() => {
                      if (window.confirm(`Remove ${m.email} from the team?`))
                        void removeMember(m.email);
                    }}
                    className="grid h-7 w-7 place-items-center rounded border border-border text-subtle transition hover:border-red-400 hover:text-red-500"
                    aria-label={`Remove ${m.email}`}
                  >
                    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                      <path d="M18 6 6 18M6 6l12 12" />
                    </svg>
                  </button>
                </>
              ) : (
                <span className="font-mono text-[10px] font-semibold uppercase tracking-[0.14em] text-subtle">
                  {m.role}
                </span>
              )}
            </li>
          );
        })}
        {members.length === 0 && (
          <li className="rounded-lg border border-dashed border-border px-3 py-4 text-center font-mono text-xs text-subtle">
            No members loaded.
          </li>
        )}
      </ul>

      {isOwner && (
        <form
          onSubmit={submit}
          className="space-y-2.5 border-t border-dashed border-border-strong pt-4"
        >
          <p className="form-label">Invite a teammate</p>
          <div className="flex gap-2">
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@team.com"
              className="h-9 min-w-0 flex-1 rounded-md border border-border bg-background px-2.5 font-mono text-xs outline-none transition focus:border-foreground"
            />
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Name"
              className="h-9 w-28 rounded-md border border-border bg-background px-2.5 text-xs outline-none transition focus:border-foreground"
            />
          </div>
          <div className="flex items-center justify-between gap-2">
            <select
              value={role}
              onChange={(e) => setRole(e.target.value as "owner" | "member")}
              className="h-9 rounded-md border border-border bg-background px-2 font-mono text-[11px] uppercase tracking-[0.08em] text-muted outline-none"
            >
              <option value="member">member</option>
              <option value="owner">owner</option>
            </select>
            <button
              type="submit"
              disabled={busy}
              className="h-9 rounded-md bg-foreground px-4 font-mono text-[11px] font-semibold uppercase tracking-[0.14em] text-background transition hover:opacity-90 disabled:opacity-50"
            >
              {busy ? "Adding…" : "Add member"}
            </button>
          </div>
          {error && <p className="font-mono text-xs text-red-500">{error}</p>}
          <p className="text-[11px] leading-relaxed text-subtle">
            Added teammates sign in with a magic link using this email.
          </p>
        </form>
      )}
    </div>
  );
}
