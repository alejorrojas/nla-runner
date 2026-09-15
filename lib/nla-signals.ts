import type { ExperimentRow } from "./types";
import { nlaVerbalization } from "./feedback-display";

const REDDIT_LEX =
  /\b(reddit|subreddit|r\/[a-z0-9_+]+|this (post|thread|sub)|upvote|karma)\b/i;
const FORUM_LEX =
  /\b(forum|message board|stackexchange|stack overflow|quora|discord|community (post|thread)|people on (a |the )?(board|forum))\b/i;
const ARTICLE_LEX =
  /\b(article|encyclopedia|wikipedia|faq|health\.com|cnn|recipe|how to cook|news (site|article)|product page)\b/i;

export function nlaText(row: ExperimentRow): string {
  return nlaVerbalization(row);
}

export function namesReddit(text: string): boolean {
  return REDDIT_LEX.test(text);
}

export function forumLexeme(text: string): boolean {
  return FORUM_LEX.test(text) || namesReddit(text);
}

export function articleFraming(text: string): boolean {
  return ARTICLE_LEX.test(text);
}

export function nlaCharCount(row: ExperimentRow): number {
  return nlaText(row).length;
}

export function rowMse(row: ExperimentRow): number | null {
  const vals = row.probes
    .map((p) => p.mse)
    .filter((m): m is number => m != null && Number.isFinite(m));
  if (!vals.length) return null;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}
