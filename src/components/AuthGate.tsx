"use client";

import { useState } from "react";
import { signInWithEmail, signOut, useAuth } from "@/lib/auth";

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex items-center gap-3">
          <span className="brand-mark" aria-hidden />
          <span className="eyebrow text-foreground">g.actor</span>
        </div>
        {children}
      </div>
    </div>
  );
}

function LoginScreen() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    const err = await signInWithEmail(email);
    setBusy(false);
    if (err) setError(err);
    else setSent(true);
  };

  if (sent) {
    return (
      <Shell>
        <p className="eyebrow mb-3 text-subtle">[ check your inbox ]</p>
        <p className="text-sm leading-relaxed text-muted">
          We sent a sign-in link to{" "}
          <span className="font-mono text-foreground">{email}</span>. Open it
          on this device to enter the workspace.
        </p>
        <button
          onClick={() => setSent(false)}
          className="eyebrow mt-6 text-subtle transition-colors hover:text-foreground"
        >
          [ use another email ]
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="eyebrow mb-3 text-subtle">[ team sign in ]</p>
      <p className="mb-6 text-sm leading-relaxed text-muted">
        Enter your team email and we&apos;ll send you a magic link — no
        password needed.
      </p>
      <form onSubmit={submit} className="space-y-3">
        <input
          type="email"
          required
          autoFocus
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@team.com"
          className="h-11 w-full rounded-md border border-border bg-surface px-3 font-mono text-sm outline-none transition focus:border-foreground"
        />
        <button
          type="submit"
          disabled={busy}
          className="h-11 w-full rounded-md bg-foreground font-mono text-xs font-semibold uppercase tracking-[0.14em] text-background transition hover:opacity-90 disabled:opacity-50"
        >
          {busy ? "Sending…" : "Send magic link"}
        </button>
      </form>
      {error && (
        <p className="mt-3 font-mono text-xs text-red-500">{error}</p>
      )}
    </Shell>
  );
}

function NotMemberScreen({ email }: { email: string | null }) {
  return (
    <Shell>
      <p className="eyebrow mb-3 text-subtle">[ access pending ]</p>
      <p className="text-sm leading-relaxed text-muted">
        {email ? (
          <>
            <span className="font-mono text-foreground">{email}</span> is not
            on the team list yet. Ask an owner to add you, then sign in again.
          </>
        ) : (
          "Your account is not on the team list yet."
        )}
      </p>
      <button
        onClick={() => void signOut()}
        className="eyebrow mt-6 text-subtle transition-colors hover:text-foreground"
      >
        [ sign out ]
      </button>
    </Shell>
  );
}

export function AuthGate({ children }: { children: React.ReactNode }) {
  const auth = useAuth();

  if (auth.status === "loading") {
    return (
      <div className="grid min-h-dvh place-items-center">
        <span className="eyebrow animate-pulse text-subtle">
          [ loading g.actor ]
        </span>
      </div>
    );
  }
  if (auth.status === "signedOut") return <LoginScreen />;
  if (auth.status === "notMember") return <NotMemberScreen email={auth.email} />;
  return <>{children}</>;
}
