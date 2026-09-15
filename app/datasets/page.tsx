"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { Plus } from "lucide-react";
import { NewDatasetDialog } from "@/components/new-dataset-dialog";
import { PageHeader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { TableRowsSkeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store-client";

export default function DatasetsPage() {
  const router = useRouter();
  const { store, save } = useStore();
  const [open, setOpen] = useState(false);

  return (
    <div>
      <PageHeader
        crumb="Personal / Datasets & Experiments"
        title="Datasets"
        hint="Prompt lists you own. New accounts start with an Example dataset and two finished Example runs so you can compare aggregates before you run anything."
        action={
          <Button type="button" disabled={!store} onClick={() => setOpen(true)}>
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
      <NewDatasetDialog
        open={open}
        onOpenChange={setOpen}
        onCreate={async (name) => {
          if (!store) return;
          const id = crypto.randomUUID();
          await save({
            ...store,
            datasets: [
              {
                id,
                name,
                evaluatorIds: [],
                examples: [{ id: crypto.randomUUID(), prompt: "" }],
              },
              ...store.datasets,
            ],
          });
          router.push(`/datasets/${id}`);
        }}
      />
    </div>
  );
}
