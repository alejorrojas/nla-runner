"use client";

import { AnimatePresence, motion } from "framer-motion";
import { spring } from "@/components/motion";

export type RunPhase = "nla" | "judge";

export type RunTick = {
  index: number;
  total: number;
  prompt: string;
  phase: RunPhase;
  completed: number;
};

function phaseLabel(phase: RunPhase): string {
  switch (phase) {
    case "nla":
      return "Completion + NLA explain";
    case "judge":
      return "LLM judge";
    default: {
      const _x: never = phase;
      return _x;
    }
  }
}

export function RunProgress({ tick }: { tick: RunTick | null }) {
  return (
    <AnimatePresence>
      {tick ? (
        <motion.div
          key="run"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 8 }}
          transition={spring}
          className="mt-4 overflow-hidden rounded-lg border border-[var(--copper)] bg-[#fffdf8]"
        >
          <div className="flex items-center gap-2 border-b border-[var(--line)] px-4 py-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-2.5 animate-ping rounded-full bg-[var(--copper)] opacity-50" />
              <span className="relative h-2.5 w-2.5 rounded-full bg-[var(--copper)]" />
            </span>
            <span className="text-[13px] font-medium">Experiment running</span>
            <span className="ml-auto font-mono text-[12px] text-[var(--muted)]">
              {tick.completed}/{tick.total} done · now {tick.index + 1}/{tick.total}
            </span>
          </div>
          <div className="h-1 bg-[var(--line)]">
            <motion.div
              className="h-full bg-[var(--copper)]"
              initial={false}
              animate={{
                width: `${Math.max(4, (tick.completed / tick.total) * 100)}%`,
              }}
              transition={spring}
            />
          </div>
          <div className="px-4 py-3">
            <div className="font-mono text-[11px] uppercase tracking-[0.14em] text-[var(--copper)]">
              {phaseLabel(tick.phase)}
            </div>
            <p className="mt-1 text-[14px] leading-snug">{tick.prompt}</p>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
