"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, MotionConfig } from "framer-motion";
import {
  Database,
  FlaskConical,
  Home,
  KeyRound,
  LogOut,
  PanelLeft,
  Settings,
} from "lucide-react";
import { Mark } from "@/components/mark";
import { PageFade, spring, useLimitedMotion } from "@/components/motion";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
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

function initialsFromName(name: string | null) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase();
}

async function signOut() {
  const supabase = createBrowserSupabase();
  await supabase.auth.signOut();
  window.location.href = "/login";
}

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

function AccountMenu({
  collapsed,
  displayName,
  missingKeys,
  hydrated,
}: {
  collapsed: boolean;
  displayName: string;
  missingKeys: boolean;
  hydrated: boolean;
}) {
  const [open, setOpen] = useState(false);
  const initials = initialsFromName(displayName === "Account" ? null : displayName);

  const itemClass =
    "flex w-full items-center gap-2.5 rounded-xl px-2.5 py-2 text-left text-[13px] text-[var(--ink)] hover:bg-[var(--hover)]";

  const trigger = (
    <button
      type="button"
      className={cn(
        "flex w-full items-center rounded-xl text-left transition-colors hover:bg-[var(--hover)]",
        collapsed ? "justify-center p-1.5" : "gap-2.5 px-1.5 py-1.5",
      )}
      aria-label="Account menu"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ok)] text-[12px] font-medium text-[#faf9f5]">
        {hydrated ? initials : " "}
      </span>
      {collapsed ? null : (
        <span className="min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--ink)]">
          {hydrated ? displayName : <Skeleton className="h-3.5 w-28" />}
        </span>
      )}
    </button>
  );

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>{trigger}</PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        sideOffset={8}
        collisionPadding={8}
        className="w-[252px] bg-white"
        onOpenAutoFocus={(event) => event.preventDefault()}
      >
        <div className="flex items-center gap-2.5 px-2.5 py-2">
          <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ok)] text-[12px] font-medium text-[#faf9f5]">
            {initials}
          </span>
          <span className="min-w-0 truncate text-[13px] font-medium">
            {displayName}
          </span>
        </div>
        <div className="my-1 h-px bg-[var(--line)]" />
        {missingKeys ? (
          <Link
            href="/settings"
            className={cn(itemClass, "text-[var(--accent)]")}
            onClick={() => setOpen(false)}
          >
            <KeyRound size={15} />
            Add API keys
          </Link>
        ) : null}
        <Link href="/settings" className={itemClass} onClick={() => setOpen(false)}>
          <Settings size={15} />
          Settings
        </Link>
        <button
          type="button"
          className={itemClass}
          onClick={() => {
            setOpen(false);
            void signOut();
          }}
        >
          <LogOut size={15} />
          Log out
        </button>
      </PopoverContent>
    </Popover>
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
  const [email, setEmail] = useState<string | null>(null);

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
      setEmail(user.email ?? null);
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
      <div className="flex h-svh overflow-hidden">
        <motion.aside
          initial={false}
          animate={{ width: collapsed ? 64 : 248 }}
          transition={
            limited ? { duration: 0 } : { duration: 0.2, ease: [0.32, 0.72, 0, 1] }
          }
          className="flex h-full min-h-0 shrink-0 flex-col overflow-x-clip border-r border-[var(--line)] bg-[var(--sidebar)]"
        >
          <div
            className={cn(
              "flex items-center pb-4 pt-5",
              collapsed ? "justify-center px-2" : "justify-between gap-2 px-3",
            )}
          >
            {collapsed ? null : (
              <Link href="/" className="flex min-w-0 items-center gap-2.5">
                <Mark className="h-8 w-8 shrink-0" />
                <span className="min-w-0 truncate text-[15px] font-medium leading-tight tracking-tight">
                  NLASmith
                </span>
              </Link>
            )}
            <Tooltip>
              <TooltipTrigger asChild>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon-xs"
                  className="shrink-0 text-[var(--muted)]"
                  aria-expanded={!collapsed}
                  aria-label={collapsed ? "Open sidebar" : "Close sidebar"}
                  onClick={toggleSidebar}
                >
                  <PanelLeft size={16} />
                </Button>
              </TooltipTrigger>
              <TooltipContent side="right">
                {collapsed ? "Open sidebar" : "Close sidebar"}
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
            <AccountMenu
              collapsed={collapsed}
              displayName={fullName ?? email ?? "Account"}
              missingKeys={missing}
              hydrated={hydrated}
            />
          </div>
        </motion.aside>
        <main className="min-h-0 min-w-0 flex-1 overflow-y-auto bg-[var(--bg)]">
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
