"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import { CosmicField } from "@/components/cosmic-field";
import { Mark } from "@/components/mark";
import { spring } from "@/components/motion";
import { KeysProvider, useKeys } from "@/lib/keys";
import { StoreProvider, useStore } from "@/lib/store-client";

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
      className={`relative flex items-center justify-between rounded-lg px-2.5 py-[7px] text-[13px] ${
        active ? "font-medium text-[var(--ink)]" : "text-[#5c6370] hover:bg-[var(--hover)]"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-lg bg-[var(--active)]"
          transition={spring}
        />
      ) : null}
      <span className="relative z-10">{label}</span>
      {count != null ? (
        <span className="relative z-10 font-mono text-[11px] text-[var(--muted)]">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function LandingBar() {
  return (
    <header className="relative z-30 flex items-center justify-between px-8 py-5">
      <Link href="/" className="flex items-center gap-2 text-[var(--ink)]">
        <Mark className="h-5 w-5" />
        <span className="text-[17px] font-medium tracking-tight">NLA Eval</span>
      </Link>
      <div className="flex items-center gap-5 text-[13px]">
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
      <div className="relative min-h-full overflow-hidden bg-[#f7f7f8]">
        <CosmicField
          variant="whisper"
          className="pointer-events-none absolute inset-0 h-full w-full opacity-70"
        />
        <LandingBar />
        <div className="relative">{children}</div>
      </div>
    );
  }

  return (
    <div className="flex min-h-full">
      <aside className="relative flex w-[232px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--sidebar)]">
        <div className="px-4 pb-4 pt-5">
          <Link href="/" className="flex items-center gap-2">
            <Mark className="h-4 w-5 text-[var(--ink)]" />
            <span className="text-[15px] font-medium tracking-tight">NLA Eval</span>
          </Link>
          <div className="mt-1 pl-7 text-[11px] text-[var(--muted)]">Personal</div>
        </div>
        <div className="px-3 pb-1 text-[11px] font-medium text-[var(--muted)]">
          Application
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink href="/lab" label="Home" active={path === "/lab"} />
          <NavLink
            href="/datasets"
            label="Datasets & Experiments"
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
        <div className="mt-6 px-3 pb-1 text-[11px] font-medium text-[var(--muted)]">
          Workspace
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink
            href="/settings"
            label="Settings"
            active={path.startsWith("/settings")}
          />
        </nav>
        <div className="mt-auto space-y-2 border-t border-[var(--line)] px-3 py-3">
          {running.length > 0 ? (
            <div className="flex items-center gap-2 text-[12px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-2 animate-ping rounded-full bg-[var(--ink)] opacity-40" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--ink)]" />
              </span>
              {running.length} run{running.length === 1 ? "" : "s"} live
            </div>
          ) : null}
          {missing ? (
            <Link href="/settings" className="text-[12px] text-[var(--ink)] hover:underline">
              Add OpenAI + Neuronpedia keys
            </Link>
          ) : (
            <div className="text-[11px] text-[var(--muted)]">Keys in this session</div>
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
