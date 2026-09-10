"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type Keys = { openai: string; neuronpedia: string };

const Ctx = createContext<{
  keys: Keys;
  setKeys: (k: Keys) => void;
  headers: Record<string, string>;
} | null>(null);

const STORAGE = "nla-eval-keys";

export function KeysProvider({ children }: { children: React.ReactNode }) {
  const [keys, setKeysState] = useState<Keys>({ openai: "", neuronpedia: "" });

  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(STORAGE);
      if (raw) setKeysState(JSON.parse(raw) as Keys);
    } catch {
      /* ignore */
    }
  }, []);

  const setKeys = useCallback((k: Keys) => {
    setKeysState(k);
    sessionStorage.setItem(STORAGE, JSON.stringify(k));
  }, []);

  const headers = useMemo(
    () => ({
      "x-openai-key": keys.openai,
      "x-neuronpedia-key": keys.neuronpedia,
    }),
    [keys],
  );

  return (
    <Ctx.Provider value={{ keys, setKeys, headers }}>{children}</Ctx.Provider>
  );
}

export function useKeys() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("KeysProvider missing");
  return ctx;
}
