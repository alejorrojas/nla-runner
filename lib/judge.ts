import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { renderMustache } from "./mustache";
import type { Evaluator, ExperimentRow, JudgeVar } from "./types";

function probeText(row: ExperimentRow, label?: string): string {
  const list = label
    ? row.probes.filter((p) => p.label === label)
    : row.probes;
  return list
    .map(
      (p) =>
        `[${p.label} tok=${JSON.stringify(p.token)} mse=${p.mse ?? "n/a"}]\n${p.description}`,
    )
    .join("\n\n");
}

function valuesFor(
  mapping: Evaluator["mapping"],
  row: ExperimentRow,
  reference: string,
): Record<string, string> {
  const lastUser = probeText(row, "last_user");
  const firstAsst = probeText(row, "first_assistant");
  const bag: Record<JudgeVar, string> = {
    prompt: row.prompt,
    completion: row.completion,
    nla: probeText(row),
    nla_last_user: lastUser,
    nla_first_assistant: firstAsst,
    token: row.probes.map((p) => p.token).join(" | "),
    mse: row.probes.map((p) => String(p.mse ?? "")).join(" | "),
    reference,
  };
  const out: Record<string, string> = {};
  for (const [placeholder, src] of Object.entries(mapping)) {
    if (!src) continue;
    out[placeholder] = bag[src];
  }
  return out;
}

function schemaFor(evaluator: Evaluator) {
  const shape: Record<string, z.ZodType> = {
    reason: z.string().describe("Short justification"),
  };
  for (const field of evaluator.feedback) {
    if (field.kind === "boolean") {
      shape[field.key] = z.boolean().describe(field.description);
    } else if (field.kind === "continuous") {
      shape[field.key] = z
        .number()
        .min(field.min ?? 0)
        .max(field.max ?? 1)
        .describe(field.description);
    } else {
      const cats = field.categories?.length
        ? field.categories
        : ["yes", "no"];
      shape[field.key] = z.enum(cats as [string, ...string[]]).describe(
        field.description,
      );
    }
  }
  return z.object(shape);
}

function toScore(value: unknown): number | boolean | string {
  if (typeof value === "boolean" || typeof value === "number") return value;
  if (typeof value === "string") return value;
  return String(value);
}

export async function runJudge(opts: {
  apiKey: string;
  evaluator: Evaluator;
  row: ExperimentRow;
  reference?: string;
}): Promise<{ scores: ExperimentRow["scores"]; comments: ExperimentRow["comments"] }> {
  const openai = createOpenAI({ apiKey: opts.apiKey });
  const filled = renderMustache(
    opts.evaluator.prompt,
    valuesFor(opts.evaluator.mapping, opts.row, opts.reference ?? ""),
  );
  const schema = schemaFor(opts.evaluator);
  const result = await generateText({
    model: openai(opts.evaluator.openaiModel),
    output: Output.object({ schema }),
    prompt: filled,
  });
  const obj = (result.output ?? {}) as Record<string, unknown>;
  const scores: ExperimentRow["scores"] = {};
  const comments: ExperimentRow["comments"] = {
    reason: String(obj.reason ?? ""),
  };
  for (const field of opts.evaluator.feedback) {
    scores[field.key] = toScore(obj[field.key]);
  }
  return { scores, comments };
}
