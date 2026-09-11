"use client";

import Link from "next/link";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { useStore } from "@/lib/store-client";

export default function DatasetsPage() {
  const { store, save } = useStore();
  if (!store) return <PageLoader label="Loading datasets" />;

  return (
    <div>
      <PageHeader
        crumb="Datasets"
        title="Datasets"
        hint="Prompt lists. Open one to run experiments and watch the live panel."
        action={
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
        }
      />
      <div className="p-6">
        <ul className="surface overflow-hidden rounded-lg">
          {store.datasets.length === 0 ? (
            <li className="px-4 py-8 text-[13px] text-[var(--muted)]">
              No datasets yet.
            </li>
          ) : (
            store.datasets.map((ds) => {
              const runs = store.experiments.filter((e) => e.datasetId === ds.id);
              const live = runs.some((e) => e.status === "running");
              return (
                <li key={ds.id}>
                  <Link
                    href={`/datasets/${ds.id}`}
                    className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 last:border-0 hover:bg-[var(--hover)]"
                  >
                    <span className="font-medium">{ds.name}</span>
                    <span className="font-mono text-[12px] text-[var(--muted)]">
                      {ds.examples.length} prompts · {runs.length} runs
                      {live ? " · live" : ""}
                    </span>
                  </Link>
                </li>
              );
            })
          )}
        </ul>
      </div>
    </div>
  );
}
