"use client";

import Image from "next/image";
import { motion, useReducedMotion } from "framer-motion";
import { useState } from "react";

const tokens = [
  { id: "one", cx: 452 },
  { id: "two", cx: 598 },
  { id: "three", cx: 779 },
  { id: "four", cx: 963 },
];

const shift = 147;
const transition = {
  duration: 1.05,
  ease: [0.22, 1, 0.36, 1] as const,
};
const returnTransition = {
  duration: 1.05,
  // Exact temporal inverse of the ease-out used when selecting.
  ease: [0.64, 0, 0.78, 0] as const,
};

export function TokenPolicyIllustration() {
  const reduce = useReducedMotion();
  const [hovered, setHovered] = useState(false);
  const [active, setActive] = useState(false);

  return (
    <div
      className="relative h-full w-full overflow-hidden"
      onPointerEnter={
        reduce
          ? undefined
          : () => {
              setActive(true);
              setHovered(true);
            }
      }
      onPointerLeave={reduce ? undefined : () => setHovered(false)}
    >
      <Image
        src="/tokenpolicy.png"
        alt="A token policy selecting one token from a sequence"
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
          <defs>
            {tokens.map((token) => (
              <clipPath id={`token-${token.id}`} key={token.id}>
                <circle cx={token.cx} cy="536" r="64" />
              </clipPath>
            ))}
            <filter id="token-cover-soften" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="4" />
            </filter>
          </defs>

          <motion.g
            animate={{ opacity: active ? 1 : 0 }}
            transition={{ duration: 0.08 }}
            filter="url(#token-cover-soften)"
          >
            {tokens.map((token) => (
              <circle
                key={token.id}
                cx={token.cx}
                cy="536"
                r="67"
                fill="#d4cfbd"
              />
            ))}
          </motion.g>

          {tokens.map((token) => (
            <motion.g
              key={token.id}
              clipPath={`url(#token-${token.id})`}
              animate={{
                x: hovered ? shift : 0,
                opacity: active ? 1 : 0,
              }}
              transition={{
                x: hovered ? transition : returnTransition,
                opacity: { duration: 0.08 },
              }}
              onAnimationComplete={() => {
                if (!hovered) setActive(false);
              }}
            >
              <image
                href="/tokenpolicy.png"
                x="0"
                y="0"
                width="1448"
                height="1086"
              />
            </motion.g>
          ))}

          <motion.circle
            cx={598 + shift}
            cy="536"
            r="60"
            fill="#d66f4d"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={
              hovered
                ? { ...transition, delay: 0.35 }
                : { duration: 0.7, ease: returnTransition.ease }
            }
          />
          <motion.circle
            cx={779 + shift}
            cy="536"
            r="60"
            fill="#e9aa97"
            animate={{ opacity: hovered ? 1 : 0 }}
            transition={
              hovered
                ? { ...transition, delay: 0.35 }
                : { duration: 0.7, ease: returnTransition.ease }
            }
          />
        </svg>
      )}
    </div>
  );
}
