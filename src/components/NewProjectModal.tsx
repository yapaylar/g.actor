"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addProject } from "@/lib/store";
import { ACCENTS } from "@/lib/util";
import { Modal } from "./ui/Modal";

export function NewProjectModal({
  open,
  onClose,
}: {
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();
  const [name, setName] = useState("");
  const [tagline, setTagline] = useState("");
  const [description, setDescription] = useState("");
  const [accent, setAccent] = useState(ACCENTS[0]);

  const reset = () => {
    setName("");
    setTagline("");
    setDescription("");
    setAccent(ACCENTS[0]);
  };

  const submit = () => {
    if (!name.trim()) return;
    const project = addProject({ name, tagline, description, accent });
    reset();
    onClose();
    router.push(`/project/${project.id}`);
  };

  return (
    <Modal open={open} onClose={onClose} title="New project">
      <div className="space-y-4">
        <Field label="Name">
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && submit()}
            placeholder="e.g. Roadmap"
            className="field-input"
          />
        </Field>
        <Field label="Tagline">
          <input
            value={tagline}
            onChange={(e) => setTagline(e.target.value)}
            placeholder="One short line about it"
            className="field-input"
          />
        </Field>
        <Field label="Description">
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What is this project about?"
            rows={3}
            className="field-input resize-none"
          />
        </Field>
        <Field label="Accent">
          <div className="flex flex-wrap gap-2">
            {ACCENTS.map((c) => (
              <button
                key={c}
                onClick={() => setAccent(c)}
                className={`h-7 w-7 rounded-full transition ${
                  accent === c ? "ring-2 ring-offset-2 ring-offset-surface" : ""
                }`}
                style={{ background: c, boxShadow: accent === c ? `0 0 0 2px ${c}` : undefined }}
                aria-label={`Accent ${c}`}
              />
            ))}
          </div>
        </Field>
      </div>

      <div className="mt-6 flex justify-end gap-2">
        <button onClick={onClose} className="btn-ghost">
          Cancel
        </button>
        <button onClick={submit} disabled={!name.trim()} className="btn-primary">
          Create project
        </button>
      </div>
    </Modal>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-medium text-muted">{label}</span>
      {children}
    </label>
  );
}
