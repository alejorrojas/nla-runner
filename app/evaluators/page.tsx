"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { TableRowsSkeleton } from "@/components/ui/skeleton";
import { attachedEvaluatorIds } from "@/lib/dataset-evaluators";
import { useStore } from "@/lib/store-client";

export default function EvaluatorsPage() {
  const { store } = useStore();

  return (
    <div>
      <PageHeader
        crumb="Personal / Evaluators"
        title="Evaluators"
        hint="LLM-as-judge on AVs. Attach a judge to a dataset, or create one here."
        action={
          <Button asChild>
            <Link href="/evaluators/new">
              <Plus />
              Evaluator
            </Link>
          </Button>
        }
      />
      <div className="page-body">
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Type</th>
                <th>Feedback</th>
                <th>Datasets</th>
                <th>Model</th>
              </tr>
            </thead>
            <tbody>
              {!store ? (
                <TableRowsSkeleton
                  rows={4}
                  columns={["w-36", "w-24", "w-32", "w-40", "w-24"]}
                />
              ) : store.evaluators.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-[var(--muted)]">
                    No evaluators yet.
                  </td>
                </tr>
              ) : (
                store.evaluators.map((ev) => {
                  const datasets = store.datasets.filter((d) =>
                    attachedEvaluatorIds(
                      d,
                      store.experiments.filter((e) => e.datasetId === d.id),
                    ).includes(ev.id),
                  );
                  return (
                    <tr key={ev.id}>
                      <td>
                        <Link
                          href={`/evaluators/${ev.id}`}
                          className="font-medium hover:underline"
                        >
                          {ev.name}
                        </Link>
                      </td>
                      <td className="text-[var(--muted)]">LLM-as-judge</td>
                      <td className="text-[var(--muted)]">
                        {ev.feedback.map((f) => f.key).join(", ") || "—"}
                      </td>
                      <td className="text-[var(--muted)]">
                        {datasets.length
                          ? datasets.map((d) => d.name).join(", ")
                          : "—"}
                      </td>
                      <td className="font-mono">{ev.openaiModel}</td>
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
