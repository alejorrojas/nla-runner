"use client";

import { useEffect, useState, type ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MotionConfig } from "framer-motion";
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
import { PageFade, useLimitedMotion } from "@/components/motion";
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

const SIDEBAR_EXPANDED = 248;

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
  const link = (
    <Link
      href={href}
      className={cn(
        "relative flex items-center gap-2 whitespace-nowrap rounded-lg px-2.5 py-[7px] text-[13px]",
        active
          ? "font-medium text-[var(--ink)]"
          : "text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--ink)]",
      )}
    >
      {active ? (
        <span className="absolute inset-0 rounded-lg bg-[color-mix(in_srgb,var(--clay)_16%,transparent)]" />
      ) : null}
      <span className="relative z-10 shrink-0">{icon}</span>
      <span
        className={cn(
          "relative z-10 min-w-0 flex-1 truncate",
          collapsed && "opacity-0",
        )}
      >
        {label}
      </span>
      {countPending ? (
        <Skeleton className={cn("relative z-10 h-3 w-4", collapsed && "opacity-0")} />
      ) : count != null ? (
        <span
          className={cn(
            "relative z-10 font-mono text-[13px] text-[var(--muted)]",
            collapsed && "opacity-0",
          )}
        >
          {count}
        </span>
      ) : null}
    </Link>
  );
  return (
    <Tooltip delayDuration={collapsed ? 200 : 1_000_000}>
      <TooltipTrigger asChild>{link}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  );
}

function CollapsedBrandToggle({ onOpen }: { onOpen: () => void }) {
  const [armed, setArmed] = useState(false);
  return (
    <div
      className="relative size-8"
      onMouseEnter={() => setArmed(true)}
      onMouseLeave={() => setArmed(false)}
    >
      <Mark
        className={cn(
          "pointer-events-none h-8 w-8 transition-opacity duration-150",
          armed ? "opacity-0" : "opacity-100",
        )}
      />
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className={cn(
          "absolute inset-0 size-8 text-[var(--muted)] transition-opacity duration-150",
          armed ? "opacity-100" : "opacity-0",
        )}
        aria-expanded={false}
        aria-label="Open sidebar"
        onFocus={() => setArmed(true)}
        onBlur={() => setArmed(false)}
        onClick={onOpen}
      >
        <PanelLeft />
      </Button>
    </div>
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

  const trigger = (
    <Button
      type="button"
      variant="nav"
      aria-label="Account menu"
    >
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[var(--ok)] text-[12px] font-medium text-[#faf9f5]">
        {hydrated ? initials : " "}
      </span>
      <span
        className={cn(
          "min-w-0 flex-1 truncate text-[13px] font-medium text-[var(--ink)] transition-opacity duration-150",
          collapsed && "opacity-0",
        )}
      >
        {hydrated ? displayName : <Skeleton className="h-3.5 w-28" />}
      </span>
    </Button>
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
          <Button asChild variant="nav" className="text-[var(--accent)]">
            <Link href="/settings" onClick={() => setOpen(false)}>
              <KeyRound />
              Add API keys
            </Link>
          </Button>
        ) : null}
        <Button asChild variant="nav">
          <Link href="/settings" onClick={() => setOpen(false)}>
            <Settings />
            Settings
          </Link>
        </Button>
        <Button
          type="button"
          variant="nav"
          onClick={() => {
            setOpen(false);
            void signOut();
          }}
        >
          <LogOut />
          Log out
        </Button>
      </PopoverContent>
    </Popover>
  );
}

function LandingBar() {
  return (
    <header className="relative z-30 mx-auto flex max-w-[1180px] items-center justify-between px-6 py-5 md:px-8">
      <Link href="/" className="flex items-center gap-2 text-white">
        <Mark className="h-8 w-8" />
        <span className="text-[15px] font-semibold tracking-tight">NLASmith</span>
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
        <Button asChild size="lg">
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
    window.localStorage.removeItem("nlasmith-sidebar-collapsed");
  }, []);

  useEffect(() => {
    if (path === "/" || path === "/login" || path === "/contact") return;
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
    setCollapsed((value) => !value);
  }

  if (path === "/login" || path === "/contact") {
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
        <aside
          className={cn(
            "flex h-full min-h-0 shrink-0 flex-col overflow-hidden border-r border-[var(--line)] bg-[var(--sidebar)]",
            collapsed ? "w-16" : "w-[248px]",
            !limited && "transition-[width] duration-200 ease-out",
          )}
        >
          <div
            className="flex h-full min-h-0 shrink-0 flex-col"
            style={{ width: SIDEBAR_EXPANDED }}
          >
            <div className="flex items-center gap-2 px-3 pb-4 pt-5">
              <div className="relative size-8 shrink-0">
                {collapsed ? (
                  <CollapsedBrandToggle onOpen={toggleSidebar} />
                ) : (
                  <Link href="/" className="block size-8" aria-label="NLASmith">
                    <Mark className="h-8 w-8" />
                  </Link>
                )}
              </div>
              <Link
                href="/"
                tabIndex={collapsed ? -1 : 0}
                className={cn(
                  "min-w-0 flex-1 truncate text-[15px] font-semibold leading-tight tracking-tight",
                  collapsed && "pointer-events-none opacity-0",
                )}
              >
                NLASmith
              </Link>
              <Button
                type="button"
                variant="ghost"
                size="icon"
                className={cn(
                  "shrink-0 text-[var(--muted)]",
                  collapsed && "pointer-events-none opacity-0",
                )}
                aria-expanded={!collapsed}
                aria-label="Close sidebar"
                tabIndex={collapsed ? -1 : 0}
                onClick={toggleSidebar}
              >
                <PanelLeft />
              </Button>
            </div>
            <div
              className={cn(
                "grid",
                collapsed ? "grid-rows-[0fr]" : "grid-rows-[1fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-3 pb-1 text-[13px] font-medium text-[var(--muted)]">
                  Application
                </div>
              </div>
            </div>
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
            <div
              className={cn(
                "grid",
                collapsed ? "mt-0 grid-rows-[0fr]" : "mt-6 grid-rows-[1fr]",
              )}
            >
              <div className="overflow-hidden">
                <div className="px-3 pb-1 text-[13px] font-medium text-[var(--muted)]">
                  Workspace
                </div>
              </div>
            </div>
            <nav className="flex flex-col gap-0.5 px-2">
              <NavLink
                href="/settings"
                label="Settings"
                icon={<Settings size={15} />}
                active={path.startsWith("/settings")}
                collapsed={collapsed}
              />
            </nav>
            <div className="mt-auto space-y-2 border-t border-[var(--line)] px-3 py-3">
              {running.length > 0 ? (
                collapsed ? (
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <div className="flex py-1">
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
          </div>
        </aside>
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
