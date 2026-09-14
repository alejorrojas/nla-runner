"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  Database,
  FlaskConical,
  Home,
  Settings,
} from "lucide-react";
import { Mark } from "@/components/mark";
import { spring } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { KeysProvider, useKeys } from "@/lib/keys";
import { StoreProvider, useStore } from "@/lib/store-client";

function NavLink({
  href,
  label,
  count,
  active,
  icon,
}: {
  href: string;
  label: string;
  count?: number;
  active: boolean;
  icon: ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`relative flex items-center gap-2 rounded-lg px-2.5 py-[7px] text-[13px] ${
        active
          ? "font-medium text-[var(--ink)]"
          : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--ink)]"
      }`}
    >
      {active ? (
        <motion.span
          layoutId="nav-pill"
          className="absolute inset-0 rounded-lg bg-[var(--active)]"
          transition={spring}
        />
      ) : null}
      <span className="relative z-10">{icon}</span>
      <span className="relative z-10 flex-1 truncate">{label}</span>
      {count != null ? (
        <span className="relative z-10 font-mono text-[13px] text-[var(--muted)]">
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function LandingBar() {
  return (
    <header className="relative z-30 mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5 md:px-8">
      <Link href="/" className="flex items-center gap-2 text-white">
        <Mark className="h-8 w-8" />
        <span className="text-[15px] font-medium tracking-tight">NLASmith</span>
      </Link>
      <nav className="flex items-center gap-5 text-[13px]">
        <a
          href="#motivation"
          className="hidden text-white/70 hover:text-white sm:inline"
        >
          Why
        </a>
        <a
          href="#pipeline"
          className="hidden text-white/70 hover:text-white md:inline"
        >
          Pipeline
        </a>
        <a
          href="#product"
          className="hidden text-white/70 hover:text-white lg:inline"
        >
          Prototype
        </a>
        <Link href="/lab" className="text-white/70 hover:text-white">
          Home
        </Link>
        <Button
          asChild
          className="bg-[#faf9f5] text-[#141413] hover:bg-white"
        >
          <Link href="/datasets">Get started</Link>
        </Button>
      </nav>
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
      <div className="relative min-h-full">
        <div className="absolute inset-x-0 top-0 z-30">
          <LandingBar />
        </div>
        {children}
      </div>
    );
  }

  return (
    <div className="flex min-h-full">
      <aside className="relative flex w-[248px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--sidebar)]">
        <div className="px-4 pb-4 pt-5">
          <Link href="/" className="flex items-center gap-2.5">
            <Mark className="h-8 w-8 shrink-0" />
            <span className="flex min-w-0 flex-col justify-center leading-tight">
              <span className="text-[15px] font-medium tracking-tight">
                NLASmith
              </span>
              <span className="mt-0.5 text-[13px] text-[var(--muted)]">
                Personal
              </span>
            </span>
          </Link>
        </div>
        <div className="px-3 pb-1 text-[13px] font-medium text-[var(--muted)]">
          Application
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink
            href="/lab"
            label="Home"
            icon={<Home size={15} />}
            active={path === "/lab"}
          />
          <NavLink
            href="/datasets"
            label="Datasets & Experiments"
            icon={<Database size={15} />}
            count={store?.datasets.length}
            active={path.startsWith("/datasets")}
          />
          <NavLink
            href="/evaluators"
            label="Evaluators"
            icon={<FlaskConical size={15} />}
            count={store?.evaluators.length}
            active={path.startsWith("/evaluators")}
          />
        </nav>
        <div className="mt-6 px-3 pb-1 text-[13px] font-medium text-[var(--muted)]">
          Workspace
        </div>
        <nav className="flex flex-col gap-0.5 px-2">
          <NavLink
            href="/settings"
            label="Settings"
            icon={<Settings size={15} />}
            active={path.startsWith("/settings")}
          />
        </nav>
        <div className="mt-auto space-y-2 border-t border-[var(--line)] px-3 py-3">
          {running.length > 0 ? (
            <div className="flex items-center gap-2 text-[13px]">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-2 animate-ping rounded-full bg-[var(--accent)] opacity-40" />
                <span className="relative h-2 w-2 rounded-full bg-[var(--accent)]" />
              </span>
              {running.length} run{running.length === 1 ? "" : "s"} live
            </div>
          ) : null}
          {missing ? (
            <Link href="/settings" className="text-[13px] text-[var(--accent)] hover:underline">
              Add OpenAI + Neuronpedia keys
            </Link>
          ) : (
            <div className="text-[13px] text-[var(--muted)]">Keys in this session</div>
          )}
          <div className="pt-1 text-[13px] text-[var(--muted)]">Personal workspace</div>
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
