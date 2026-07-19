"use client";

import { useEffect } from "react";

export function Modal({
  open,
  onClose,
  children,
  title,
}: {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
}) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
    >
      <div
        className="absolute inset-0 bg-black/20 backdrop-blur-[2px] animate-fade-up"
        onClick={onClose}
      />
      <div className="relative w-full max-w-lg rounded-2xl border border-border-strong bg-surface shadow-xl animate-pop-in">
        {title && (
          <div className="flex items-center justify-between border-b border-dashed border-border-strong px-6 py-4">
            <h2 className="text-base font-semibold tracking-tight">{title}</h2>
            <span className="flex gap-1.5">
              <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
              <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
              <span className="h-1.5 w-1.5 rounded-full bg-border-strong" />
            </span>
          </div>
        )}
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
}
