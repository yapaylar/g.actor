"use client";

import { useState, useSyncExternalStore } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/store";
import { TopBar } from "./TopBar";
import { ProjectCard, AddProjectCard } from "./ProjectCard";
import { NewProjectModal } from "./NewProjectModal";
import { WorldView } from "./WorldView";

const VIEW_KEY = "g-world:view";

type View = "grid" | "world";

let viewState: View | null = null;
const viewListeners = new Set<() => void>();

function getView(): View {
  if (viewState === null) {
    viewState =
      typeof window !== "undefined" &&
      window.localStorage.getItem(VIEW_KEY) === "world"
        ? "world"
        : "grid";
  }
  return viewState;
}

function setView(v: View) {
  viewState = v;
  window.localStorage.setItem(VIEW_KEY, v);
  viewListeners.forEach((l) => l());
}

function subscribeView(l: () => void): () => void {
  viewListeners.add(l);
  return () => viewListeners.delete(l);
}

export function Dashboard() {
  const { projects } = useStore();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);
  const view = useSyncExternalStore(subscribeView, getView, () => "grid");

  const openedFromUrl = searchParams.get("new") === "1";
  const isModalOpen = modalOpen || openedFromUrl;
  const closeModal = () => {
    setModalOpen(false);
    if (openedFromUrl) router.replace("/");
  };

  const switchView = (v: View) => setView(v);

  return (
    <div className="min-h-screen">
      <TopBar />

      <main className="mx-auto max-w-6xl px-6 py-10">
        <div className="mb-8 flex justify-center">
          <div className="flex rounded-full border border-border bg-surface p-1">
            <ViewButton
              active={view === "grid"}
              onClick={() => switchView("grid")}
              label="Grid"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </ViewButton>
            <ViewButton
              active={view === "world"}
              onClick={() => switchView("world")}
              label="World"
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="3" />
                <path d="M20.2 6.7c1.7 1.2 2.6 2.6 2.3 3.8-.5 2.2-5.6 3-11.4 1.8S.9 8.5 1.5 6.3c.3-1.2 1.8-2 4-2.2" transform="rotate(-25 12 12)" />
              </svg>
            </ViewButton>
          </div>
        </div>

        {view === "world" ? (
          <div className="animate-fade-up">
            <WorldView projects={projects} />
            <div className="mt-4 flex justify-center">
              <button onClick={() => setModalOpen(true)} className="btn-ghost">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 5v14M5 12h14" />
                </svg>
                New project
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 place-items-center gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((p, i) => (
              <div
                key={p.id}
                className="animate-fade-up w-full"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="float-idle" style={{ animationDelay: `${i * -1.7}s` }}>
                  <ProjectCard project={p} />
                </div>
              </div>
            ))}
            <div
              className="animate-fade-up w-full"
              style={{ animationDelay: `${projects.length * 50}ms` }}
            >
              <AddProjectCard onClick={() => setModalOpen(true)} />
            </div>
          </div>
        )}
      </main>

      <NewProjectModal open={isModalOpen} onClose={closeModal} />
    </div>
  );
}

function ViewButton({
  active,
  onClick,
  label,
  children,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-foreground text-background"
          : "text-muted hover:text-foreground"
      }`}
    >
      {children}
      {label}
    </button>
  );
}
