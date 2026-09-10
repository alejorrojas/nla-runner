import { mkdir, readFile, writeFile } from "fs/promises";
import path from "path";
import { emptyStore } from "./seed";
import type { Store } from "./types";

const FILE = process.env.VERCEL
  ? path.join("/tmp", "nla-eval-store.json")
  : path.join(process.cwd(), "data", "store.json");

export async function readStore(): Promise<Store> {
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
