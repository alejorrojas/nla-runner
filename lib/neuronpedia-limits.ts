import type { TokenPolicy } from "@/lib/types";

/** Neuronpedia middleware: sliding 60-minute windows (apps/webapp/middleware.ts). */
export const NLA_WINDOW = "60 minutes";
export const NLA_EXPLAIN_PER_WINDOW = 120;
export const NLA_COMPLETION_PER_WINDOW = 240;
export const NLA_MAX_POSITIONS_PER_EXPLAIN = 16;

export function nlaPositionsForPolicy(policy: TokenPolicy): number {
  return policy === "both" ? 2 : 1;
}

export function nlaExplainCallsPerPass(policy: TokenPolicy): number {
  return Math.max(
    1,
    Math.ceil(nlaPositionsForPolicy(policy) / NLA_MAX_POSITIONS_PER_EXPLAIN),
  );
}

export function nlaRunBudget(opts: {
  promptCount: number;
  repetitions: number;
  tokenPolicy: TokenPolicy;
}) {
  const prompts = Math.max(0, opts.promptCount);
  const repetitions = Math.max(1, Math.floor(opts.repetitions) || 1);
  const passes = prompts * repetitions;
  const explainPerPass = nlaExplainCallsPerPass(opts.tokenPolicy);
  const completions = passes;
  const explanations = passes * explainPerPass;
  const overCompletion = completions > NLA_COMPLETION_PER_WINDOW;
  const overExplain = explanations > NLA_EXPLAIN_PER_WINDOW;
  const maxPrompts = Math.floor(
    NLA_EXPLAIN_PER_WINDOW / (repetitions * explainPerPass),
  );
  return {
    prompts,
    repetitions,
    completions,
    explanations,
    explainPerPass,
    overCompletion,
    overExplain,
    overLimit: overCompletion || overExplain,
    maxPrompts,
  };
}

export function nlaBudgetCopy(budget: ReturnType<typeof nlaRunBudget>): string {
  const base = `Neuronpedia allows ${NLA_EXPLAIN_PER_WINDOW} explanation requests and ${NLA_COMPLETION_PER_WINDOW} completions per ${NLA_WINDOW}. Each prompt uses 1 completion and 1 explanation (up to ${NLA_MAX_POSITIONS_PER_EXPLAIN} token positions per explanation). This run would use ${budget.completions} completion${budget.completions === 1 ? "" : "s"} and ${budget.explanations} explanation${budget.explanations === 1 ? "" : "s"}.`;
  if (!budget.overLimit) {
    return `${base} Other runs in the same hour also count against that window.`;
  }
  const promptHint =
    budget.maxPrompts > 0
      ? ` Use at most ${budget.maxPrompts} prompt${budget.maxPrompts === 1 ? "" : "s"} at ${budget.repetitions} repetition${budget.repetitions === 1 ? "" : "s"}, or lower repetitions, on the Examples tab.`
      : " Lower repetitions until the run fits in the hourly explanation cap.";
  return `${base} This exceeds the cap, so the run cannot start.${promptHint}`;
}
