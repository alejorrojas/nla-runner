"use client";

import type { Experiment, Store } from "./types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";

const Ctx = createContext<{
  store: Store | null;
  reload: () => Promise<void>;
  save: (next: Store) => Promise<void>;
  upsertExperiment: (experiment: Experiment) => void;
} | null>(null);

const EMPTY: Store = { datasets: [], evaluators: [], experiments: [] };

function isAppPath(pathname: string) {
  return pathname !== "/" && pathname !== "/login" && pathname !== "/contact";
}

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [store, setStore] = useState<Store | null>(null);

  const reload = useCallback(async () => {
    const load = async () => {
      const res = await fetch("/api/store", { cache: "no-store" });
      if (!res.ok) return false;
      setStore((await res.json()) as Store);
      return true;
    };
    if (await load()) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
    if (await load()) return;
  }, []);

  useEffect(() => {
    if (!isAppPath(pathname)) return;
    void reload();
  }, [pathname, reload]);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void reload();
      }
      if (event === "SIGNED_OUT") {
        setStore(EMPTY);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [reload]);

  const save = useCallback(async (next: Store) => {
    const res = await fetch("/api/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setStore((await res.json()) as Store);
  }, []);

  const upsertExperiment = useCallback((experiment: Experiment) => {
    setStore((prev) => {
      if (!prev) return prev;
      const others = prev.experiments.filter((e) => e.id !== experiment.id);
      return { ...prev, experiments: [experiment, ...others] };
    });
  }, []);

  return (
    <Ctx.Provider value={{ store, reload, save, upsertExperiment }}>{children}</Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}
