"use client";

import Link from "next/link";
import { FadeIn } from "@/components/motion";
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

  return (
    <div>
      <PageHeader
        crumb="Lab"
        title="The loop"
        hint="Keys → dataset → judge → run → compare. Same product on every screen."
        action={
          firstDataset ? (
            <Link href={`/datasets/${firstDataset.id}`} className="btn btn-primary">
              Open {firstDataset.name}
            </Link>
          ) : (
            <Link href="/datasets" className="btn btn-primary">
              Open datasets
            </Link>
          )
        }
      />
      <div className="p-6">
        <FadeIn>
          <div className="grid gap-3 sm:grid-cols-3">
            <Stat k="Datasets" v={String(store.datasets.length)} />
            <Stat k="Judges" v={String(store.evaluators.length)} />
            <Stat
              k="Live runs"
              v={live.length ? String(live.length) : keysOk ? "idle" : "keys"}
            />
          </div>
        </FadeIn>
        <ol className="mt-8 grid gap-3 md:grid-cols-2">
          {STEPS.map((step) => (
            <li key={step.n} className="surface rounded-lg p-5">
              <div className="font-mono text-[11px] text-[var(--copper)]">{step.n}</div>
              <div className="mt-1 font-display text-[22px]">{step.title}</div>
              <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
                {step.body}
              </p>
              <Link
                href={step.href}
                className="mt-3 inline-block text-[13px] text-[var(--copper)] hover:underline"
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

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div className="surface rounded-lg px-4 py-3">
      <div className="font-mono text-[10px] uppercase tracking-[0.14em] text-[var(--muted)]">
        {k}
      </div>
      <div className="mt-1 font-display text-[28px] leading-none">{v}</div>
    </div>
  );
}
