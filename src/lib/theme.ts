"use client";

import { useSyncExternalStore } from "react";

const KEY = "g-world:theme";

export type Theme = "light" | "dark";

let theme: Theme | null = null;
const listeners = new Set<() => void>();

function systemPref(): Theme {
  if (typeof window === "undefined") return "light";
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function load(): Theme {
  if (typeof window === "undefined") return "light";
  const stored = window.localStorage.getItem(KEY);
  if (stored === "dark" || stored === "light") return stored;
  return systemPref();
}

function ensure(): Theme {
  if (theme === null) theme = load();
  return theme;
}

function apply(t: Theme) {
  document.documentElement.classList.toggle("dark", t === "dark");
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function setTheme(next: Theme) {
  theme = next;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(KEY, next);
    apply(next);
  }
  listeners.forEach((l) => l());
}

export function toggleTheme() {
  setTheme(ensure() === "dark" ? "light" : "dark");
}

export function useTheme(): Theme {
  return useSyncExternalStore(subscribe, ensure, () => "light");
}
