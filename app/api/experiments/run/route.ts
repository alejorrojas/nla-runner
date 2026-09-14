import { NLA_SOURCES } from "@/lib/types";
import { runJudge } from "@/lib/judge";
import { runNlaExample } from "@/lib/neuronpedia";
import { patchUserStore, readUserStore } from "@/lib/store";
import { requireUser } from "@/lib/supabase/server";
import type { Experiment, ExperimentRow, TokenPolicy } from "@/lib/types";

export const maxDuration = 300;

function headerKey(req: Request, name: string): string {
  return req.headers.get(name)?.trim() || "";
}

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
  const neuronpedia = headerKey(req, "x-neuronpedia-key");
  const openai = headerKey(req, "x-openai-key");
  const body = (await req.json()) as {
    datasetId: string;
    sourceId: string;
    tokenPolicy: TokenPolicy;
    evaluatorIds: string[];
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
  };
  await persistExperiment(user.id, experiment);

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (event: unknown) => {
        controller.enqueue(encoder.encode(`${JSON.stringify(event)}\n`));
      };
      const total = dataset.examples.length;
      send({ type: "start", experiment, total });
      try {
        for (let i = 0; i < dataset.examples.length; i++) {
          const example = dataset.examples[i];
          send({
            type: "progress",
            index: i,
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
          };
          try {
            const nla = await runNlaExample({
              apiKey: neuronpedia,
              modelId: source.modelId,
              nlaSourceId: source.nlaSourceId,
              prompt: example.prompt,
              tokenPolicy: body.tokenPolicy,
            });
            row = { ...row, ...nla };
            send({
              type: "progress",
              index: i,
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
          send({ type: "row", row, index: i, total, experiment });
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
