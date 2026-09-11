"use client";

import Link from "next/link";
import { CosmicField } from "@/components/cosmic-field";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { useKeys } from "@/lib/keys";
import { useStore } from "@/lib/store-client";

const STEPS = [
  {
    n: "01",
    title: "Paste API keys",
    href: "/settings",
    cta: "Settings",
    body: "OpenAI judges. Neuronpedia completes and explains. Session only.",
  },
  {
    n: "02",
    title: "Dataset",
    href: "/datasets",
    cta: "Datasets",
    body: "Prompts the experiment averages over. Seed Reddit-prior set is ready.",
  },
  {
    n: "03",
    title: "LLM judge",
    href: "/evaluators",
    cta: "Evaluators",
    body: "Mustache + mapping onto nla / token / mse — not the chat reply.",
  },
  {
    n: "04",
    title: "Run",
    href: "/datasets",
    cta: "Pick a dataset",
    body: "Source, token policy, judges. The panel shows which test is live.",
  },
  {
    n: "05",
    title: "Compare",
    href: "/datasets",
    cta: "Datasets",
    body: "Hit rate, MSE, and the AV table. Check two runs on the same set.",
  },
] as const;

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
            <Link href={`/datasets/${firstDataset.id}`} className="btn btn-primary">
              + Experiment
            </Link>
          ) : (
            <Link href="/datasets" className="btn btn-primary">
              Open datasets
            </Link>
          )
        }
      />
      <div className="p-6">
        <div className="mb-3 text-[12px] font-medium tracking-[0.08em] text-[var(--muted)]">
          LAB
        </div>
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Count</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Datasets</td>
                <td className="font-mono">{store.datasets.length}</td>
                <td className="text-[var(--muted)]">
                  {firstDataset ? firstDataset.name : "—"}
                </td>
              </tr>
              <tr>
                <td>Evaluators</td>
                <td className="font-mono">{store.evaluators.length}</td>
                <td className="text-[var(--muted)]">LLM-as-judge</td>
              </tr>
              <tr>
                <td>Live runs</td>
                <td className="font-mono">{live.length || 0}</td>
                <td className="text-[var(--muted)]">
                  {live.length ? "running" : keysOk ? "idle" : "keys missing"}
                </td>
              </tr>
              <tr>
                <td>Latest experiment</td>
                <td className="font-mono">{latest?.rows.length ?? 0} rows</td>
                <td className="text-[var(--muted)]">{latest?.name ?? "—"}</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="mt-8 grid gap-4 lg:grid-cols-2">
          <Link
            href={firstDataset ? `/datasets/${firstDataset.id}` : "/datasets"}
            className="group relative overflow-hidden rounded-2xl border border-[var(--line)]"
          >
            <CosmicField variant="panel" className="h-40 w-full" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
              <div className="text-[11px] tracking-[0.14em] uppercase opacity-70">
                Evaluate
              </div>
              <div className="mt-1 text-[18px] font-medium">Run a dataset</div>
              <p className="mt-1 text-[13px] text-white/70">
                Watch which prompt is in flight. Then compare.
              </p>
            </div>
          </Link>
          <Link
            href="/evaluators"
            className="group relative overflow-hidden rounded-2xl border border-[var(--line)]"
          >
            <CosmicField variant="hero" className="h-40 w-full" />
            <div className="absolute inset-0 flex flex-col justify-end p-5 text-white">
              <div className="text-[11px] tracking-[0.14em] uppercase opacity-70">
                Judge
              </div>
              <div className="mt-1 text-[18px] font-medium">Define an evaluator</div>
              <p className="mt-1 text-[13px] text-white/70">
                Map onto the AV, not the chat reply.
              </p>
            </div>
          </Link>
        </div>

        <ol className="mt-8 grid gap-3 md:grid-cols-2">
          {STEPS.map((step) => (
            <li key={step.n} className="surface p-5">
              <div className="font-mono text-[11px] text-[var(--muted)]">{step.n}</div>
              <div className="mt-1 text-[16px] font-medium">{step.title}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {step.body}
              </p>
              <Link
                href={step.href}
                className="mt-3 inline-block text-[13px] hover:underline"
              >
                {step.cta} →
              </Link>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
