"use client";

import type { ReactNode } from "react";
import { motion } from "framer-motion";

export function PageLoader({ label = "Loading" }: { label?: string }) {
  return (
    <div className="flex min-h-[50vh] flex-col items-center justify-center gap-3 p-10">
      <motion.div
        className="h-8 w-10 rounded-full border border-[var(--line-strong)] border-t-[var(--accent)]"
        animate={{ rotate: 360 }}
        transition={{ duration: 1.1, repeat: Infinity, ease: "linear" }}
      />
      <p className="text-[13px] text-[var(--muted)]">{label}</p>
    </div>
  );
}

export function PageHeader({
  crumb,
  title,
  hint,
  action,
  tabs,
}: {
  crumb: ReactNode;
  title: ReactNode;
  hint?: string;
  action?: ReactNode;
  tabs?: ReactNode;
}) {
  return (
    <div className="border-b border-[var(--line)] bg-[var(--card)] px-6 pt-3">
      <div className="crumb">{crumb}</div>
      <div className="mt-2 flex flex-wrap items-center justify-between gap-3 pb-3">
        <div>
          <h1 className="text-[20px] font-medium tracking-tight">{title}</h1>
          {hint ? (
            <p className="mt-1 max-w-2xl text-[13px] text-[var(--muted)]">{hint}</p>
          ) : null}
        </div>
        {action}
      </div>
      {tabs ? <div className="flex gap-5 text-[13px]">{tabs}</div> : null}
    </div>
  );
}
