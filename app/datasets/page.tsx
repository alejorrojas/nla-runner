"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { TableRowsSkeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store-client";

export default function DatasetsPage() {
  const { store, save } = useStore();

  return (
    <div>
      <PageHeader
        crumb="Personal / Datasets & Experiments"
        title="Datasets"
        hint="Prompt lists you own. New accounts start with an Example dataset and two finished Example runs so you can compare aggregates before you run anything."
        action={
          <Button
            type="button"
            disabled={!store}
            onClick={() => {
              if (!store) return;
              const name = window.prompt("Dataset name");
              if (!name) return;
              void save({
                ...store,
                datasets: [
                  {
                    id: crypto.randomUUID(),
                    name,
                    evaluatorIds: [],
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
              {!store ? (
                <TableRowsSkeleton
                  rows={4}
                  columns={["w-40", "w-8", "w-8", "w-10"]}
                />
              ) : store.datasets.length === 0 ? (
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
