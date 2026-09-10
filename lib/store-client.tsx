"use client";

import type { Store } from "./types";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
} from "react";

const Ctx = createContext<{
  store: Store | null;
  reload: () => Promise<void>;
  save: (next: Store) => Promise<void>;
} | null>(null);

export function StoreProvider({ children }: { children: React.ReactNode }) {
  const [store, setStore] = useState<Store | null>(null);

  const reload = useCallback(async () => {
    const res = await fetch("/api/store");
    setStore((await res.json()) as Store);
  }, []);

  useEffect(() => {
    void reload();
  }, [reload]);

  const save = useCallback(async (next: Store) => {
    const res = await fetch("/api/store", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(next),
    });
    setStore((await res.json()) as Store);
  }, []);

  return (
    <Ctx.Provider value={{ store, reload, save }}>{children}</Ctx.Provider>
  );
}

export function useStore() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("StoreProvider missing");
  return ctx;
}
