import type { SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { emptyStore } from "./seed";
import { createSecretClient } from "./supabase";
import type {
  Dataset,
  DatasetExample,
  Evaluator,
  Experiment,
  ExperimentRow,
  FeedbackField,
  NlaProbe,
  Store,
  TokenPolicy,
} from "./types";

const FILE = path.join(process.cwd(), "data", "store.json");

type DbError = { message: string } | null;

function throwIf(error: DbError): void {
  if (error) throw new Error(error.message);
}

function mergeExperiments(server: Experiment[], client: Experiment[]): Experiment[] {
  const byId = new Map(server.map((e) => [e.id, e]));
  for (const e of client) {
    const prev = byId.get(e.id);
    if (
      !prev ||
      e.rows.length >= prev.rows.length ||
      (e.status === "done" && prev.status !== "done")
    ) {
      byId.set(e.id, e);
    }
  }
  return [...byId.values()].sort((a, b) =>
    b.createdAt.localeCompare(a.createdAt),
  );
}

export function mergeClientStore(server: Store, incoming: Store): Store {
  return {
    datasets: incoming.datasets,
    evaluators: incoming.evaluators,
    experiments: mergeExperiments(server.experiments, incoming.experiments),
  };
}

async function deleteMissing(
  sb: SupabaseClient,
  table: string,
  keep: string[],
): Promise<void> {
  const { data, error } = await sb.from(table).select("id");
  throwIf(error);
  const extra = (data ?? [])
    .map((row) => row.id as string)
    .filter((id) => !keep.includes(id));
  if (extra.length === 0) return;
  const del = await sb.from(table).delete().in("id", extra);
  throwIf(del.error);
}

async function readStoreFromSupabase(sb: SupabaseClient): Promise<Store> {
  const datasetsRes = await sb.from("datasets").select("*");
  throwIf(datasetsRes.error);
  const examplesRes = await sb
    .from("dataset_examples")
    .select("*")
    .order("position");
  throwIf(examplesRes.error);
  const evaluatorsRes = await sb.from("evaluators").select("*");
  throwIf(evaluatorsRes.error);
  const experimentsRes = await sb
    .from("experiments")
    .select("*")
    .order("created_at", { ascending: false });
  throwIf(experimentsRes.error);
  const rowsRes = await sb
    .from("experiment_rows")
    .select("*")
    .order("position");
  throwIf(rowsRes.error);

  if (!datasetsRes.data?.length) {
    const seed = emptyStore();
    await writeStoreToSupabase(sb, seed);
    return seed;
  }

  const examplesByDs = new Map<string, DatasetExample[]>();
  for (const row of examplesRes.data ?? []) {
    const list = examplesByDs.get(row.dataset_id) ?? [];
    list.push({
      id: row.id,
      prompt: row.prompt,
      reference: row.reference ?? undefined,
    });
    examplesByDs.set(row.dataset_id, list);
  }

  const datasets: Dataset[] = (datasetsRes.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    examples: examplesByDs.get(row.id) ?? [],
  }));

  const evaluators: Evaluator[] = (evaluatorsRes.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    openaiModel: row.openai_model,
    prompt: row.prompt,
    mapping: (row.mapping ?? {}) as Evaluator["mapping"],
    feedback: (row.feedback ?? []) as FeedbackField[],
    createdAt: row.created_at,
  }));

  const rowsByExp = new Map<string, ExperimentRow[]>();
  for (const row of rowsRes.data ?? []) {
    const list = rowsByExp.get(row.experiment_id) ?? [];
    list.push({
      exampleId: row.example_id,
      prompt: row.prompt,
      completion: row.completion,
      probes: (row.probes ?? []) as NlaProbe[],
      scores: (row.scores ?? {}) as ExperimentRow["scores"],
      comments: (row.comments ?? {}) as ExperimentRow["comments"],
      error: row.error ?? undefined,
    });
    rowsByExp.set(row.experiment_id, list);
  }

  const experiments: Experiment[] = (experimentsRes.data ?? []).map((row) => ({
    id: row.id,
    name: row.name,
    datasetId: row.dataset_id,
    sourceId: row.source_id,
    tokenPolicy: row.token_policy as TokenPolicy,
    evaluatorIds: row.evaluator_ids ?? [],
    rows: rowsByExp.get(row.id) ?? [],
    status: row.status as Experiment["status"],
    error: row.error ?? undefined,
    createdAt: row.created_at,
  }));

  return { datasets, evaluators, experiments };
}

async function writeStoreToSupabase(
  sb: SupabaseClient,
  store: Store,
): Promise<void> {
  await deleteMissing(sb, "experiments", store.experiments.map((e) => e.id));
  await deleteMissing(sb, "evaluators", store.evaluators.map((e) => e.id));
  await deleteMissing(sb, "datasets", store.datasets.map((d) => d.id));

  if (store.datasets.length) {
    const ds = await sb.from("datasets").upsert(
      store.datasets.map((d) => ({ id: d.id, name: d.name })),
    );
    throwIf(ds.error);
    for (const dataset of store.datasets) {
      const wipe = await sb
        .from("dataset_examples")
        .delete()
        .eq("dataset_id", dataset.id);
      throwIf(wipe.error);
      if (!dataset.examples.length) continue;
      const ins = await sb.from("dataset_examples").insert(
        dataset.examples.map((ex, position) => ({
          id: ex.id,
          dataset_id: dataset.id,
          prompt: ex.prompt,
          reference: ex.reference ?? null,
          position,
        })),
      );
      throwIf(ins.error);
    }
  }

  if (store.evaluators.length) {
    const ev = await sb.from("evaluators").upsert(
      store.evaluators.map((e) => ({
        id: e.id,
        name: e.name,
        openai_model: e.openaiModel,
        prompt: e.prompt,
        mapping: e.mapping,
        feedback: e.feedback,
        created_at: e.createdAt,
      })),
    );
    throwIf(ev.error);
  }

  if (store.experiments.length) {
    const ex = await sb.from("experiments").upsert(
      store.experiments.map((e) => ({
        id: e.id,
        dataset_id: e.datasetId,
        name: e.name,
        source_id: e.sourceId,
        token_policy: e.tokenPolicy,
        evaluator_ids: e.evaluatorIds,
        status: e.status,
        error: e.error ?? null,
        created_at: e.createdAt,
      })),
    );
    throwIf(ex.error);
    for (const experiment of store.experiments) {
      const wipe = await sb
        .from("experiment_rows")
        .delete()
        .eq("experiment_id", experiment.id);
      throwIf(wipe.error);
      if (!experiment.rows.length) continue;
      const ins = await sb.from("experiment_rows").insert(
        experiment.rows.map((row, position) => ({
          experiment_id: experiment.id,
          example_id: row.exampleId,
          position,
          prompt: row.prompt,
          completion: row.completion,
          probes: row.probes,
          scores: row.scores,
          comments: row.comments,
          error: row.error ?? null,
        })),
      );
      throwIf(ins.error);
    }
  }
}

export async function readStore(): Promise<Store> {
  const sb = createSecretClient();
  if (sb) return readStoreFromSupabase(sb);

  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const seed = emptyStore();
    await writeStore(seed);
    return seed;
  }
}

export async function writeStore(store: Store): Promise<void> {
  const sb = createSecretClient();
  if (sb) {
    await writeStoreToSupabase(sb, store);
    return;
  }
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2), "utf8");
}

export async function patchStore(
  fn: (store: Store) => Store | Promise<Store>,
): Promise<Store> {
  const current = await readStore();
  const next = await fn(current);
  await writeStore(next);
  return next;
}
