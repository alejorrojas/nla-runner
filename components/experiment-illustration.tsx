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

export function ExperimentIllustration() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onPointerEnter={reduce ? undefined : () => setHovered(true)}
      onPointerLeave={reduce ? undefined : () => setHovered(false)}
    >
      <Image
        src="/experiment.jpg"
        alt="A question passing through Reddit style discourse before the visible reply"
        fill
        unoptimized
        sizes="(min-width: 1024px) 590px, 100vw"
        className="object-cover object-center"
      />

      {reduce ? null : (
        <svg
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full"
          viewBox="0 0 1024 768"
          preserveAspectRatio="xMidYMid slice"
        >
          <motion.path
            d="M487 258 C544 194 618 199 654 260"
            fill="none"
            stroke="#d97757"
            strokeWidth="7"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.85 : 0 }}
            transition={hovered ? forward : reverse}
          />
          <motion.path
            d="M531 538 C464 560 397 534 379 467"
            fill="none"
            stroke="#d97757"
            strokeWidth="7"
            strokeLinecap="round"
            initial={false}
            animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.85 : 0 }}
            transition={{
              ...(hovered ? forward : reverse),
              delay: hovered ? 0.18 : 0,
            }}
          />

          <motion.circle
            cx="390"
            cy="363"
            r="60"
            fill="none"
            stroke="#d97757"
            strokeWidth="5"
            initial={false}
            animate={{
              opacity: hovered ? [0, 0.65, 0] : 0,
              scale: hovered ? [0.72, 1.08, 1.28] : 0.72,
            }}
            style={{ transformOrigin: "390px 363px" }}
            transition={
              hovered
                ? { duration: 0.8, times: [0, 0.55, 1] }
                : reverse
            }
          />

          {[
            "M540 423 L669 423",
            "M537 455 L665 455",
            "M537 486 L625 486",
          ].map((d, index) => (
            <motion.path
              key={d}
              d={d}
              fill="none"
              stroke="#faf8f4"
              strokeWidth="6"
              strokeLinecap="round"
              initial={false}
              animate={{ pathLength: hovered ? 1 : 0, opacity: hovered ? 0.8 : 0 }}
              transition={{
                ...(hovered ? forward : reverse),
                delay: hovered ? 0.38 + index * 0.09 : 0,
              }}
            />
          ))}
        </svg>
      )}
    </div>
  );
}
