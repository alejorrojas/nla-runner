"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { CompareCharts } from "@/components/compare-charts";
import { RunTable } from "@/components/run-table";
import { expColor, expLetter } from "@/lib/exp-colors";
import { useStore } from "@/lib/store-client";
import { NLA_SOURCES, type Experiment } from "@/lib/types";

export default function ComparePage() {
  return (
    <Suspense fallback={<PageLoader label="Loading compare" />}>
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const { store } = useStore();
  const ids = (search.get("ids") || "").split(",").filter(Boolean);

  const dataset = store?.datasets.find((d) => d.id === id);
  const experiments = useMemo(
    () =>
      (store?.experiments.filter((e) => ids.includes(e.id)) ?? []).sort(
        (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id),
      ),
    [store, ids],
  );

  if (!store) return <PageLoader label="Loading compare" />;
  if (!dataset) return <p className="p-8">Dataset not found.</p>;

  const sourceLabel = (ex: Experiment) =>
    NLA_SOURCES.find((s) => s.id === ex.sourceId)?.label ?? ex.name;
  const evaluators = store.evaluators.filter((ev) =>
    experiments.some((ex) => ex.evaluatorIds.includes(ev.id)),
  );

  return (
    <div>
      <PageHeader
        crumb={
          <>
            <Link href="/datasets">Datasets</Link>
            <span> / </span>
            <Link href={`/datasets/${dataset.id}`}>{dataset.name}</Link>
            <span> / </span>
            <span className="text-[var(--ink)]">Compare</span>
          </>
        }
        title="Comparing"
        hint="Judge hit rate and MSE on the same prompts. The table is the AVs."
        action={
          <div className="flex flex-wrap gap-2">
            {experiments.map((ex, i) => (
              <span key={ex.id} className="pill">
                <span className="letter" style={{ background: expColor(i) }}>
                  {expLetter(i)}
                </span>
                <span className="max-w-[220px] truncate font-mono text-[11px]">
                  {sourceLabel(ex)} · {ex.tokenPolicy}
                </span>
              </span>
            ))}
          </div>
        }
      />

      <CompareCharts experiments={experiments} />

      <RunTable
        dataset={dataset}
        experiments={experiments}
        evaluators={evaluators}
      />
    </div>
  );
}
