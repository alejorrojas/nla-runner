"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const forward = {
  duration: 1.05,
  ease: [0.22, 1, 0.36, 1] as const,
};

const reverse = {
  duration: 1.05,
  ease: [0.64, 0, 0.78, 0] as const,
};

function GapMotion({ hovered }: { hovered: boolean }) {
  const nodes = [
    [511, 151],
    [566, 65],
    [592, 118],
    [660, 105],
    [592, 176],
    [678, 185],
    [539, 228],
    [629, 243],
  ] as const;

  return (
    <>
      <motion.path
        d="M371 151 C426 148 451 175 511 151 C542 139 558 126 592 118 C620 111 632 105 660 105"
        fill="none"
        stroke="#fae8df"
        strokeWidth="5"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.95 : 0 }}
        transition={hovered ? forward : reverse}
      />
      {nodes.map(([cx, cy], index) => (
        <motion.circle
          key={`${cx}-${cy}`}
          cx={cx}
          cy={cy}
          r={index === 4 ? 22 : index === 3 || index === 5 ? 18 : 11}
          fill="none"
          stroke="#fae8df"
          strokeWidth="4"
          initial={false}
          animate={{
            opacity: hovered ? [0, 0.85, 0] : 0,
            scale: hovered ? [0.75, 1.2, 1.38] : 0.75,
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{
            duration: 0.58,
            delay: hovered ? 0.18 + index * 0.075 : 0,
            times: [0, 0.55, 1],
          }}
        />
      ))}
      <motion.path
        d="M459 97 C485 22 579 17 637 53 C724 59 743 116 724 187 C742 248 682 299 609 299 C544 316 467 280 464 230 C444 190 449 139 459 97 Z"
        fill="none"
        stroke="#fae8df"
        strokeWidth="2"
        strokeDasharray="5 8"
        initial={false}
        animate={{
          opacity: hovered ? 0.48 : 0,
          pathLength: hovered ? 1 : 0,
          pathOffset: hovered ? [0, 0.08] : 0,
        }}
        transition={hovered ? forward : reverse}
      />
    </>
  );
}

function MethodMotion({ hovered }: { hovered: boolean }) {
  const outputs = [
    { cx: 880, cy: 228, r: 21 },
    { cx: 875, cy: 311, r: 18 },
    { cx: 878, cy: 392, r: 20 },
  ];

  return (
    <>
      <motion.path
        d="M270 311 L434 311 C482 311 516 287 558 311 C614 343 648 311 701 311"
        fill="none"
        stroke="#d97757"
        strokeWidth="5"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.85 : 0 }}
        transition={hovered ? forward : reverse}
      />
      {[
        "M701 311 C780 311 778 228 850 228",
        "M701 311 L850 311",
        "M701 311 C780 311 778 392 850 392",
      ].map((d, index) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#d97757"
          strokeWidth="4"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.8 : 0 }}
          transition={{
            ...(hovered ? forward : reverse),
            delay: hovered ? 0.3 + index * 0.08 : 0,
          }}
        />
      ))}
      {[436, 497, 602].map((cx, index) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={index === 1 ? 326 : 311}
          r="11"
          fill="#faf8f4"
          initial={false}
          animate={{
            opacity: hovered ? [0, 1, 0] : 0,
            scale: hovered ? [0.65, 1.25, 1] : 0.65,
          }}
          style={{ transformOrigin: `${cx}px ${index === 1 ? 326 : 311}px` }}
          transition={{
            duration: 0.55,
            delay: hovered ? index * 0.18 : 0,
            times: [0, 0.55, 1],
          }}
        />
      ))}
      {outputs.map(({ cx, cy, r }, index) => (
        <motion.circle
          key={cy}
          cx={cx}
          cy={cy}
          r={r}
          fill="none"
          stroke="#d97757"
          strokeWidth="5"
          initial={false}
          animate={{
            opacity: hovered ? [0, 0.8, 0] : 0,
            scale: hovered ? [0.7, 1.16, 1.3] : 0.7,
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{
            duration: 0.65,
            delay: hovered ? 0.55 + index * 0.1 : 0,
            times: [0, 0.55, 1],
          }}
        />
      ))}
    </>
  );
}

export function MotivationIllustration({
  kind,
  src,
  alt,
  sizes,
}: {
  kind: "gap" | "method";
  src: string;
  alt: string;
  sizes: string;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const viewBox = kind === "gap" ? "0 0 1024 341" : "0 0 1024 610";

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onPointerEnter={reduce ? undefined : () => setHovered(true)}
      onPointerLeave={reduce ? undefined : () => setHovered(false)}
    >
      <Image src={src} alt={alt} fill sizes={sizes} className="object-cover" />
      {reduce ? null : (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox={viewBox}
          preserveAspectRatio="xMidYMid slice"
        >
          {kind === "gap" ? <GapMotion hovered={hovered} /> : null}
          {kind === "method" ? <MethodMotion hovered={hovered} /> : null}
        </svg>
      )}
    </div>
  );
}
