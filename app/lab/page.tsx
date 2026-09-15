"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { CompareCharts } from "@/components/compare-charts";
import { ExampleWorkspaceNote } from "@/components/example-workspace-note";
import { useLimitedMotion } from "@/components/motion";
import { PageHeader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { Skeleton, TableRowsSkeleton } from "@/components/ui/skeleton";
import { expColor, expLetter } from "@/lib/exp-colors";
import { defaultCompareIds } from "@/lib/compare-ids";
import { useKeys } from "@/lib/keys";
import { useStore } from "@/lib/store-client";
import { NLA_SOURCES } from "@/lib/types";

function relativeTime(iso?: string): string {
  if (!iso) return "—";
  const t = Date.parse(iso);
  if (!Number.isFinite(t)) return "—";
  return new Date(t).toISOString().slice(0, 16).replace("T", " ");
}

export default function LabPage() {
  const { hints } = useKeys();
  const { store } = useStore();
  const limited = useLimitedMotion();
  const keysOk = Boolean(hints.openaiHint && hints.neuronpediaHint);
  const firstDataset = store?.datasets[0];
  const live = store?.experiments.filter((e) => e.status === "running") ?? [];
  const latest = store
    ? [...store.experiments].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      )[0]
    : undefined;

  return (
    <div>
      <PageHeader
        crumb="Personal / Home"
        title="Home"
        action={
          firstDataset ? (
            <Button asChild>
              <Link href={`/datasets/${firstDataset.id}`}>
                <Plus />
                Experiment
              </Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/datasets">Open datasets</Link>
            </Button>
          )
        }
      />
      <div className="page-body">
        {store?.experiments.some((e) => e.isStarter) ? (
          <ExampleWorkspaceNote
            href={firstDataset ? `/datasets/${firstDataset.id}` : "/datasets"}
          />
        ) : null}
        {keysOk ? null : (
          <div className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--active)] px-4 py-3 text-[13px]">
            Add OpenAI and Neuronpedia keys in{" "}
            <Link href="/settings" className="font-medium text-[var(--accent)] hover:underline">
              Settings
            </Link>{" "}
            before running an experiment.
          </div>
        )}

        <LatestExperiments />

        <div className="mb-3 mt-6 flex items-center justify-between">
          <div className="section-title">Datasets</div>
          <Link href="/datasets" className="text-[13px] text-[var(--accent)] hover:underline">
            View all →
          </Link>
        </div>
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Examples</th>
                <th>Experiments</th>
                <th>Latest run</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {!store ? (
                <TableRowsSkeleton
                  rows={3}
                  columns={["w-36", "w-8", "w-8", "w-28", "w-10"]}
                />
              ) : store.datasets.length === 0 ? (
                <tr>
                  <td colSpan={5} className="text-[var(--muted)]">
                    No datasets yet.
                  </td>
                </tr>
              ) : (
                store.datasets.map((ds) => {
                  const runs = store.experiments.filter((e) => e.datasetId === ds.id);
                  const newest = [...runs].sort(
                    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
                  )[0];
                  const liveHere = runs.filter((e) => e.status === "running");
                  return (
                    <tr key={ds.id}>
                      <td>
                        <Link href={`/datasets/${ds.id}`} className="font-medium hover:underline">
                          {ds.name}
                        </Link>
                      </td>
                      <td className="font-mono">{ds.examples.length}</td>
                      <td className="font-mono">{runs.length}</td>
                      <td className="text-[var(--muted)]">{relativeTime(newest?.createdAt)}</td>
                      <td className="text-[var(--muted)]">
                        {liveHere.length ? `${liveHere.length} live` : "idle"}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="mt-6 grid gap-4 lg:grid-cols-2">
          <Link
            href={firstDataset ? `/datasets/${firstDataset.id}` : "/datasets"}
            className={`surface rounded-2xl p-5 ${
              limited ? "" : "transition-transform duration-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="text-[13px] font-medium text-[var(--muted)]">Evaluate</div>
            <div className="mt-1 text-[16px] font-medium">Run a dataset</div>
            <div className="mt-1 text-[13px] text-[var(--muted)]">
              {!store ? (
                <Skeleton className="h-3.5 w-48" />
              ) : live.length ? (
                `${live.length} run${live.length === 1 ? "" : "s"} in flight.`
              ) : latest ? (
                `Latest: ${latest.name}`
              ) : (
                "Watch which prompt is in flight. Then compare."
              )}
            </div>
          </Link>
          <Link
            href="/evaluators"
            className={`surface rounded-2xl p-5 ${
              limited ? "" : "transition-transform duration-300 hover:-translate-y-0.5"
            }`}
          >
            <div className="text-[13px] font-medium text-[var(--muted)]">Judge</div>
            <div className="mt-1 text-[16px] font-medium">Define an evaluator</div>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              Map onto the AV, not the chat reply.
            </p>
          </Link>
        </div>
      </div>
    </div>
  );
}

function LatestExperiments() {
  const { store } = useStore();

  const withRows = store?.experiments.filter((e) => e.rows.length > 0) ?? [];
  const latest = store
    ? defaultCompareIds(withRows)
        .map((id) => withRows.find((e) => e.id === id))
        .filter((e): e is NonNullable<typeof e> => Boolean(e))
    : [];

  return (
    <section className={store && latest.length === 0 ? "mb-2" : undefined}>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="section-title">My latest experiments</div>
        {!store ? (
          <Skeleton className="h-3.5 w-24" />
        ) : latest.length > 0 ? (
          <Link
            href={`/datasets/${latest[0].datasetId}/compare?ids=${latest.map((e) => e.id).join(",")}`}
            className="text-[13px] text-[var(--accent)] hover:underline"
          >
            Open compare →
          </Link>
        ) : null}
      </div>
      {!store ? (
        <div className="surface">
          <div className="flex flex-wrap gap-2 px-4 py-3">
            <Skeleton className="h-7 w-48 rounded-full" />
            <Skeleton className="h-7 w-40 rounded-full" />
          </div>
          <div className="flex gap-3 border-t border-[var(--line)] px-3 py-3">
            {Array.from({ length: 3 }, (_, i) => (
              <div key={i} className="min-w-0 flex-1">
                <Skeleton className="mb-2 h-3 w-20" />
                <Skeleton className="h-[140px] w-full" />
              </div>
            ))}
          </div>
        </div>
      ) : latest.length === 0 ? (
        <div className="surface px-4 py-6 text-[13px] text-[var(--muted)]">
          Finished runs show up here. Two Example runs are copied in on first login.
        </div>
      ) : (
        <div className="surface">
          <div className="flex flex-wrap gap-2 px-4 py-3">
            {latest.map((ex, i) => {
              const source =
                NLA_SOURCES.find((s) => s.id === ex.sourceId)?.label ?? ex.sourceId;
              return (
                <span key={ex.id} className="pill">
                  <span className="letter" style={{ background: expColor(i) }}>
                    {expLetter(i)}
                  </span>
                  <span className="max-w-[280px] truncate font-medium">
                    {ex.name}
                  </span>
                  <span className="text-[11px] text-[var(--muted)]">
                    {source} · {ex.tokenPolicy}
                  </span>
                </span>
              );
            })}
          </div>
          <CompareCharts experiments={latest} compact />
        </div>
      )}
    </section>
  );
}
