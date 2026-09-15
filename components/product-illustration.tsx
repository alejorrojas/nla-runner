"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

export type ProductIllustrationKind =
  | "dataset"
  | "nla-source"
  | "evaluators"
  | "live-runs"
  | "metrics";

const forward = {
  duration: 1.05,
  ease: [0.22, 1, 0.36, 1] as const,
};

const reverse = {
  duration: 1.05,
  ease: [0.64, 0, 0.78, 0] as const,
};

function DatasetMotion({ hovered }: { hovered: boolean }) {
  const lines = [
    "M486 442 L668 418",
    "M462 511 L648 487",
    "M458 575 L618 555",
  ];

  return (
    <>
      <motion.path
        d="M367 386 Q375 360 405 356 L733 319 Q758 316 752 345 L711 614 Q707 637 681 640 L385 661 Q358 663 367 636 Z"
        fill="none"
        stroke="#d97757"
        strokeWidth="6"
        strokeLinecap="round"
        strokeLinejoin="round"
        initial={false}
        animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.5 : 0 }}
        transition={hovered ? forward : reverse}
      />
      {lines.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#d97757"
          strokeWidth="7"
          strokeLinecap="round"
          initial={false}
          animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.9 : 0 }}
          transition={{
            ...(hovered ? forward : reverse),
            delay: hovered ? index * 0.1 : (lines.length - index - 1) * 0.06,
          }}
        />
      ))}
      <motion.circle
        cx="970"
        cy="550"
        r="67"
        fill="none"
        stroke="#d97757"
        strokeWidth="5"
        initial={false}
        animate={{
          opacity: hovered ? [0, 0.75, 0] : 0,
          scale: hovered ? [0.8, 1.18, 1.3] : 0.8,
        }}
        style={{ transformOrigin: "970px 550px" }}
        transition={hovered ? { duration: 1.05, times: [0, 0.6, 1] } : reverse}
      />
    </>
  );
}

function NlaSourceMotion({ hovered }: { hovered: boolean }) {
  const nodes = [
    [913, 517],
    [1092, 416],
    [1225, 551],
    [1055, 650],
  ] as const;

  return (
    <>
      <motion.path
        d="M614 537 C675 473 755 476 819 535"
        fill="none"
        stroke="#f6ded4"
        strokeWidth="12"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
        transition={hovered ? forward : reverse}
      />
      {nodes.map(([cx, cy], index) => (
        <motion.circle
          key={cx}
          cx={cx}
          cy={cy}
          r="62"
          fill="none"
          stroke="#f6ded4"
          strokeWidth="8"
          initial={false}
          animate={{
            opacity: hovered ? [0, 0.9, 0] : 0,
            scale: hovered ? [0.88, 1.12, 1.25] : 0.88,
          }}
          style={{ transformOrigin: `${cx}px ${cy}px` }}
          transition={{
            duration: 0.72,
            delay: hovered ? 0.25 + index * 0.12 : 0,
            times: [0, 0.55, 1],
          }}
        />
      ))}
    </>
  );
}

function EvaluatorsMotion({ hovered }: { hovered: boolean }) {
  const checks = [
    "M413 414 L430 438 L465 391",
    "M413 687 L430 711 L465 664",
  ];

  return (
    <>
      {checks.map((d, index) => (
        <motion.path
          key={d}
          d={d}
          fill="none"
          stroke="#d97757"
          strokeWidth="9"
          strokeLinecap="round"
          strokeLinejoin="round"
          initial={false}
          animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 1 : 0 }}
          transition={{
            ...(hovered ? forward : reverse),
            delay: hovered ? index * 0.18 : 0,
          }}
        />
      ))}
      <motion.circle
        cx="982"
        cy="555"
        r="80"
        fill="none"
        stroke="#d97757"
        strokeWidth="7"
        initial={false}
        animate={{
          opacity: hovered ? [0, 0.85, 0] : 0,
          scale: hovered ? [0.78, 1.08, 1.25] : 0.78,
        }}
        style={{ transformOrigin: "982px 555px" }}
        transition={
          hovered
            ? { duration: 0.9, delay: 0.32, times: [0, 0.55, 1] }
            : reverse
        }
      />
    </>
  );
}

