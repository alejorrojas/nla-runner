import type { Experiment } from "./types";

export function defaultCompareIds(experiments: Experiment[]): string[] {
  return [...experiments]
    .sort((a, b) => {
      const rank = (e: Experiment) =>
        e.tokenPolicy === "last_user"
          ? 0
          : e.tokenPolicy === "first_assistant"
            ? 1
            : 2;
      const r = rank(a) - rank(b);
      return r !== 0 ? r : Date.parse(a.createdAt) - Date.parse(b.createdAt);
    })
    .slice(0, 2)
    .map((e) => e.id);
}
