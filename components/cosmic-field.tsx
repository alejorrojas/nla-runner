"use client";

import { useId } from "react";

type Variant = "hero" | "panel" | "whisper";

function hash(i: number, salt: number): number {
  const x = Math.sin(i * 12.9898 + salt * 78.233) * 43758.5453;
  return x - Math.floor(x);
}

const STARS = Array.from({ length: 180 }, (_, i) => ({
  x: hash(i, 1) * 100,
  y: hash(i, 2) * 100,
  r: 0.18 + hash(i, 3) * 0.85,
  o: 0.18 + hash(i, 4) * 0.82,
}));

const FLOW = Array.from({ length: 42 }, (_, i) => {
  const t = i / 41;
  const x = 8 + t * 84;
  const y = 72 - Math.sin(t * Math.PI) * 38 + (hash(i, 9) - 0.5) * 4;
  return { x, y, r: 0.35 + (1 - t) * 1.1 };
});

export function CosmicField({
  variant = "hero",
  className,
}: {
  variant?: Variant;
  className?: string;
}) {
  const uid = useId().replace(/:/g, "");
  const dark = variant !== "whisper";
  const stroke = dark ? "rgba(255,255,255,0.22)" : "rgba(10,10,10,0.12)";
  const fill = dark ? "#fff" : "#0a0a0a";

  return (
    <svg
      className={className}
      viewBox="0 0 100 100"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden
    >
      <defs>
        <radialGradient id={`glow-${uid}`} cx="72%" cy="28%" r="55%">
          <stop offset="0%" stopColor={fill} stopOpacity={dark ? 0.18 : 0.06} />
          <stop offset="100%" stopColor={fill} stopOpacity="0" />
        </radialGradient>
        <radialGradient id={`limb-${uid}`} cx="88%" cy="108%" r="42%">
          <stop offset="0%" stopColor={fill} stopOpacity={dark ? 0.16 : 0.05} />
          <stop offset="70%" stopColor={fill} stopOpacity="0" />
        </radialGradient>
      </defs>
      {dark ? <rect width="100" height="100" fill="#050505" /> : null}
      <rect width="100" height="100" fill={`url(#glow-${uid})`} />
      <rect width="100" height="100" fill={`url(#limb-${uid})`} />

      <g fill="none" stroke={stroke} strokeWidth={variant === "whisper" ? 0.18 : 0.22}>
        <ellipse cx="58" cy="46" rx="34" ry="22" transform="rotate(-18 58 46)" />
        <ellipse
          cx="58"
          cy="46"
          rx="24"
          ry="14"
          transform="rotate(12 58 46)"
          strokeDasharray="0.6 1.4"
        />
        <ellipse cx="58" cy="46" rx="16" ry="9" transform="rotate(-8 58 46)" />
        <path d="M4 78 C 28 40, 48 86, 72 52 S 92 18, 98 34" strokeDasharray="0.4 1.6" />
      </g>

      {STARS.map((s, i) => (
        <circle
          key={i}
          cx={s.x}
          cy={s.y}
          r={s.r * (variant === "whisper" ? 0.45 : 1)}
          fill={fill}
          opacity={s.o * (variant === "whisper" ? 0.28 : 1)}
        />
      ))}

      {FLOW.map((p, i) => (
        <circle
          key={`f${i}`}
          cx={p.x}
          cy={p.y}
          r={p.r * (variant === "whisper" ? 0.5 : 1)}
          fill={fill}
          opacity={dark ? 0.55 : 0.2}
        />
      ))}

      <circle cx="58" cy="46" r="1.15" fill={fill} />
      <circle cx="78" cy="38" r="0.7" fill={fill} opacity="0.7" />
      <circle cx="36" cy="58" r="0.55" fill={fill} opacity="0.55" />
    </svg>
  );
}
