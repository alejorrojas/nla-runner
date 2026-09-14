import { meanScores, numericScore } from "./feedback-display";
import {
  articleFraming,
  forumLexeme,
  namesReddit,
  nlaCharCount,
  nlaText,
  rowMse,
} from "./nla-signals";
import type { Experiment } from "./types";

function median(vals: number[]): number {
  if (!vals.length) return 0;
  const s = [...vals].sort((a, b) => a - b);
  const mid = Math.floor(s.length / 2);
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
}

export function experimentKpis(ex: Experiment) {
  const ok = ex.rows.filter((r) => !r.error);
  const mses = ok
    .map(rowMse)
    .filter((m): m is number => m != null);
  const chars = ok.map(nlaCharCount);
  const llm = meanScores(ex).mentions_reddit;
  const forumTrue = ok.filter(
    (r) => numericScore(r.scores.mentions_reddit) === 1,
  ).length;
  return {
    n: ex.rows.length,
    errors: ex.rows.length - ok.length,
    llmHit: llm ?? null,
    forumTrue,
    forumFalse: ok.length - forumTrue,
    meanMse: mses.length ? mses.reduce((a, b) => a + b, 0) / mses.length : null,
    medianMse: mses.length ? median(mses) : null,
    meanChars: chars.length
      ? chars.reduce((a, b) => a + b, 0) / chars.length
      : null,
    lexicalReddit: ok.length
      ? ok.filter((r) => namesReddit(nlaText(r))).length / ok.length
      : 0,
    lexicalForum: ok.length
      ? ok.filter((r) => forumLexeme(nlaText(r))).length / ok.length
      : 0,
    lexicalArticle: ok.length
      ? ok.filter((r) => articleFraming(nlaText(r))).length / ok.length
      : 0,
  };
}

export function aggregateSeries(experiments: Experiment[]) {
  return experiments.map((ex, i) => {
    const kpis = experimentKpis(ex);
    const scores = meanScores(ex);
    const row: Record<string, string | number | null> = {
      run: String.fromCharCode(65 + i),
      mse: kpis.meanMse,
      chars: kpis.meanChars,
      lexical_reddit: kpis.lexicalReddit,
      lexical_forum: kpis.lexicalForum,
      lexical_article: kpis.lexicalArticle,
    };
    for (const [k, v] of Object.entries(scores)) {
      row[k] = v;
    }
    return row;
  });
}
