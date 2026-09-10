import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { emptyStore } from "./seed";
import type { Experiment, Store } from "./types";

const ROW_ID = "default";
const FILE = path.join(process.cwd(), "data", "store.json");

function supabaseAdmin(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
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

export async function readStore(): Promise<Store> {
  const sb = supabaseAdmin();
  if (sb) {
    const { data, error } = await sb
      .from("nla_eval_store")
      .select("payload")
      .eq("id", ROW_ID)
      .maybeSingle();
    if (error) throw error;
    if (!data?.payload) {
      const seed = emptyStore();
      await writeStore(seed);
      return seed;
    }
    return data.payload as Store;
  }

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
  const sb = supabaseAdmin();
  if (sb) {
    const { error } = await sb.from("nla_eval_store").upsert({
      id: ROW_ID,
      payload: store,
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
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
