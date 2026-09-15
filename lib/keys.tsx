"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { usePathname } from "next/navigation";
import { createBrowserSupabase } from "@/lib/supabase/browser";
import {
  clearOpenAIJudgeModelsCache,
  prefetchOpenAIJudgeModels,
} from "@/lib/openai-models-client";

export const KEY_HINT_LENGTH = 8;

export type KeyHints = {
  openaiHint: string | null;
  neuronpediaHint: string | null;
};

export function maskStoredKey(hint: string): string {
  return `${hint}${"•".repeat(20)}`;
}

const EMPTY: KeyHints = { openaiHint: null, neuronpediaHint: null };

/** Pre-Vault plaintext keys. Vault is the only store now. */
const LEGACY_BROWSER_KEY_STORES = ["nla-eval-keys"];

function purgeLegacyBrowserKeyStores() {
  if (typeof window === "undefined") return;
  for (const key of LEGACY_BROWSER_KEY_STORES) {
    try {
      window.sessionStorage.removeItem(key);
      window.localStorage.removeItem(key);
    } catch {
      /* private mode / blocked storage */
    }
  }
}

const Ctx = createContext<{
  hints: KeyHints;
  hydrated: boolean;
  saveKeys: (patch: { openai?: string; neuronpedia?: string }) => Promise<void>;
} | null>(null);

export function KeysProvider({ children }: { children: React.ReactNode }) {
  const [hints, setHints] = useState<KeyHints>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    purgeLegacyBrowserKeyStores();
  }, []);

  const reload = useCallback(async () => {
    const load = async () => {
      const res = await fetch("/api/keys", { cache: "no-store" });
      if (!res.ok) return false;
      const data = (await res.json()) as KeyHints;
      setHints({
        openaiHint: data.openaiHint || null,
        neuronpediaHint: data.neuronpediaHint || null,
      });
      return true;
    };
    if (await load()) return;
    await new Promise((resolve) => setTimeout(resolve, 200));
    await load();
  }, []);

  useEffect(() => {
    if (!hydrated || !hints.openaiHint) return;
    prefetchOpenAIJudgeModels(hints.openaiHint);
  }, [hydrated, hints.openaiHint]);

  const pathname = usePathname();

  useEffect(() => {
    if (pathname === "/" || pathname === "/login") {
      setHydrated(true);
      return;
    }
    void reload().finally(() => setHydrated(true));
  }, [pathname, reload]);

  useEffect(() => {
    const supabase = createBrowserSupabase();
    const { data } = supabase.auth.onAuthStateChange((event) => {
      if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        void reload().finally(() => setHydrated(true));
      }
      if (event === "SIGNED_OUT") {
        clearOpenAIJudgeModelsCache();
        setHints(EMPTY);
      }
    });
    return () => data.subscription.unsubscribe();
  }, [reload]);

  const saveKeys = useCallback(
    async (patch: { openai?: string; neuronpedia?: string }) => {
      const res = await fetch("/api/keys", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(patch),
      });
      const data = (await res.json()) as KeyHints & { error?: string };
      if (!res.ok) throw new Error(data.error || "Could not save keys");
      if (patch.openai !== undefined) clearOpenAIJudgeModelsCache();
      setHints({
        openaiHint: data.openaiHint || null,
        neuronpediaHint: data.neuronpediaHint || null,
      });
    },
    [],
  );

  const value = useMemo(
    () => ({ hints, hydrated, saveKeys }),
    [hints, hydrated, saveKeys],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useKeys() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("KeysProvider missing");
  return ctx;
}
