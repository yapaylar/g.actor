"use client";

import Image from "next/image";

export function GlassSphere({
  logo,
  fallback,
  size = 132,
}: {
  logo?: string;
  fallback: string;
  size?: number;
}) {
  const droplet = Math.round(size * 0.52);

  return (
    <div
      className="relative mx-auto transition-transform duration-300 ease-out group-hover:-translate-y-1.5"
      style={{ width: size, height: size }}
    >
      {/* ground shadow */}
      <div
        className="glass-shadow absolute bottom-1 left-1/2 -translate-x-1/2 rounded-full blur-md transition-all duration-300 group-hover:scale-110 group-hover:opacity-90"
        style={{ width: size * 0.55, height: size * 0.1 }}
      />

      {/* glass shell */}
      <div className="glass-shell relative h-full w-full overflow-hidden rounded-full">
        {/* inner droplet */}
        <div
          className="glass-droplet absolute left-1/2 top-1/2 grid -translate-x-1/2 -translate-y-[46%] place-items-center rounded-full"
          style={{ width: droplet, height: droplet }}
        >
          {logo ? (
            <Image
              src={logo}
              alt=""
              width={Math.round(droplet * 0.58)}
              height={Math.round(droplet * 0.58)}
              className="object-contain drop-shadow-sm"
              style={{ filter: "grayscale(0.15) contrast(1.05)" }}
            />
          ) : (
            <span
              className="font-semibold tracking-tight text-foreground/80"
              style={{ fontSize: droplet * 0.22 }}
            >
              {fallback}
            </span>
          )}
        </div>

        {/* glass highlights */}
        <span className="glass-hi pointer-events-none absolute left-[16%] top-[10%] h-[22%] w-[34%] rounded-full blur-[3px]" />
        <span className="pointer-events-none absolute bottom-[14%] right-[12%] h-[10%] w-[18%] rounded-full bg-white/35 blur-[2px]" />
      </div>
    </div>
  );
}
