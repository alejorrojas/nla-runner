"use client";

import Link from "next/link";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { useKeys } from "@/lib/keys";
import { useStore } from "@/lib/store-client";

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
              <Link href={`/datasets/${firstDataset.id}`}>+ Experiment</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/datasets">Open datasets</Link>
            </Button>
          )
        }
      />
      <div className="page-body">
        {keysOk ? null : (
          <div className="mb-5 rounded-xl border border-[var(--line)] bg-[var(--active)] px-4 py-3 text-[13px]">
            Add OpenAI and Neuronpedia keys in{" "}
            <Link href="/settings" className="font-medium text-[var(--accent)] hover:underline">
              Settings
            </Link>{" "}
            before running an experiment.
          </div>
        )}

        <div className="mb-3 flex items-center justify-between">
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
