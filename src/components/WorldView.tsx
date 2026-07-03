"use client";

import Link from "next/link";
import type { Project } from "@/lib/types";
import { GlassSphere } from "./GlassSphere";

const STAGE = 660;

export function WorldView({ projects }: { projects: Project[] }) {
  return (
    <div className="world relative h-[360px] overflow-hidden sm:h-[480px] lg:h-[640px]">
      <div
        className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 scale-[0.52] sm:scale-75 lg:scale-100"
        style={{ width: STAGE, height: STAGE }}
      >
        {/* ambient aura */}
        <div
          className="pointer-events-none absolute left-1/2 top-1/2 h-[420px] w-[420px] -translate-x-1/2 -translate-y-1/2 rounded-full opacity-60 blur-3xl"
          style={{
            background:
              "radial-gradient(circle, color-mix(in srgb, var(--foreground) 6%, transparent), transparent 70%)",
          }}
        />

        {/* orbit rings */}
        {projects.map((p, i) => {
          const r = radiusOf(i);
          return (
            <div
              key={`ring-${p.id}`}
              className="pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border border-border"
              style={{ width: r * 2, height: r * 2 }}
            />
          );
        })}

        {/* central sphere */}
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
          <div
            className="relative grid h-24 w-24 place-items-center rounded-full text-white"
            style={{
              background:
                "radial-gradient(circle at 30% 25%, #52525c, #1b1b20 58%, #050506)",
              boxShadow:
                "0 20px 40px -12px rgba(0,0,0,0.5), inset 0 -6px 14px rgba(0,0,0,0.6), inset 0 4px 8px rgba(255,255,255,0.25)",
            }}
          >
            <span className="pointer-events-none absolute left-4 top-3 h-4 w-7 rounded-full bg-white/30 blur-[2px]" />
            <svg width="34" height="34" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="9" />
              <path d="M3.6 9h16.8M3.6 15h16.8M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18" />
            </svg>
          </div>
        </div>

        {/* orbiting projects */}
        {projects.map((p, i) => {
          const r = radiusOf(i);
          const dur = 30 + i * 12;
          const offset = (dur * ((i * 137) % 360)) / 360;
          const anim = {
            animationName: "orbit-spin",
            animationDuration: `${dur}s`,
            animationTimingFunction: "linear",
            animationIterationCount: "infinite",
            animationDelay: `-${offset}s`,
          } as const;
          return (
            <div key={p.id} className="absolute left-1/2 top-1/2 h-0 w-0">
              <div className="orbit-anim" style={anim}>
                <div style={{ transform: `translateX(${r}px)` }}>
                  <div
                    className="orbit-anim relative"
                    style={{ ...anim, animationDirection: "reverse" }}
                  >
                    <Link
                      href={`/project/${p.id}`}
                      className="group absolute left-0 top-0 flex w-36 -translate-x-1/2 -translate-y-1/2 flex-col items-center"
                    >
                      <GlassSphere logo={p.logo} fallback={p.initials} size={96} />
                      <span className="mt-2 rounded-full border border-border bg-surface/80 px-3 py-1 text-xs font-semibold tracking-tight backdrop-blur-sm">
                        {p.name}
                      </span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function radiusOf(i: number): number {
  return 128 + i * 52;
}
