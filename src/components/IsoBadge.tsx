"use client";

import Image from "next/image";

/** Small isometric slab used as a project icon across the app. */
export function IsoBadge({
  logo,
  logos,
  wide,
  fallback,
  accent,
  size = 56,
}: {
  logo?: string;
  logos?: string[];
  wide?: boolean;
  fallback: string;
  accent: string;
  size?: number;
}) {
  const slab = Math.round(size * 0.8);
  const depth = Math.max(6, Math.round(size * 0.13));

  let mark: React.ReactNode;
  if (logos && logos.length > 0) {
    const s = Math.round(slab * 0.44);
    mark = (
      <span className="flex items-center">
        {logos.map((src, i) => (
          <Image
            key={src}
            src={src}
            alt=""
            width={s}
            height={s}
            className={`rounded-md shadow-sm ${
              i === 0 ? "-translate-y-0.5" : "-ml-1 translate-y-0.5"
            }`}
          />
        ))}
      </span>
    );
  } else if (logo && wide) {
    mark = (
      <span className="rounded bg-white/85 px-1 py-0.5 dark:bg-white/90">
        <Image
          src={logo}
          alt=""
          width={Math.round(slab * 0.82)}
          height={Math.round(slab * 0.24)}
          className="object-contain"
          style={{
            width: Math.round(slab * 0.82),
            height: Math.round(slab * 0.24),
          }}
        />
      </span>
    );
  } else if (logo) {
    mark = (
      <Image
        src={logo}
        alt=""
        width={Math.round(slab * 0.56)}
        height={Math.round(slab * 0.56)}
        className="object-contain opacity-90"
      />
    );
  } else {
    mark = (
      <span
        className="font-bold tracking-tight text-subtle"
        style={{ fontSize: Math.round(slab * 0.3) }}
      >
        {fallback}
      </span>
    );
  }

  return (
    <div
      className="iso-mini-wrap"
      style={
        {
          width: size,
          height: size,
          "--accent": accent,
          "--depth": `${depth}px`,
        } as React.CSSProperties
      }
    >
      <div className="iso-mini" style={{ width: slab, height: slab }}>
        {mark}
      </div>
    </div>
  );
}
