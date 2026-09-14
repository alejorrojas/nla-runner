"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-client";

export default function DatasetsPage() {
  const { store, save } = useStore();
  if (!store) return <PageLoader label="Loading datasets" />;

  return (
    <div>
      <PageHeader
        crumb="Personal / Datasets & Experiments"
        title="Datasets"
          hint="Prompt lists. Open one to run experiments and watch the live panel. A starter forum-prior run is copied into every new account."
        action={
          <Button
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
            <Plus />
            Dataset
          </Button>
        }
      />
      <div className="page-body">
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Prompts</th>
                <th>Runs</th>
                <th>Progress</th>
              </tr>
            </thead>
            <tbody>
              {store.datasets.length === 0 ? (
                <tr>
                  <td colSpan={4} className="text-[var(--muted)]">
                    No datasets yet.
                  </td>
                </tr>
              ) : (
                store.datasets.map((ds) => {
                  const runs = store.experiments.filter((e) => e.datasetId === ds.id);
                  const live = runs.filter((e) => e.status === "running");
                  return (
                    <tr key={ds.id}>
                      <td>
                        <Link href={`/datasets/${ds.id}`} className="font-medium hover:underline">
                          {ds.name}
                        </Link>
                      </td>
                      <td className="font-mono">{ds.examples.length}</td>
                      <td className="font-mono">{runs.length}</td>
                      <td className="text-[var(--muted)]">
                        {live.length ? `${live.length} live` : "idle"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
