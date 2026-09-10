export type TokenRow = {
  token?: string;
  position: number;
};

const SPECIAL = new Set([
  "assistant",
  "user",
  "system",
  "model",
  "bos",
  "start_of_turn",
  "end_of_turn",
]);

function isSpecial(tok: string): boolean {
  if (tok.startsWith("<|") || tok.startsWith("<")) return true;
  return SPECIAL.has(tok);
}

function userSpan(tokens: TokenRow[]): TokenRow[] {
  const start = tokens.findIndex((t) => (t.token || "") === "user");
  if (start < 0) return tokens;
  const out: TokenRow[] = [];
  for (const t of tokens.slice(start + 1)) {
    const tok = t.token || "";
    if (tok === "assistant" || tok === "model") break;
    out.push(t);
  }
  return out;
}

export function lastUserContent(tokens: TokenRow[]): TokenRow | null {
  const content = userSpan(tokens).filter((t) => {
    const tok = t.token || "";
    return !isSpecial(tok) && tok.trim().length > 0;
  });
  return content.at(-1) ?? null;
}

export function firstAssistantContent(tokens: TokenRow[]): TokenRow | null {
  let lastHeader = -1;
  tokens.forEach((t, i) => {
    const tok = t.token || "";
    if (tok === "assistant" || tok === "model") lastHeader = i;
  });
  if (lastHeader < 0) return null;
  for (const t of tokens.slice(lastHeader + 1)) {
    const tok = t.token || "";
    if (isSpecial(tok) || !tok.trim()) continue;
    return t;
  }
  return null;
}

export function pickProbes(
  tokens: TokenRow[],
  policy: "last_user" | "first_assistant" | "both",
): { label: string; token: TokenRow }[] {
  const picked: { label: string; token: TokenRow }[] = [];
  const add = (label: string, t: TokenRow | null) => {
    if (!t) return;
    if (picked.some((p) => p.token.position === t.position)) return;
    picked.push({ label, token: t });
  };
  if (policy === "last_user" || policy === "both") {
    add("last_user", lastUserContent(tokens));
  }
  if (policy === "first_assistant" || policy === "both") {
    add("first_assistant", firstAssistantContent(tokens));
  }
  return picked.slice(0, 16);
}
