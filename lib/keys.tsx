"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

export const KEY_HINT_LENGTH = 8;

export type KeyHints = {
  openaiHint: string | null;
  neuronpediaHint: string | null;
};

export function maskStoredKey(hint: string): string {
  return `${hint}${"•".repeat(20)}`;
}

const EMPTY: KeyHints = { openaiHint: null, neuronpediaHint: null };

const Ctx = createContext<{
  hints: KeyHints;
  hydrated: boolean;
  saveKeys: (patch: { openai?: string; neuronpedia?: string }) => Promise<void>;
} | null>(null);

export function KeysProvider({ children }: { children: React.ReactNode }) {
  const [hints, setHints] = useState<KeyHints>(EMPTY);
  const [hydrated, setHydrated] = useState(false);

  const reload = useCallback(async () => {
    const res = await fetch("/api/keys");
    if (!res.ok) {
      setHints(EMPTY);
      return;
    }
    const data = (await res.json()) as KeyHints;
    setHints({
      openaiHint: data.openaiHint || null,
      neuronpediaHint: data.neuronpediaHint || null,
    });
  }, []);

  useEffect(() => {
    void reload().finally(() => setHydrated(true));
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
