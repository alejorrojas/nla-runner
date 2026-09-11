"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";
import { spring } from "@/components/motion";

export function PageLoader({ label = "Loading the lab" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-4 p-10">
      <motion.div
        className="h-10 w-10 rounded-full border-2 border-[var(--line-strong)] border-t-[var(--copper)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 0.9, repeat: Infinity, ease: "linear" }}
      />
      <motion.p
        className="text-[13px] text-[var(--muted)]"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={spring}
      >
        {label}
      </motion.p>
    </div>
  );
}

export function PageHeader({
  crumb,
  title,
  hint,
  action,
}: {
  crumb: ReactNode;
  title: ReactNode;
  hint?: string;
  action?: ReactNode;
}) {
  return (
    <div className="border-b border-[var(--line)] bg-[var(--card)] px-6 py-4">
      <div className="crumb">{crumb}</div>
      <div className="mt-2 flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-[28px] leading-none tracking-tight">
            {title}
          </h1>
          {hint ? (
            <p className="mt-2 max-w-xl text-[13px] text-[var(--muted)]">{hint}</p>
          ) : null}
        </div>
        {action}
      </div>
    </div>
  );
}
