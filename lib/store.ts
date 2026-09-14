import type { SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import {
  CATALOG_DATASET_ID,
  CATALOG_EVALUATOR_ID,
  CATALOG_EXPERIMENT_ID,
} from "./urls";
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

async function deleteMissingOwned(
  sb: SupabaseClient,
  table: string,
  ownerId: string,
  keep: string[],
): Promise<void> {
  const { data, error } = await sb.from(table).select("id").eq("owner_id", ownerId);
  throwIf(error);
  const extra = (data ?? [])
    .map((row) => row.id as string)
    .filter((id) => !keep.includes(id));
  if (extra.length === 0) return;
  const del = await sb.from(table).delete().eq("owner_id", ownerId).in("id", extra);
  throwIf(del.error);
}

function mapStore(
  datasetsRes: { data: Record<string, unknown>[] | null },
  examplesRes: { data: Record<string, unknown>[] | null },
  evaluatorsRes: { data: Record<string, unknown>[] | null },
  experimentsRes: { data: Record<string, unknown>[] | null },
  rowsRes: { data: Record<string, unknown>[] | null },
): Store {
  const examplesByDs = new Map<string, DatasetExample[]>();
  for (const row of examplesRes.data ?? []) {
    const datasetId = row.dataset_id as string;
    const list = examplesByDs.get(datasetId) ?? [];
    list.push({
      id: row.id as string,
      prompt: row.prompt as string,
      reference: (row.reference as string | null) ?? undefined,
    });
    examplesByDs.set(datasetId, list);
  }

  const datasets: Dataset[] = (datasetsRes.data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    examples: examplesByDs.get(row.id as string) ?? [],
  }));

  const evaluators: Evaluator[] = (evaluatorsRes.data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    openaiModel: row.openai_model as string,
    prompt: row.prompt as string,
    mapping: (row.mapping ?? {}) as Evaluator["mapping"],
    feedback: (row.feedback ?? []) as FeedbackField[],
    createdAt: row.created_at as string,
  }));

  const rowsByExp = new Map<string, ExperimentRow[]>();
  for (const row of rowsRes.data ?? []) {
    const experimentId = row.experiment_id as string;
    const list = rowsByExp.get(experimentId) ?? [];
    list.push({
      exampleId: row.example_id as string,
      prompt: row.prompt as string,
      completion: row.completion as string,
      probes: (row.probes ?? []) as NlaProbe[],
      scores: (row.scores ?? {}) as ExperimentRow["scores"],
      comments: (row.comments ?? {}) as ExperimentRow["comments"],
      error: (row.error as string | null) ?? undefined,
    });
    rowsByExp.set(experimentId, list);
  }

  const experiments: Experiment[] = (experimentsRes.data ?? []).map((row) => ({
    id: row.id as string,
    name: row.name as string,
    datasetId: row.dataset_id as string,
    sourceId: row.source_id as string,
    tokenPolicy: row.token_policy as TokenPolicy,
    evaluatorIds: (row.evaluator_ids as string[]) ?? [],
    rows: rowsByExp.get(row.id as string) ?? [],
    status: row.status as Experiment["status"],
    error: (row.error as string | null) ?? undefined,
    createdAt: row.created_at as string,
    isStarter: Boolean(row.is_starter),
  }));

  return { datasets, evaluators, experiments };
}

async function fetchOwnedStore(sb: SupabaseClient, ownerId: string | null): Promise<Store> {
  const ownerFilter = ownerId
    ? { col: "owner_id", val: ownerId }
    : null;

  let datasetsQ = sb.from("datasets").select("*");
  let evaluatorsQ = sb.from("evaluators").select("*");
  let experimentsQ = sb.from("experiments").select("*").order("created_at", { ascending: false });

  if (ownerFilter) {
    datasetsQ = datasetsQ.eq("owner_id", ownerId);
    evaluatorsQ = evaluatorsQ.eq("owner_id", ownerId);
    experimentsQ = experimentsQ.eq("owner_id", ownerId);
  } else {
    datasetsQ = datasetsQ.eq("is_catalog", true);
    evaluatorsQ = evaluatorsQ.eq("is_catalog", true);
    experimentsQ = experimentsQ.eq("is_catalog", true);
  }

  const datasetsRes = await datasetsQ;
  throwIf(datasetsRes.error);
  const datasetIds = (datasetsRes.data ?? []).map((row) => row.id as string);
  const examplesRes = datasetIds.length
    ? await sb.from("dataset_examples").select("*").in("dataset_id", datasetIds).order("position")
    : { data: [], error: null };
  throwIf(examplesRes.error);
  const evaluatorsRes = await evaluatorsQ;
  throwIf(evaluatorsRes.error);
  const experimentsRes = await experimentsQ;
  throwIf(experimentsRes.error);
  const experimentIds = (experimentsRes.data ?? []).map((row) => row.id as string);
  const rowsRes = experimentIds.length
    ? await sb.from("experiment_rows").select("*").in("experiment_id", experimentIds).order("position")
    : { data: [], error: null };
  throwIf(rowsRes.error);

  return mapStore(datasetsRes, examplesRes, evaluatorsRes, experimentsRes, rowsRes);
}

