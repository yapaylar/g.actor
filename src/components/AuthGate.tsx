"use client";

import { useState } from "react";
import {
  signInWithEmail,
  signInWithGoogle,
  signOut,
  useAuth,
} from "@/lib/auth";

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
        Sign in with your team Google account, or get a magic link by email —
        no password needed.
      </p>
      <button
        onClick={() => {
          setError(null);
          void signInWithGoogle().then((err) => err && setError(err));
        }}
        className="flex h-11 w-full items-center justify-center gap-2.5 rounded-md border border-border-strong bg-surface font-mono text-xs font-semibold uppercase tracking-[0.14em] transition hover:border-foreground"
      >
        <svg width="15" height="15" viewBox="0 0 24 24" aria-hidden>
          <path fill="#4285F4" d="M23.5 12.27c0-.85-.08-1.66-.22-2.45H12v4.64h6.45a5.52 5.52 0 0 1-2.39 3.62v3h3.87c2.26-2.09 3.57-5.16 3.57-8.81z" />
          <path fill="#34A853" d="M12 24c3.24 0 5.96-1.07 7.94-2.91l-3.87-3c-1.07.72-2.45 1.15-4.07 1.15-3.13 0-5.78-2.11-6.73-4.96H1.29v3.1A12 12 0 0 0 12 24z" />
          <path fill="#FBBC05" d="M5.27 14.28A7.2 7.2 0 0 1 4.89 12c0-.79.14-1.56.38-2.28v-3.1H1.29a12 12 0 0 0 0 10.76l3.98-3.1z" />
          <path fill="#EA4335" d="M12 4.76c1.76 0 3.34.6 4.59 1.79l3.44-3.44A11.53 11.53 0 0 0 12 0 12 12 0 0 0 1.29 6.62l3.98 3.1C6.22 6.87 8.87 4.76 12 4.76z" />
        </svg>
        Continue with Google
      </button>
      <div className="my-5 flex items-center gap-3" aria-hidden>
        <span className="h-px flex-1 bg-border" />
        <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-subtle">
          or
        </span>
        <span className="h-px flex-1 bg-border" />
      </div>
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
