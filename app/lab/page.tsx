"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { CompareCharts } from "@/components/compare-charts";
import { ExampleWorkspaceNote } from "@/components/example-workspace-note";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
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
  const { keys } = useKeys();
  const { store } = useStore();
  const keysOk = Boolean(keys.openai && keys.neuronpedia);
  const firstDataset = store?.datasets[0];
  const live = store?.experiments.filter((e) => e.status === "running") ?? [];

  if (!store) return <PageLoader label="Loading datasets and judges" />;

  const latest = [...store.experiments].sort(
    (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
  )[0];

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
        {store.experiments.some((e) => e.isStarter) ? (
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
              {store.datasets.length === 0 ? (
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
            className="surface rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
          >
            <div className="text-[13px] font-medium text-[var(--muted)]">Evaluate</div>
            <div className="mt-1 text-[16px] font-medium">Run a dataset</div>
            <p className="mt-1 text-[13px] text-[var(--muted)]">
              {live.length
                ? `${live.length} run${live.length === 1 ? "" : "s"} in flight.`
                : latest
                  ? `Latest: ${latest.name}`
                  : "Watch which prompt is in flight. Then compare."}
            </p>
          </Link>
          <Link
            href="/evaluators"
            className="surface rounded-2xl p-5 transition-transform duration-300 hover:-translate-y-0.5"
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
  if (!store) return null;

  const withRows = store.experiments.filter((e) => e.rows.length > 0);
  const latest = defaultCompareIds(withRows)
    .map((id) => withRows.find((e) => e.id === id))
    .filter((e): e is NonNullable<typeof e> => Boolean(e));

  if (latest.length === 0) {
    return (
      <section className="mb-2">
        <div className="mb-3 section-title">My latest experiments</div>
        <div className="surface px-4 py-6 text-[13px] text-[var(--muted)]">
          Finished runs show up here. Two Example runs are copied in on first login.
        </div>
      </section>
    );
  }

  const datasetId = latest[0].datasetId;
  const compareHref = `/datasets/${datasetId}/compare?ids=${latest.map((e) => e.id).join(",")}`;

  return (
    <section>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="section-title">My latest experiments</div>
        <Link href={compareHref} className="text-[13px] text-[var(--accent)] hover:underline">
          Open compare →
        </Link>
      </div>
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
    </section>
  );
}