async function writeOwnedStore(
  sb: SupabaseClient,
  ownerId: string | null,
  store: Store,
  flags: { catalog: boolean },
): Promise<void> {
  if (ownerId) {
    await deleteMissingOwned(sb, "experiments", ownerId, store.experiments.map((e) => e.id));
    await deleteMissingOwned(sb, "evaluators", ownerId, store.evaluators.map((e) => e.id));
    await deleteMissingOwned(sb, "datasets", ownerId, store.datasets.map((d) => d.id));
  }

  if (store.datasets.length) {
    const ds = await sb.from("datasets").upsert(
      store.datasets.map((d) => ({
        id: d.id,
        name: d.name,
        owner_id: ownerId,
        is_catalog: flags.catalog,
      })),
    );
    throwIf(ds.error);
    for (const dataset of store.datasets) {
      const wipe = await sb.from("dataset_examples").delete().eq("dataset_id", dataset.id);
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
        owner_id: ownerId,
        is_catalog: flags.catalog,
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
        owner_id: ownerId,
        is_catalog: flags.catalog,
        is_starter: Boolean(e.isStarter) || flags.catalog,
      })),
    );
    throwIf(ex.error);
    for (const experiment of store.experiments) {
      const wipe = await sb.from("experiment_rows").delete().eq("experiment_id", experiment.id);
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

function remapCatalog(catalog: Store): Store {
  const dsMap = new Map<string, string>();
  const evMap = new Map<string, string>();
  const datasets = catalog.datasets.map((d) => {
    const id = crypto.randomUUID();
    dsMap.set(d.id, id);
    return { ...d, id };
  });
  const evaluators = catalog.evaluators.map((e) => {
    const id = crypto.randomUUID();
    evMap.set(e.id, id);
    return { ...e, id };
  });
  const experiments = catalog.experiments.map((e) => ({
    ...e,
    id: crypto.randomUUID(),
    datasetId: dsMap.get(e.datasetId) ?? e.datasetId,
    evaluatorIds: e.evaluatorIds.map((id) => evMap.get(id) ?? id),
    isStarter: true,
  }));
  return { datasets, evaluators, experiments };
}

async function ensureWorkspace(sb: SupabaseClient, userId: string): Promise<void> {
  const profile = await sb.from("profiles").select("id, seeded_at, email").eq("id", userId).maybeSingle();
  throwIf(profile.error);
  if (!profile.data) {
    const ins = await sb.from("profiles").insert({ id: userId });
    throwIf(ins.error);
  }
  if (profile.data?.seeded_at) return;

  const catalog = await fetchOwnedStore(sb, null);
  if (!catalog.datasets.length) {
    const seed = emptyStore();
    await writeOwnedStore(sb, null, seed, { catalog: true });
  }
  const fresh = catalog.datasets.length ? catalog : await fetchOwnedStore(sb, null);
  const copy = remapCatalog(fresh);
  await writeOwnedStore(sb, userId, copy, { catalog: false });
  const mark = await sb
    .from("profiles")
    .update({ seeded_at: new Date().toISOString() })
    .eq("id", userId);
  throwIf(mark.error);
}

export async function readCatalogStore(): Promise<Store> {
  const sb = createSecretClient();
  if (!sb) return emptyStore();
  const store = await fetchOwnedStore(sb, null);
  if (store.datasets.length) return store;
  const seed = emptyStore();
  await writeOwnedStore(sb, null, seed, { catalog: true });
  return seed;
}

export async function writeCatalogStore(store: Store): Promise<void> {
  const sb = createSecretClient();
  if (!sb) throw new Error("Supabase secret client missing");
  await writeOwnedStore(sb, null, store, { catalog: true });
}

export async function readUserStore(userId: string): Promise<Store> {
  const sb = createSecretClient();
  if (!sb) {
    return readFileStore();
  }
  await ensureWorkspace(sb, userId);
  return fetchOwnedStore(sb, userId);
}

export async function writeUserStore(userId: string, store: Store): Promise<void> {
  const sb = createSecretClient();
  if (!sb) {
    await writeFileStore(store);
    return;
  }
  await writeOwnedStore(sb, userId, store, { catalog: false });
}

export async function patchUserStore(
  userId: string,
  fn: (store: Store) => Store | Promise<Store>,
): Promise<Store> {
  const current = await readUserStore(userId);
  const next = await fn(current);
  await writeUserStore(userId, next);
  return next;
}

async function readFileStore(): Promise<Store> {
  try {
    const raw = await readFile(FILE, "utf8");
    return JSON.parse(raw) as Store;
  } catch {
    const seed = emptyStore();
    await writeFileStore(seed);
    return seed;
  }
}

async function writeFileStore(store: Store): Promise<void> {
  await mkdir(path.dirname(FILE), { recursive: true });
  await writeFile(FILE, JSON.stringify(store, null, 2));
}

export { CATALOG_DATASET_ID, CATALOG_EVALUATOR_ID, CATALOG_EXPERIMENT_ID };
