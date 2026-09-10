"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-client";

export default function DatasetsPage() {
  const { store, save } = useStore();
  if (!store) return <p className="p-8 text-[var(--muted)]">Loading…</p>;

  return (
    <div>
      <div className="border-b border-[var(--line)] bg-[var(--card)] px-5 py-2">
        <div className="crumb">
          <span>Datasets & Experiments</span>
        </div>
      </div>
      <div className="p-5">
        <div className="mb-5 flex items-center justify-between">
          <div>
            <h1 className="text-[20px] font-semibold tracking-tight">Datasets</h1>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              Prompts an experiment runs over.
            </p>
          </div>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => {
              const name = window.prompt("Dataset name");
              if (!name) return;
              void save({
                ...store,
                datasets: [
                  {
                    id: crypto.randomUUID(),
                    name,
                    examples: [{ id: crypto.randomUUID(), prompt: "" }],
                  },
                  ...store.datasets,
                ],
              });
            }}
          >
            New dataset
          </button>
        </div>
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--card)]">
          {store.datasets.map((ds) => (
            <li key={ds.id}>
              <Link
                href={`/datasets/${ds.id}`}
                className="flex items-center justify-between px-4 py-3 hover:bg-[var(--hover)]"
              >
                <span>{ds.name}</span>
                <span className="text-[12px] text-[var(--muted)]">
                  {ds.examples.length} examples
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
