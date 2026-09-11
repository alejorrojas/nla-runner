"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { KeysProvider, useKeys } from "@/lib/keys";
import { StoreProvider, useStore } from "@/lib/store-client";
import { spring } from "@/components/motion";

function NavLink({
  href,
  label,
  count,
  active,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center justify-between rounded-md px-2.5 py-[7px] text-[13px] ${
        active ? "text-[#f7f1e4]" : "text-[#c9bfaa] hover:text-[#f7f1e4]"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-md bg-[#2a241c]"
          transition={spring}
        />
      ) : null}
      <span className="relative z-10">{label}</span>
      {count != null ? (
        <span
          className={`relative z-10 font-mono text-[11px] ${
            active ? "text-[#e8b48a]" : "text-[#8d8270]"
          }`}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function LandingBar() {
  return (
    <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[var(--line)] bg-[var(--card)] px-6 py-3">
      <Link href="/" className="font-display text-[22px] tracking-tight text-[var(--ink)]">
        NLA Eval
      </Link>
      <div className="flex items-center gap-4 text-[13px]">
        <Link href="/lab" className="text-[var(--muted)] hover:text-[var(--ink)]">
          How it works
        </Link>
        <Link href="/datasets" className="btn btn-primary">
          Open the lab
        </Link>
      </div>
    </header>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { keys } = useKeys();
  const { store } = useStore();
  const missing = !keys.openai || !keys.neuronpedia;
  const running = store?.experiments.filter((e) => e.status === "running") ?? [];

  if (path === "/") {
    return (
      <div className="min-h-full">
        <LandingBar />
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full">
      <aside className="flex w-[232px] shrink-0 flex-col bg-[var(--sidebar)] text-[#f7f1e4]">
        <div className="px-4 pb-4 pt-5">
          <Link href="/" className="font-display text-[22px] leading-none">
            NLA Eval
          </Link>
          <div className="mt-1 font-mono text-[10px] uppercase tracking-[0.18em] text-[#8d8270]">
            Residual-stream lab
          </div>
        </div>
        <div className="px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d8270]">
          Bench
        </div>
        <nav className="flex flex-col gap-[2px] px-2">
          <NavLink href="/lab" label="Lab" active={path === "/lab"} />
          <NavLink
            href="/datasets"
            label="Datasets"
            count={store?.datasets.length}
            active={path.startsWith("/datasets")}
          />
          <NavLink
            href="/evaluators"
            label="Evaluators"
            count={store?.evaluators.length}
            active={path.startsWith("/evaluators")}
          />
        </nav>
        <div className="mt-6 px-3 pb-1 font-mono text-[10px] uppercase tracking-[0.16em] text-[#8d8270]">
          Workspace
        </div>
        <nav className="flex flex-col gap-[2px] px-2">
          <NavLink
            href="/settings"
            label="Keys"
            active={path.startsWith("/settings")}
          />
        </nav>
        <div className="mt-auto space-y-2 border-t border-[#2f2a24] px-3 py-3">
          {running.length > 0 ? (
            <div className="flex items-center gap-2 text-[12px] text-[#e8b48a]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-2 animate-ping rounded-full bg-[#c45c26] opacity-60" />
                <span className="relative h-2 w-2 rounded-full bg-[#c45c26]" />
              </span>
              {running.length} run{running.length === 1 ? "" : "s"} live
            </div>
          ) : null}
          {missing ? (
            <Link href="/settings" className="text-[12px] text-[#e8b48a] hover:underline">
              Add OpenAI + Neuronpedia keys
            </Link>
          ) : (
            <div className="text-[11px] text-[#8d8270]">Keys in this session</div>
          )}
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-[var(--bg)]">{children}</main>
    </div>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <KeysProvider>
      <StoreProvider>
        <ShellInner>{children}</ShellInner>
      </StoreProvider>
    </KeysProvider>
  );
}
