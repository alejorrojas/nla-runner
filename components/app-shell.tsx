"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
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
      className={`flex items-center justify-between rounded-md px-2.5 py-[6px] text-[13px] ${
        active
          ? "bg-[var(--active)] font-medium text-[#1a4db3]"
          : "text-[#3d4450] hover:bg-[var(--hover)]"
      }`}
    >
      <span>{label}</span>
      {count != null ? (
        <span className={`text-[12px] ${active ? "text-[#1a4db3]" : "text-[var(--muted)]"}`}>
          {count}
        </span>
      ) : null}
    </Link>
  );
}

function ShellInner({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const { keys } = useKeys();
  const { store } = useStore();
  const missing = !keys.openai || !keys.neuronpedia;

  return (
    <div className="flex min-h-full">
      <aside className="flex w-[220px] shrink-0 flex-col border-r border-[var(--line)] bg-[var(--sidebar)]">
        <div className="px-4 pb-3 pt-4">
          <Link href="/" className="text-[16px] font-semibold tracking-tight">
            NLA Eval
          </Link>
          <div className="mt-0.5 text-[11px] text-[var(--muted)]">
            Personal
          </div>
        </div>
        <div className="px-3 pb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
          Application
        </div>
        <nav className="flex flex-col gap-[1px] px-2">
          <NavLink href="/" label="Home" active={path === "/"} />
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
        <div className="mt-5 px-3 pb-2 text-[11px] font-medium uppercase tracking-wide text-[var(--muted)]">
          Workspace
        </div>
        <nav className="flex flex-col gap-[1px] px-2">
          <NavLink
            href="/settings"
            label="Settings"
            active={path.startsWith("/settings")}
          />
        </nav>
        <div className="mt-auto border-t border-[var(--line)] px-3 py-3 text-[11px] leading-snug text-[var(--muted)]">
          {missing ? (
            <Link href="/settings" className="text-[var(--warn)] hover:underline">
              Add OpenAI + Neuronpedia keys
            </Link>
          ) : (
            "Keys in this session"
          )}
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-auto bg-[var(--bg)]">{children}</main>
    </div>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <KeysProvider>
      <StoreProvider>
        <ShellInner>{children}</ShellInner>
      </StoreProvider>
    </KeysProvider>
  );
}
