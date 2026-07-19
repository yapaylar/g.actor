"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useStore, useStoreReady } from "@/lib/store";
import { TopBar } from "./TopBar";
import { ProjectStack } from "./ProjectStack";
import { NewProjectModal } from "./NewProjectModal";

export function Dashboard() {
  const { projects } = useStore();
  const ready = useStoreReady();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [modalOpen, setModalOpen] = useState(false);

  const openedFromUrl = searchParams.get("new") === "1";
  const isModalOpen = modalOpen || openedFromUrl;
  const closeModal = () => {
    setModalOpen(false);
    if (openedFromUrl) router.replace("/");
  };

  return (
    <div className="flex min-h-dvh flex-col md:h-dvh md:overflow-hidden">
      <TopBar />

      <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col px-6 pb-6 pt-6 md:min-h-0">
        <section className="rounded-3xl border border-border bg-surface/50 px-4 py-10 sm:px-8 md:grid md:min-h-0 md:flex-1 md:place-items-center md:py-4">
          {ready ? (
            <ProjectStack
              projects={projects}
              onNewProject={() => setModalOpen(true)}
            />
          ) : (
            <p className="eyebrow animate-pulse py-24 text-center text-subtle">
              [ loading stack ]
            </p>
          )}
        </section>
      </main>

      <NewProjectModal open={isModalOpen} onClose={closeModal} />
    </div>
  );
}