function LiveRunsMotion({ hovered }: { hovered: boolean }) {
  const route =
    "M216 640 C330 529 413 532 500 640 C604 751 704 452 820 505 C925 553 946 629 1034 580";

  return (
    <>
      <motion.path
        d={route}
        fill="none"
        stroke="#f8ddd2"
        strokeWidth="12"
        strokeLinecap="round"
        initial={false}
        animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.95 : 0 }}
        transition={hovered ? forward : reverse}
      />
      {[216, 500, 820].map((cx, index) => {
        const cy = [640, 640, 505][index];
        return (
          <motion.circle
            key={cx}
            cx={cx}
            cy={cy}
            r="31"
            fill="#faf8f4"
            initial={false}
            animate={{
              opacity: hovered ? [0, 1, 0] : 0,
              scale: hovered ? [0.65, 1.18, 1] : 0.65,
            }}
            style={{ transformOrigin: `${cx}px ${cy}px` }}
            transition={{
              duration: 0.55,
              delay: hovered ? index * 0.2 : 0,
              times: [0, 0.55, 1],
            }}
          />
        );
      })}
      <motion.circle
        cx="1145"
        cy="516"
        r="99"
        fill="none"
        stroke="#f8ddd2"
        strokeWidth="8"
        initial={false}
        animate={{
          opacity: hovered ? [0, 0.9, 0] : 0,
          scale: hovered ? [0.78, 1.08, 1.25] : 0.78,
        }}
        style={{ transformOrigin: "1145px 516px" }}
        transition={
          hovered
            ? { duration: 0.85, delay: 0.45, times: [0, 0.55, 1] }
            : reverse
        }
      />
    </>
  );
}

function MetricsMotion({ hovered }: { hovered: boolean }) {
  const bars = [
    { x: 377, y: 594, width: 51, height: 67, fill: "#aaa596" },
    { x: 448, y: 527, width: 51, height: 131, fill: "#aaa596" },
    { x: 521, y: 458, width: 51, height: 194, fill: "#aaa596" },
    { x: 594, y: 570, width: 51, height: 76, fill: "#aaa596" },
    { x: 757, y: 637, width: 55, height: 68, fill: "#d59078" },
    { x: 837, y: 518, width: 55, height: 188, fill: "#d59078" },
    { x: 916, y: 575, width: 55, height: 132, fill: "#d59078" },
    { x: 994, y: 642, width: 55, height: 70, fill: "#d59078" },
  ];

  return (
    <>
      {bars.map((bar, index) => (
        <motion.rect
          key={`${bar.x}-${bar.y}`}
          {...bar}
          rx="4"
          initial={false}
          animate={{
            opacity: hovered ? 0.72 : 0,
            scaleY: hovered ? [0.25, 1.14, 1] : 0.25,
          }}
          style={{
            transformBox: "fill-box",
            transformOrigin: "center bottom",
          }}
          transition={{
            duration: hovered ? 0.72 : 0.55,
            delay: hovered ? index * 0.055 : 0,
            ease: hovered ? forward.ease : reverse.ease,
          }}
        />
      ))}
    </>
  );
}

export function ProductIllustration({
  kind,
  src,
  alt,
}: {
  kind: ProductIllustrationKind;
  src: string;
  alt: string;
}) {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onPointerEnter={reduce ? undefined : () => setHovered(true)}
      onPointerLeave={reduce ? undefined : () => setHovered(false)}
    >
      <Image
        src={src}
        alt={alt}
        fill
        sizes="(min-width: 1024px) 380px, (min-width: 640px) 50vw, 100vw"
        className="object-cover"
      />
      {reduce ? null : (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1448 1086"
          preserveAspectRatio="xMidYMid slice"
        >
          {kind === "dataset" ? <DatasetMotion hovered={hovered} /> : null}
          {kind === "nla-source" ? <NlaSourceMotion hovered={hovered} /> : null}
          {kind === "evaluators" ? <EvaluatorsMotion hovered={hovered} /> : null}
          {kind === "live-runs" ? <LiveRunsMotion hovered={hovered} /> : null}
          {kind === "metrics" ? <MetricsMotion hovered={hovered} /> : null}
        </svg>
      )}
    </div>
  );
}
