"use client";

import { useReducedMotion } from "framer-motion";
import { useRef, useState, type PointerEvent } from "react";

const wordClass =
  "col-start-1 row-start-1 whitespace-nowrap font-display text-[16.4cqw] leading-none tracking-[-0.06em]";

export function FooterWordmark() {
  const ref = useRef<HTMLDivElement>(null);
  const reduce = useReducedMotion();
  const [lit, setLit] = useState(false);

  function follow(e: PointerEvent<HTMLDivElement>) {
    const el = ref.current;
    if (!el) return;
    const box = el.getBoundingClientRect();
    el.style.setProperty("--lx", `${e.clientX - box.left}px`);
    el.style.setProperty("--ly", `${e.clientY - box.top}px`);
  }

  return (
    <div
      ref={ref}
      onPointerEnter={
        reduce
          ? undefined
          : (e) => {
              setLit(true);
              follow(e);
            }
      }
      onPointerMove={reduce ? undefined : follow}
      onPointerLeave={reduce ? undefined : () => setLit(false)}
      className="group/wm relative grid cursor-default pointer-events-auto [--lx:50%] [--ly:45%]"
    >
      <p className={`${wordClass} text-[#141413] [-webkit-text-stroke:0.018em_rgba(250,249,245,0.22)]`}>
        NLASmith
      </p>
      {reduce ? null : (
        <p
          aria-hidden
          className={`${wordClass} pointer-events-none bg-clip-text text-transparent opacity-0 transition-opacity duration-200 group-hover/wm:opacity-100 ${
            lit ? "opacity-100" : ""
          }`}
          style={{
            backgroundImage:
              "radial-gradient(18cqw circle at var(--lx) var(--ly), rgb(250 249 245 / 0.96) 0%, rgb(232 196 168 / 0.55) 32%, transparent 68%)",
            WebkitBackgroundClip: "text",
            backgroundClip: "text",
            filter: "drop-shadow(0 0 22px rgb(250 249 245 / 0.35))",
          }}
        >
          NLASmith
        </p>
      )}
    </div>
  );
}
