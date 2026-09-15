"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { AnimatePresence, motion, MotionConfig } from "framer-motion";
import {
  Database,
  FlaskConical,
  Home,
  KeyRound,
  LogOut,
  PanelLeftClose,
  PanelLeftOpen,
  Settings,
} from "lucide-react";
import { Mark } from "@/components/mark";
import { PageFade, spring, useLimitedMotion } from "@/components/motion";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { KeysProvider, useKeys } from "@/lib/keys";
import { StoreProvider, useStore } from "@/lib/store-client";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import { toAppPath } from "@/lib/urls";
import { cn } from "@/lib/utils";

const SIDEBAR_KEY = "nlasmith-sidebar-collapsed";

function NavLink({
  href,
  label,
  count,
  countPending,
  active,
  icon,
  collapsed,
}: {
  href: string;
  label: string;
  count?: number;
  countPending?: boolean;
  active: boolean;
  icon: ReactNode;
  collapsed: boolean;
}) {
  const limited = useLimitedMotion();
  const link = (
    <Link
      href={href}
      className={cn(
        "relative flex items-center rounded-lg text-[13px]",
        collapsed
          ? "justify-center px-0 py-[9px]"
          : "gap-2 px-2.5 py-[7px]",
        active
          ? "font-medium text-[var(--ink)]"
          : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--ink)]",
      )}
    >
      {active ? (
        limited ? (
          <span className="absolute inset-0 rounded-lg bg-[var(--active)]" />
        ) : (
          <motion.span
            layoutId="nav-pill"
            className="absolute inset-0 rounded-lg bg-[var(--active)]"
            transition={spring}
          />
        )
      ) : null}
      <span className="relative z-10">{icon}</span>
      {collapsed ? null : (
        <>
          <span className="relative z-10 min-w-0 flex-1 truncate">{label}</span>
          {countPending ? (
            <Skeleton className="relative z-10 h-3 w-4" />
          ) : count != null ? (
            <span className="relative z-10 font-mono text-[13px] text-[var(--muted)]">
              {count}
            </span>
          ) : null}
        </>
      )}
    </Link>
  );
  if (!collapsed) return link;
  return (
    <Tooltip>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function LandingBar() {
  return (
    <header className="relative z-30 mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5 md:px-8">
      <Link href="/" className="flex items-center gap-2 text-white">
        <Mark className="h-8 w-8" />
        <span className="text-[15px] font-medium tracking-tight">NLASmith</span>
      </Link>
      <nav className="flex items-center gap-5 text-[13px] font-medium text-[#faf9f5] [text-shadow:0_1px_2px_rgba(20,20,19,0.55),0_0_18px_rgba(20,20,19,0.45)]">
        <a
          href="#motivation"
          className="hidden hover:text-white sm:inline"
        >
          Why
        </a>
        <a
          href="#pipeline"
          className="hidden hover:text-white md:inline"
        >
          Pipeline
        </a>
        <a
          href="#product"
          className="hidden hover:text-white lg:inline"
        >
          Prototype
        </a>
        <Link href={toAppPath("/login")} className="hover:text-white">
          Home
        </Link>
        <Button
          asChild
          size="lg"
          className="h-11 bg-[#faf9f5] px-6 text-[#141413] [text-shadow:none] hover:bg-white"
        >
          <Link href={toAppPath("/login")}>Get started</Link>
        </Button>
      </nav>
    </header>
  );
}

function ShellInner({ children }: { children: ReactNode }) {
  const path = usePathname();
  const { hints, hydrated } = useKeys();
  const { store } = useStore();
  const limited = useLimitedMotion();
  const missing = hydrated && (!hints.openaiHint || !hints.neuronpediaHint);
  const running = store?.experiments.filter((e) => e.status === "running") ?? [];
  const [collapsed, setCollapsed] = useState(false);
  const [fullName, setFullName] = useState<string | null>(null);

  useEffect(() => {
    setCollapsed(window.localStorage.getItem(SIDEBAR_KEY) === "1");
  }, []);

  useEffect(() => {
    if (path === "/" || path === "/login") return;
    void (async () => {
      const supabase = createBrowserSupabase();
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) return;
      const { data } = await supabase
        .from("profiles")
        .select("full_name")
        .eq("id", user.id)
        .maybeSingle();
      const name = typeof data?.full_name === "string" ? data.full_name.trim() : "";
      setFullName(name || null);
    })();
  }, [path]);

  function toggleSidebar() {
    setCollapsed((value) => {
      const next = !value;
      window.localStorage.setItem(SIDEBAR_KEY, next ? "1" : "0");
      return next;
    });
  }

  if (path === "/login") {
    return <>{children}</>;
  }

  if (path === "/") {
    return (
      <div className="relative min-h-full">
        <div className="absolute inset-x-0 top-0 z-30 bg-gradient-to-b from-[#141413]/50 via-[#141413]/20 to-transparent">
          <LandingBar />
        </div>
        {children}
      </div>
    );
  }

  return (
    <MotionConfig reducedMotion={limited ? "always" : "user"}>
      <div className="flex min-h-full">
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 64 : 248 }}
          transition={limited ? { duration: 0 } : spring}
          className="relative flex shrink-0 flex-col overflow-hidden border-r border-[var(--line)] bg-[var(--sidebar)]"
        >
          <div
            className={cn(
              "flex items-center pb-4 pt-5",
              collapsed ? "flex-col gap-3 px-2" : "justify-between gap-2 px-3",
            )}
          >
            <Link
              href="/"
              className={cn(
                "flex min-w-0 items-center gap-2.5",
                collapsed && "justify-center",
              )}
            >
              <Mark className="h-8 w-8 shrink-0" />
              <AnimatePresence initial={false}>
                {collapsed ? null : (
                  <motion.span
                    key="brand"
                    initial={limited ? false : { opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={limited ? undefined : { opacity: 0 }}
                    className="flex min-w-0 flex-col justify-center leading-tight"
                  >
                    <span className="text-[15px] font-medium tracking-tight">
                      NLASmith
                    </span>
                    <span className="mt-0.5 truncate text-[13px] text-[var(--muted)]">
                      {fullName ?? "Personal"}
                    </span>
                  </motion.span>
                )}
              </AnimatePresence>
            </Link>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-[var(--muted)]"
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
                  onClick={toggleSidebar}
                >
                  {collapsed ? (
                    <PanelLeftOpen size={15} />
                  ) : (
                    <PanelLeftClose size={15} />
                  )}
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? "Expand sidebar" : "Collapse sidebar"}
              </TooltipContent>
            </Tooltip>
          </div>
          {collapsed ? null : (
            <div className="px-3 pb-1 text-[13px] font-medium text-[var(--muted)]">
              Application
            </div>
          )}
          <nav className="flex flex-col gap-0.5 px-2">
            <NavLink
              href="/lab"
              label="Home"
              icon={<Home size={15} />}
              active={path === "/lab"}
              collapsed={collapsed}
            />
            <NavLink
              href="/datasets"
              label="Datasets & Experiments"
              icon={<Database size={15} />}
              count={store?.datasets.length}
              countPending={!store}
              active={path.startsWith("/datasets")}
              collapsed={collapsed}
            />
            <NavLink
              href="/evaluators"
              label="Evaluators"
              icon={<FlaskConical size={15} />}
              count={store?.evaluators.length}
              countPending={!store}
              active={path.startsWith("/evaluators")}
              collapsed={collapsed}
            />
          </nav>
          {collapsed ? (
            <div className="mt-4" />
          ) : (
            <div className="mt-6 px-3 pb-1 text-[13px] font-medium text-[var(--muted)]">
              Workspace
            </div>
          )}
          <nav className="flex flex-col gap-0.5 px-2">
            <NavLink
              href="/settings"
              label="Settings"
              icon={<Settings size={15} />}
              active={path.startsWith("/settings")}
              collapsed={collapsed}
            />
          </nav>
          <div
            className={cn(
              "mt-auto space-y-2 border-t border-[var(--line)] py-3",
              collapsed ? "px-2" : "px-3",
            )}
          >
            {running.length > 0 ? (
              collapsed ? (
                <Tooltip>
                  <TooltipTrigger asChild>
                    <div className="flex justify-center py-1">
                      <span className="relative flex h-2 w-2">
                        {limited ? null : (
                          <span className="absolute inline-flex h-full w-2 animate-ping rounded-full bg-[var(--accent)] opacity-40" />
                        )}
                        <span className="relative h-2 w-2 rounded-full bg-[var(--accent)]" />
                      </span>
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="right">
                    {running.length} run{running.length === 1 ? "" : "s"} live
                  </TooltipContent>
                </Tooltip>
              ) : (
                <div className="flex items-center gap-2 text-[13px]">
                  <span className="relative flex h-2 w-2">
                    {limited ? null : (
                      <span className="absolute inline-flex h-full w-2 animate-ping rounded-full bg-[var(--accent)] opacity-40" />
                    )}
                    <span className="relative h-2 w-2 rounded-full bg-[var(--accent)]" />
                  </span>
                  {running.length} run{running.length === 1 ? "" : "s"} live
                </div>
              )
            ) : null}
            {collapsed ? (
              <>
                {!hydrated ? (
                  <div className="flex justify-center py-1">
                    <Skeleton className="h-3 w-3 rounded-full" />
                  </div>
                ) : missing ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Link
                        href="/settings"
                        className="flex justify-center py-1 text-[var(--accent)]"
                      >
                        <KeyRound size={15} />
                      </Link>
                    </TooltipTrigger>
                    <TooltipContent side="right">
                      Add OpenAI + Neuronpedia keys
                    </TooltipContent>
                  </Tooltip>
                ) : null}
                <Tooltip>
                  <TooltipTrigger asChild>
                    <button
                      type="button"
                      className="flex w-full justify-center py-1 text-[var(--muted)] hover:text-[var(--ink)]"
                      aria-label="Sign out"
                      onClick={() => {
                        void (async () => {
                          const { createBrowserSupabase } = await import(
                            "@/lib/supabase/browser"
                          );
                          await createBrowserSupabase().auth.signOut();
                          window.location.href = "/login";
                        })();
                      }}
                    >
                      <LogOut size={15} />
                    </button>
                  </TooltipTrigger>
                  <TooltipContent side="right">Sign out</TooltipContent>
                </Tooltip>
              </>
            ) : (
              <>
                {!hydrated ? (
                  <Skeleton className="h-3.5 w-36" />
                ) : missing ? (
                  <Link
                    href="/settings"
                    className="text-[13px] text-[var(--accent)] hover:underline"
                  >
                    Add OpenAI + Neuronpedia keys
                  </Link>
                ) : (
                  <div className="text-[13px] text-[var(--muted)]">
                    Keys in this session
                  </div>
                )}
                <div className="pt-1 text-[13px] text-[var(--muted)]">
                  Personal workspace
                </div>
                <button
                  type="button"
                  className="text-[13px] text-[var(--muted)] hover:text-[var(--ink)]"
                  onClick={() => {
                    void (async () => {
                      const { createBrowserSupabase } = await import(
                        "@/lib/supabase/browser"
                      );
                      await createBrowserSupabase().auth.signOut();
                      window.location.href = "/login";
                    })();
                  }}
                >
                  Sign out
                </button>
              </>
            )}
          </div>
        </motion.aside>
        <main className="min-w-0 flex-1 overflow-auto bg-[var(--bg)]">
          <PageFade key={path} className="min-h-full">
            {children}
          </PageFade>
        </main>
      </div>
    </MotionConfig>
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
