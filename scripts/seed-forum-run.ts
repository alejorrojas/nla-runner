import { writeFile } from "fs/promises";
import { CATALOG_DATASET_ID, CATALOG_EVALUATOR_ID, CATALOG_EXPERIMENT_ID } from "../lib/urls";
import { runJudge } from "../lib/judge";
import { runNlaExample } from "../lib/neuronpedia";
import { emptyStore } from "../lib/seed";
import { readCatalogStore, writeCatalogStore } from "../lib/store";
import type { Experiment, ExperimentRow } from "../lib/types";

async function main() {
  const OUT = "/tmp/nlasmith-forum-run.json";
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
    id: CATALOG_EXPERIMENT_ID,
    name: "Forum prior · Llama 3.3 70B · last user",
    datasetId: dataset.id,
    sourceId: "llama70b",
    tokenPolicy: "last_user",
    evaluatorIds: [evaluator.id],
    rows: [],
    status: "running",
    createdAt: new Date().toISOString(),
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
    };
    try {
      const nla = await runNlaExample({
        apiKey: neuronpedia,
        modelId: "llama3.3-70b-it",
        nlaSourceId: "kitft-l53",
        prompt: example.prompt,
        tokenPolicy: "last_user",
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
  try {
    await writeCatalogStore({
      datasets: [dataset],
      evaluators: [evaluator],
      experiments: [experiment],
    });
    console.log("Wrote catalog to Supabase via secret client.");
  } catch (err) {
    console.warn(
      "Supabase client write skipped:",
      err instanceof Error ? err.message : err,
    );
    console.log(`Catalog JSON at ${OUT} — insert via SQL if needed.`);
  }
  const hits = experiment.rows.filter((r) => r.scores.mentions_reddit === true).length;
  console.log(
    `Saved ${CATALOG_EXPERIMENT_ID}: ${experiment.rows.length} rows, ${hits} forum-positive`,
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
