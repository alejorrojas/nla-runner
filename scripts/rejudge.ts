import { readFile, writeFile } from "fs/promises";
import path from "path";
import { runJudge } from "../lib/judge";
import type { Store } from "../lib/types";

async function main() {
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) throw new Error("OPENAI_API_KEY missing");
  const file = path.join(process.cwd(), "data", "store.json");
  const store = JSON.parse(await readFile(file, "utf8")) as Store;
  const evaluator = store.evaluators.find((e) => e.id === "ev-reddit");
  const row = store.experiments
    .flatMap((e) => e.rows)
    .find((r) => r.probes.length > 0);
  if (!evaluator || !row) throw new Error("missing evaluator or AV row");
  const judged = await runJudge({
    apiKey,
    evaluator,
    row,
  });
  console.log(JSON.stringify({ scores: judged.scores, comments: judged.comments }, null, 2));
  const smoke = store.experiments.find((e) => e.datasetId === "ds-smoke-laptop");
  if (smoke) {
    smoke.rows = [
      {
        ...row,
        scores: judged.scores,
        comments: judged.comments,
        error: undefined,
      },
    ];
    smoke.status = "done";
    smoke.name = `${smoke.name} (rejudge theme)`;
    await writeFile(file, JSON.stringify(store, null, 2) + "\n");
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
