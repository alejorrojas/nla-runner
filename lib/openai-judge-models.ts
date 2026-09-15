/** Chat models that are useful as LLM-as-judge in this app. */

const DENY = [
  "codex",
  "audio",
  "realtime",
  "transcribe",
  "whisper",
  "sora",
  "tts",
  "video",
  "image",
  "dall-e",
  "dalle",
  "chatgpt",
  "embedding",
  "moderation",
  "search",
  "computer-use",
  "instruct",
  "davinci",
  "babbage",
  "curie",
  "ada",
  "gpt-3",
  "gpt-4-turbo",
  "ft:",
];

/** Newest-first families we keep. Older GPT-4 / 3.5 stay out. */
const FAMILIES = [
  "gpt-5-nano",
  "gpt-5-mini",
  "gpt-5",
  "gpt-4.1-nano",
  "gpt-4.1-mini",
  "gpt-4.1",
  "gpt-4o-mini",
  "gpt-4o",
  "o4-mini",
  "o3-mini",
  "o3",
];

function familyIndex(id: string): number {
  const n = id.toLowerCase();
  const i = FAMILIES.findIndex(
    (family) => n === family || n.startsWith(`${family}-`) || n.startsWith(`${family}.`),
  );
  return i === -1 ? FAMILIES.length : i;
}

/** gpt-5, gpt-5-mini, gpt-5.4, gpt-5.4-mini, gpt-5.1-chat-latest, … */
function isGpt5Family(id: string): boolean {
  return /^gpt-5([.-]|$)/.test(id);
}

/** gpt-5 → 0, gpt-5.4 → 4, gpt-5.6-sol → 6 */
function gpt5Minor(id: string): number {
  const match = id.match(/^gpt-5(?:\.(\d+))?/);
  return match?.[1] ? Number(match[1]) : 0;
}

export function isJudgeChatModel(id: string): boolean {
  const n = id.trim().toLowerCase();
  if (!n) return false;
  if (/\d{4}-\d{2}-\d{2}/.test(n)) return false;
  if (n === "gpt-4" || (n.startsWith("gpt-4-") && !n.startsWith("gpt-4o") && !n.startsWith("gpt-4.1"))) {
    return false;
  }
  if (DENY.some((token) => n.includes(token))) return false;
  if (isGpt5Family(n)) return true;
  return familyIndex(n) < FAMILIES.length;
}

export function sortJudgeChatModels(ids: string[]): string[] {
  return [...ids].sort((a, b) => {
    const a5 = isGpt5Family(a);
    const b5 = isGpt5Family(b);
    if (a5 !== b5) return a5 ? -1 : 1;
    if (a5 && b5) {
      const minor = gpt5Minor(b) - gpt5Minor(a);
      if (minor !== 0) return minor;
    }
    const fa = familyIndex(a);
    const fb = familyIndex(b);
    if (fa !== fb) return fa - fb;
    return a.localeCompare(b);
  });
}

export function filterJudgeChatModels(ids: string[]): string[] {
  return sortJudgeChatModels([...new Set(ids.filter(isJudgeChatModel))]);
}
