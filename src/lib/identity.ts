"use client";

import { useSyncExternalStore } from "react";

const KEY = "g-world:identity:v1";
const DEFAULT = "You";

let name: string | null = null;
const listeners = new Set<() => void>();

function load(): string {
  if (typeof window === "undefined") return DEFAULT;
  return window.localStorage.getItem(KEY) || DEFAULT;
}

function ensure(): string {
  if (name === null) name = load();
  return name;
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function setIdentity(next: string) {
  name = next.trim() || DEFAULT;
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, name);
  listeners.forEach((l) => l());
}

export function useIdentity(): string {
  return useSyncExternalStore(subscribe, ensure, () => DEFAULT);
}
