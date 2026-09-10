"use client";

import Link from "next/link";
import { useKeys } from "@/lib/keys";
import { useStore } from "@/lib/store-client";

const STEPS = [
  {
    n: "1",
    title: "Paste API keys",
    href: "/settings",
    cta: "Open Settings",
    body: "OpenAI runs the LLM judge. Neuronpedia runs completion + NLA explain. Keys stay in this tab only.",
  },
  {
    n: "2",
    title: "Write or pick a dataset",
    href: "/datasets",
    cta: "Open Datasets",
    body: "A dataset is the list of prompts. Experiments average the judge over those rows. There is a seed set (Reddit prior) ready to run.",
  },
  {
    n: "3",
    title: "Define an LLM judge",
    href: "/evaluators",
    cta: "Open Evaluators",
    body: "Mustache prompt + mapping onto the AV (nla, token, mse), not the chat reply. Feedback keys are the scores in the charts (boolean, 0–1, or categories).",
  },
  {
    n: "4",
    title: "Run an experiment",
    href: "/datasets",
    cta: "Pick a dataset",
    body: "Choose NLA source (Llama / Gemma), which token to explain (last user, first assistant, or both), attach judges, then Run. Neuronpedia has an hourly explain cap.",
  },
  {
    n: "5",
    title: "Compare",
    href: "/datasets",
    cta: "See datasets",
    body: "Check two or more runs on the same dataset and Compare. The Judge chart is hit rate. The MSE chart says whether the verbalization is readable. The table shows the AVs.",
  },
] as const;

export default function HomePage() {
  const { keys } = useKeys();
  const { store } = useStore();
  const keysOk = Boolean(keys.openai && keys.neuronpedia);
  const firstDataset = store?.datasets[0];

  return (
    <div>
      <div className="border-b border-[var(--line)] bg-[var(--card)] px-5 py-2">
        <div className="crumb">Home</div>
      </div>
      <div className="mx-auto max-w-3xl px-6 py-10">
        <p className="text-[12px] font-medium uppercase tracking-wide text-[var(--muted)]">
          NLA Eval
        </p>
        <h1 className="mt-1 text-[28px] font-semibold tracking-tight">
          LangSmith for activation verbalizations
        </h1>
        <p className="mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
          Neuronpedia is a microscope: one chat, one NLA. This app is the
          experiment loop. You score AVs with an LLM judge and compare runs
          the way LangSmith compares model outputs.
        </p>

        <div className="mt-6 flex flex-wrap gap-2">
          <Link href="/settings" className="btn btn-primary">
            {keysOk ? "Keys are set" : "Add keys first"}
          </Link>
          {firstDataset ? (
            <Link href={`/datasets/${firstDataset.id}`} className="btn">
              Open {firstDataset.name}
            </Link>
          ) : (
            <Link href="/datasets" className="btn">
              Open datasets
            </Link>
          )}
        </div>

        <ol className="mt-10 space-y-3">
          {STEPS.map((step) => (
            <li
              key={step.n}
              className="rounded-lg border border-[var(--line)] bg-[var(--card)] p-4"
            >
              <div className="flex items-start gap-3">
                <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-[var(--active)] text-[13px] font-semibold text-[#1a4db3]">
                  {step.n}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="text-[15px] font-medium">{step.title}</div>
                  <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
                    {step.body}
                  </p>
                  <Link
                    href={step.href}
                    className="mt-2 inline-block text-[13px] text-[#1a4db3] hover:underline"
                  >
                    {step.cta} →
                  </Link>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
}
