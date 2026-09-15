import { pickProbes, type TokenRow } from "./tokens";
import type { NlaProbe, TokenPolicy } from "./types";

const BASE = "https://www.neuronpedia.org";

type CompletionBody = {
  full_text?: string;
  text?: string;
  completion?: string;
  tokens?: TokenRow[];
};

type ExplainRow = {
  position: number;
  token?: string;
  mse?: number;
  description?: string;
};

export async function nlaComplete(opts: {
  apiKey: string;
  modelId: string;
  nlaSourceId: string;
  prompt: string;
}): Promise<CompletionBody> {
  const res = await fetch(`${BASE}/api/nla/completion`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": opts.apiKey,
    },
    body: JSON.stringify({
      modelId: opts.modelId,
      nlaSourceId: opts.nlaSourceId,
      messages: [{ role: "user", content: opts.prompt }],
      completion_tokens: 128,
      temperature: 0.4,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Neuronpedia completion ${res.status}: ${text.slice(0, 800)}`);
  }
  return JSON.parse(text) as CompletionBody;
}

export async function nlaExplain(opts: {
  apiKey: string;
  modelId: string;
  nlaSourceId: string;
  fullText: string;
  positions: number[];
}): Promise<ExplainRow[]> {
  if (opts.positions.length === 0) return [];
  const res = await fetch(`${BASE}/api/nla/explain`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Accept: "application/json",
      "x-api-key": opts.apiKey,
    },
    body: JSON.stringify({
      modelId: opts.modelId,
      nlaSourceId: opts.nlaSourceId,
      text: opts.fullText,
      positions: opts.positions,
      temperature: 0.7,
    }),
  });
  const text = await res.text();
  if (!res.ok) {
    throw new Error(`Neuronpedia explain ${res.status}: ${text.slice(0, 800)}`);
  }
  const json = JSON.parse(text) as { results?: ExplainRow[] };
  return json.results ?? [];
}

function assistantTextFromTokens(tokens: TokenRow[]): string {
  let lastHeader = -1;
  tokens.forEach((t, i) => {
    const tok = t.token || "";
    if (tok === "assistant" || tok === "model") lastHeader = i;
  });
  if (lastHeader < 0) return "";
  return tokens
    .slice(lastHeader + 1)
    .map((t) => t.token || "")
    .join("");
}

function modelOutput(body: CompletionBody, prompt: string): string {
  const direct = body.completion?.trim();
  if (direct) return body.completion!.trimEnd();
  const fromTokens = assistantTextFromTokens(body.tokens ?? []).trim();
  if (fromTokens) return fromTokens;
  const full = (body.full_text || body.text || "").trim();
  if (!full) return "";
  const prefix = prompt.trim();
  if (prefix && full.startsWith(prefix)) return full.slice(prefix.length).trim();
  return full;
}

export async function runNlaExample(opts: {
  apiKey: string;
  modelId: string;
  nlaSourceId: string;
  prompt: string;
  tokenPolicy: TokenPolicy;
}): Promise<{ completion: string; probes: NlaProbe[] }> {
  const body = await nlaComplete(opts);
  const tokens = body.tokens ?? [];
  const fullText = body.full_text || body.text || "";
  const completion = modelOutput(body, opts.prompt);
  const probes = pickProbes(tokens, opts.tokenPolicy);
  const explained = await nlaExplain({
    ...opts,
    fullText,
    positions: probes.map((p) => p.token.position),
  });
  const byPos = new Map(explained.map((r) => [r.position, r]));
  return {
    completion,
    probes: probes.map((p) => {
      const row = byPos.get(p.token.position);
      return {
        label: p.label,
        position: p.token.position,
        token: row?.token || p.token.token || "",
        mse: row?.mse ?? null,
        description: row?.description || "",
      };
    }),
  };
}
