import { nextRunNumber } from "@/lib/run-numbers";
import { nlaRunBudget } from "@/lib/neuronpedia-limits";
import { NLA_SOURCES } from "@/lib/types";
import { runJudge } from "@/lib/judge";
import { runNlaExample } from "@/lib/neuronpedia";
import { patchUserStore, readUserStore } from "@/lib/store";
import { requireUser } from "@/lib/supabase/server";
import { readUserKeys } from "@/lib/user-keys";
import type { Experiment, ExperimentRow, TokenPolicy } from "@/lib/types";

export const maxDuration = 300;

async function persistExperiment(userId: string, experiment: Experiment): Promise<void> {
  await patchUserStore(userId, (s) => ({
    ...s,
    experiments: s.experiments.some((e) => e.id === experiment.id)
      ? s.experiments.map((e) => (e.id === experiment.id ? experiment : e))
      : [experiment, ...s.experiments],
  }));
}

export async function POST(req: Request) {
  const user = await requireUser();
  if (!user) {
    return Response.json({ error: "Unauthorized" }, { status: 401 });
  }
  const stored = await readUserKeys(user.id);
  const neuronpedia = stored?.neuronpedia ?? "";
  const openai = stored?.openai ?? "";
  const body = (await req.json()) as {
    datasetId: string;
    sourceId: string;
    tokenPolicy: TokenPolicy;
    evaluatorIds: string[];
    repetitions?: number;
    name?: string;
  };

  if (!neuronpedia) {
    return Response.json({ error: "Missing Neuronpedia API key" }, { status: 400 });
  }
  if (!openai) {
    return Response.json({ error: "Missing OpenAI API key" }, { status: 400 });
  }

  const store = await readUserStore(user.id);
  const dataset = store.datasets.find((d) => d.id === body.datasetId);
  const source = NLA_SOURCES.find((s) => s.id === body.sourceId);
  if (!dataset || !source) {
    return Response.json({ error: "Unknown dataset or NLA source" }, { status: 400 });
  }
  const evaluators = store.evaluators.filter((e) =>
    body.evaluatorIds.includes(e.id),
  );
  if (evaluators.length === 0) {
    return Response.json({ error: "Pick at least one evaluator" }, { status: 400 });
  }
  const repetitions = Math.max(1, Math.floor(body.repetitions ?? 1));
  const budget = nlaRunBudget({
    promptCount: dataset.examples.length,
    repetitions,
    tokenPolicy: body.tokenPolicy,
  });
  if (budget.overLimit) {
    return Response.json(
      {
        error:
          "This run exceeds Neuronpedia's hourly NLA limits. Use fewer prompts or lower repetitions.",
        completions: budget.completions,
        explanations: budget.explanations,
      },
      { status: 400 },
    );
  }

  const experiment: Experiment = {
    id: crypto.randomUUID(),
    name:
      body.name?.trim() ||
      `${source.label} · ${body.tokenPolicy} · ${new Date().toISOString().slice(11, 19)}`,
    datasetId: dataset.id,
    sourceId: source.id,
    tokenPolicy: body.tokenPolicy,
    evaluatorIds: evaluators.map((e) => e.id),
    rows: [],
    status: "running",
    createdAt: new Date().toISOString(),
    runNumber: nextRunNumber(store.experiments, dataset.id),
    repetitions,
  };
  await persistExperiment(user.id, experiment);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      const examples = dataset.examples;
      const total = examples.length * repetitions;
      send({ type: "start", experiment, total });
      try {
        let step = 0;
        for (let i = 0; i < examples.length; i++) {
          const example = examples[i];
          for (let rep = 1; rep <= repetitions; rep++) {
            send({
              type: "progress",
              index: step,
              total,
              prompt: example.prompt,
              phase: "nla",
            });
            let row: ExperimentRow = {
              exampleId: example.id,
              prompt: example.prompt,
              completion: "",
              probes: [],
              scores: {},
              comments: {},
              repetition: rep,
            };
            try {
              const nla = await runNlaExample({
                apiKey: neuronpedia,
                modelId: source.modelId,
                nlaSourceId: source.nlaSourceId,
                prompt: example.prompt,
                tokenPolicy: body.tokenPolicy,
              });
              row = { ...row, ...nla, repetition: rep };
              send({
                type: "progress",
                index: step,
                total,
                prompt: example.prompt,
                phase: "judge",
              });
              for (const ev of evaluators) {
                const judged = await runJudge({
                  apiKey: openai,
                  evaluator: ev,
                  row,
                  reference: example.reference,
                });
                row.scores = { ...row.scores, ...judged.scores };
                row.comments = { ...row.comments, ...judged.comments };
              }
            } catch (err) {
              row.error = err instanceof Error ? err.message : String(err);
            }
            experiment.rows.push(row);
            await persistExperiment(user.id, experiment);
            send({ type: "row", row, index: step, total, experiment });
            step += 1;
          }
        }
        experiment.status = "done";
      } catch (err) {
        experiment.status = "error";
        experiment.error = err instanceof Error ? err.message : String(err);
      }
      await persistExperiment(user.id, experiment);
      send({ type: "done", experiment });
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "application/x-ndjson",
      "Cache-Control": "no-cache",
    },
  });
}
