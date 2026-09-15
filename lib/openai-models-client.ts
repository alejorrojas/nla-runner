"use client";

const MODELS_URL = "/api/openai/models?v=3";

type Cache = {
  hint: string;
  models: string[];
};

let cache: Cache | null = null;
let inflight: Promise<string[] | null> | null = null;

export function clearOpenAIJudgeModelsCache() {
  cache = null;
  inflight = null;
}

export function peekOpenAIJudgeModels(hint: string | null): string[] | null {
  if (!hint || cache?.hint !== hint) return null;
  return cache.models;
}

export async function loadOpenAIJudgeModels(
  hint: string | null,
): Promise<string[] | null> {
  if (!hint) return null;
  if (cache?.hint === hint) return cache.models;
  if (inflight) return inflight;

  inflight = (async () => {
    try {
      const res = await fetch(MODELS_URL);
      const body = (await res.json()) as { models?: string[]; error?: string };
      if (!res.ok) return null;
      const models = body.models ?? [];
      cache = { hint, models };
      return models;
    } catch {
      return null;
    }
  })().finally(() => {
    inflight = null;
  });

  return inflight;
}

export function prefetchOpenAIJudgeModels(hint: string | null) {
  void loadOpenAIJudgeModels(hint);
}
