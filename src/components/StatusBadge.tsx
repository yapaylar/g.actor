import type { Project } from "@/lib/types";

const MAP: Record<Project["status"], { label: string; dot: string; text: string }> = {
  active: { label: "Active", dot: "#10b981", text: "#0f7a4f" },
  planning: { label: "Planning", dot: "#f59e0b", text: "#9a6700" },
  paused: { label: "Paused", dot: "#9ca3af", text: "#6b7280" },
};

export function StatusBadge({ status }: { status: Project["status"] }) {
  const s = MAP[status];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-2.5 py-1 text-xs font-medium">
      <span
        className="h-1.5 w-1.5 rounded-full"
        style={{ background: s.dot }}
      />
      <span style={{ color: s.text }}>{s.label}</span>
    </span>
  );
}
