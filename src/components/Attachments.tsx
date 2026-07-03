"use client";

import { useRef, useState } from "react";
import type { Attachment } from "@/lib/types";
import { Modal } from "./ui/Modal";

const MAX_BYTES = 4 * 1024 * 1024; // 4 MB per file

function uid() {
  return Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
}

function formatBytes(n: number): string {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(1)} MB`;
}

function readFile(file: File): Promise<Attachment> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () =>
      resolve({
        id: uid(),
        name: file.name,
        type: file.type,
        size: file.size,
        dataUrl: String(reader.result),
      });
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export function AttachmentEditor({
  attachments,
  onChange,
}: {
  attachments: Attachment[];
  onChange: (next: Attachment[]) => void;
}) {
  const fileRef = useRef<HTMLInputElement>(null);
  const imageRef = useRef<HTMLInputElement>(null);

  const handleFiles = async (list: FileList | null) => {
    if (!list || list.length === 0) return;
    const next: Attachment[] = [];
    for (const file of Array.from(list)) {
      if (file.size > MAX_BYTES) {
        window.alert(`"${file.name}" is larger than 4 MB and was skipped.`);
        continue;
      }
      next.push(await readFile(file));
    }
    if (next.length) onChange([...attachments, ...next]);
  };

  const remove = (id: string) =>
    onChange(attachments.filter((a) => a.id !== id));

  return (
    <div>
      <div className="flex items-center gap-1">
        <input
          ref={fileRef}
          type="file"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <input
          ref={imageRef}
          type="file"
          accept="image/*"
          multiple
          className="hidden"
          onChange={(e) => {
            handleFiles(e.target.files);
            e.target.value = "";
          }}
        />
        <IconButton
          label="Add image"
          onClick={() => imageRef.current?.click()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <path d="m21 15-5-5L5 21" />
          </svg>
        </IconButton>
        <IconButton
          label="Attach file"
          onClick={() => fileRef.current?.click()}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21.44 11.05 12.25 20.24a6 6 0 0 1-8.49-8.49l9.19-9.19a4 4 0 0 1 5.66 5.66l-9.2 9.19a2 2 0 0 1-2.83-2.83l8.49-8.48" />
          </svg>
        </IconButton>
      </div>

      {attachments.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-2">
          {attachments.map((a) => (
            <div
              key={a.id}
              className="group/att relative flex items-center gap-2 rounded-lg border border-border bg-background py-1 pl-1 pr-2"
            >
              {a.type.startsWith("image/") ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={a.dataUrl}
                  alt={a.name}
                  className="h-9 w-9 rounded-md object-cover"
                />
              ) : (
                <span className="grid h-9 w-9 place-items-center rounded-md bg-surface text-subtle">
                  <FileIcon />
                </span>
              )}
              <span className="max-w-[120px] truncate text-xs text-muted">
                {a.name}
              </span>
              <button
                type="button"
                onClick={() => remove(a.id)}
                className="grid h-5 w-5 place-items-center rounded-full text-subtle transition hover:bg-surface hover:text-red-600"
                aria-label={`Remove ${a.name}`}
              >
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 6 6 18M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function IconButton({
  label,
  onClick,
  children,
}: {
  label: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="grid h-8 w-8 place-items-center rounded-lg text-muted transition hover:bg-background hover:text-foreground"
    >
      {children}
    </button>
  );
}

function FileIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
      <path d="M14 2v6h6" />
    </svg>
  );
}

export function AttachmentView({ attachments }: { attachments?: Attachment[] }) {
  const [preview, setPreview] = useState<Attachment | null>(null);
  if (!attachments || attachments.length === 0) return null;

  const images = attachments.filter((a) => a.type.startsWith("image/"));
  const files = attachments.filter((a) => !a.type.startsWith("image/"));

  return (
    <div className="mt-3 space-y-2">
      {images.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {images.map((a) => (
            <button
              key={a.id}
              onClick={() => setPreview(a)}
              className="overflow-hidden rounded-lg border border-border transition hover:opacity-90"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={a.dataUrl}
                alt={a.name}
                className="h-24 w-24 object-cover"
              />
            </button>
          ))}
        </div>
      )}

      {files.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {files.map((a) => (
            <a
              key={a.id}
              href={a.dataUrl}
              download={a.name}
              className="inline-flex items-center gap-2 rounded-lg border border-border bg-background px-2.5 py-1.5 text-xs text-muted transition hover:border-border-strong hover:text-foreground"
            >
              <FileIcon />
              <span className="max-w-[160px] truncate font-medium">{a.name}</span>
              <span className="text-subtle">{formatBytes(a.size)}</span>
            </a>
          ))}
        </div>
      )}

      <Modal open={!!preview} onClose={() => setPreview(null)}>
        {preview && (
          <div className="flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={preview.dataUrl}
              alt={preview.name}
              className="max-h-[70vh] w-auto rounded-lg"
            />
            <p className="mt-3 text-sm text-muted">{preview.name}</p>
          </div>
        )}
      </Modal>
    </div>
  );
}
