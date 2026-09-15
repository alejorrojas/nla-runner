import {
  EXAMPLE_RUN_ASSISTANT_NAME,
  EXAMPLE_RUN_NAME,
} from "../lib/example-workspace";
import { writeFile } from "fs/promises";
import {
  CATALOG_DATASET_ID,
  CATALOG_EVALUATOR_ID,
  CATALOG_EXPERIMENT_ASSISTANT_ID,
  CATALOG_EXPERIMENT_ID,
} from "../lib/urls";
import { runJudge } from "../lib/judge";
import { runNlaExample } from "../lib/neuronpedia";
import { nextRunNumber } from "../lib/run-numbers";
import { emptyStore } from "../lib/seed";
import { createSecretClient } from "../lib/supabase";
import { readCatalogStore, writeCatalogStore } from "../lib/store";
import type { Experiment, ExperimentRow, TokenPolicy } from "../lib/types";

const POLICIES: Record<
  TokenPolicy,
  { id: string; name: string }
> = {
  last_user: { id: CATALOG_EXPERIMENT_ID, name: EXAMPLE_RUN_NAME },
  first_assistant: {
    id: CATALOG_EXPERIMENT_ASSISTANT_ID,
    name: EXAMPLE_RUN_ASSISTANT_NAME,
  },
  both: {
    id: "exp-forum-prior-llama-both",
    name: "Example run · Llama 3.3 70B · both",
  },
};

async function copyToStarterWorkspaces(experiment: Experiment) {
  const sb = createSecretClient();
  if (!sb) return;
  const starters = await sb
    .from("experiments")
    .select("id, dataset_id, evaluator_ids, owner_id")
    .eq("is_starter", true)
    .eq("is_catalog", false)
    .eq("token_policy", "last_user");
  if (starters.error) throw starters.error;
  for (const starter of starters.data ?? []) {
    if (!starter.owner_id) continue;
    const existing = await sb
      .from("experiments")
      .select("id")
      .eq("owner_id", starter.owner_id)
      .eq("token_policy", experiment.tokenPolicy)
      .eq("is_starter", true)
      .maybeSingle();
    if (existing.error) throw existing.error;
    const copyId = existing.data?.id ?? crypto.randomUUID();
    const upsert = await sb.from("experiments").upsert({
      id: copyId,
      dataset_id: starter.dataset_id,
      name: experiment.name,
      source_id: experiment.sourceId,
      token_policy: experiment.tokenPolicy,
      evaluator_ids: starter.evaluator_ids,
      status: experiment.status,
      error: experiment.error ?? null,
      created_at: experiment.createdAt,
      run_number: experiment.runNumber,
      repetitions: experiment.repetitions ?? 1,
      owner_id: starter.owner_id,
      is_catalog: false,
      is_starter: true,
    });
    if (upsert.error) throw upsert.error;
    const wipe = await sb.from("experiment_rows").delete().eq("experiment_id", copyId);
    if (wipe.error) throw wipe.error;
    if (!experiment.rows.length) continue;
    const ins = await sb.from("experiment_rows").insert(
      experiment.rows.map((row, position) => ({
        experiment_id: copyId,
        example_id: row.exampleId,
        position,
        prompt: row.prompt,
        completion: row.completion,
        output: row.completion,
        probes: row.probes,
        scores: row.scores,
        comments: row.comments,
        error: row.error ?? null,
        repetition: row.repetition ?? 1,
      })),
    );
    if (ins.error) throw ins.error;
    console.log(`Copied ${experiment.tokenPolicy} starter into workspace ${starter.owner_id}`);
  }
}

async function main() {
  const policy = (process.argv[2] ||
    process.env.TOKEN_POLICY ||
    "first_assistant") as TokenPolicy;
  const meta = POLICIES[policy];
  if (!meta) throw new Error(`Unknown token policy: ${policy}`);

  const OUT = `/tmp/nlasmith-forum-run-${policy}.json`;
  const openai = process.env.OPENAI_API_KEY;
  const neuronpedia = process.env.NEURONPEDIA_API_KEY;
  if (!openai) throw new Error("OPENAI_API_KEY missing");
  if (!neuronpedia) throw new Error("NEURONPEDIA_API_KEY missing");

  const catalog = await readCatalogStore();
  const dataset =
    catalog.datasets.find((d) => d.id === CATALOG_DATASET_ID) ?? emptyStore().datasets[0];
  const evaluator =
    catalog.evaluators.find((e) => e.id === CATALOG_EVALUATOR_ID) ??
    emptyStore().evaluators[0];

  const experiment: Experiment = {
    id: meta.id,
    name: meta.name,
    datasetId: dataset.id,
    sourceId: "llama70b",
    tokenPolicy: policy,
    evaluatorIds: [evaluator.id],
    rows: [],
    status: "running",
    createdAt: new Date().toISOString(),
    runNumber: nextRunNumber(catalog.experiments, dataset.id),
    repetitions: 1,
    isStarter: true,
  };

  for (let i = 0; i < dataset.examples.length; i++) {
    const example = dataset.examples[i];
    console.log(`[${i + 1}/${dataset.examples.length}] ${example.prompt.slice(0, 72)}`);
    let row: ExperimentRow = {
      exampleId: example.id,
      prompt: example.prompt,
      completion: "",
      probes: [],
      scores: {},
      comments: {},
      repetition: 1,
    };
    try {
      const nla = await runNlaExample({
        apiKey: neuronpedia,
        modelId: "llama3.3-70b-it",
        nlaSourceId: "kitft-l53",
        prompt: example.prompt,
        tokenPolicy: policy,
      });
      row = { ...row, ...nla };
      const judged = await runJudge({
        apiKey: openai,
        evaluator,
        row,
        reference: example.reference,
      });
      row.scores = judged.scores;
      row.comments = judged.comments;
    } catch (err) {
      row.error = err instanceof Error ? err.message : String(err);
      console.error("  error:", row.error);
    }
    experiment.rows.push(row);
    await writeFile(
      OUT,
      JSON.stringify(
        { datasets: [dataset], evaluators: [evaluator], experiments: [experiment] },
        null,
        2,
      ),
    );
  }

  experiment.status = experiment.rows.some((r) => !r.error) ? "done" : "error";
  const nextCatalog = {
    ...catalog,
    datasets: catalog.datasets.length ? catalog.datasets : [dataset],
    evaluators: catalog.evaluators.length ? catalog.evaluators : [evaluator],
    experiments: [
      ...catalog.experiments.filter((e) => e.id !== experiment.id),
      experiment,
    ],
  };
  try {
    await writeCatalogStore(nextCatalog);
    await copyToStarterWorkspaces(experiment);
    console.log("Wrote catalog and workspace copies.");
  } catch (err) {
    console.warn(
      "Supabase client write skipped:",
      err instanceof Error ? err.message : err,
    );
    console.log(`Catalog JSON at ${OUT} — insert via SQL if needed.`);
  }
  const hits = experiment.rows.filter((r) => r.scores.mentions_reddit === true).length;
  console.log(
    `Saved ${meta.id}: ${experiment.rows.length} rows, ${hits} forum-positive`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
