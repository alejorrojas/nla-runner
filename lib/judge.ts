import { createOpenAI } from "@ai-sdk/openai";
import { generateText, Output } from "ai";
import { z } from "zod";
import { renderMustache } from "./mustache";
import type { Evaluator, ExperimentRow, FeedbackField, JudgeVar } from "./types";

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

function categoryNames(field: FeedbackField): string[] {
  const names = (field.categories ?? [])
    .map((c) => c.name.trim())
    .filter(Boolean);
  return names.length ? names : ["yes", "no"];
}

function schemaFor(evaluator: Evaluator) {
  const shape: Record<string, z.ZodType> = {};
  if (evaluator.feedback.some((f) => f.includeReasoning !== false)) {
    shape.reason = z.string().describe("Short justification");
  }
  for (const field of evaluator.feedback) {
    switch (field.kind) {
      case "boolean":
        shape[field.key] = z
          .boolean()
          .describe(
            field.description ||
              "true (1) or false (0) based on the feedback criteria",
          );
        break;
      case "continuous": {
        const min = field.min ?? 1;
        const max = field.max ?? 10;
        const bits = [field.description];
        if (field.minDescription) bits.push(`min ${min}: ${field.minDescription}`);
        if (field.maxDescription) bits.push(`max ${max}: ${field.maxDescription}`);
        shape[field.key] = z
          .number()
          .min(min)
          .max(max)
          .describe(bits.filter(Boolean).join(" "));
        break;
      }
      case "categorical": {
        const cats = categoryNames(field);
        const labeled = (field.categories ?? [])
          .filter((c) => c.name.trim())
          .map((c) =>
            c.description ? `${c.name}: ${c.description}` : c.name,
          )
          .join("; ");
        shape[field.key] = z
          .enum(cats as [string, ...string[]])
          .describe(field.description || labeled);
        break;
      }
      default: {
        const _never: never = field.kind;
        throw new Error(`Unhandled feedback kind: ${_never}`);
      }
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
