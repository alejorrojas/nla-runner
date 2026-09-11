"use client";

import Link from "next/link";

const FLOW = [
  { k: "01", t: "Prompt", d: "A dataset row. Short enough to read." },
  { k: "02", t: "Token", d: "Last user, first assistant, or both." },
  { k: "03", t: "AV", d: "The NLA sentence on that residual." },
  { k: "04", t: "Judge", d: "LLM scores the AV, not the chat reply." },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative mx-auto grid min-h-[calc(100vh-88px)] max-w-[1180px] items-center gap-10 px-6 pb-16 pt-4 md:px-8 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative max-w-xl">
          <p className="text-[13px] font-medium text-[var(--muted)]">
            Neuronpedia · LLM-as-judge
          </p>
          <h1 className="mt-4 font-display text-[clamp(42px,6.2vw,68px)] leading-[0.98] text-[var(--ink)]">
            The platform for
            <br />
            residual-stream eval.
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[var(--muted)]">
            Observe, evaluate, and compare activation verbalizations. Score the
            words the model does not say.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/datasets" className="btn btn-primary">
              Get started
            </Link>
            <a href="#how-it-works" className="btn">
              How it works
            </a>
          </div>
        </div>

        <div className="relative mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-white/80 bg-white/95 p-6 shadow-[0_24px_80px_rgba(18,32,58,0.08)]">
            <h2 className="text-center text-[20px] font-medium">Get started</h2>
            <p className="hint mt-3 text-center">
              Open the lab, paste keys, and run a dataset. Compare two sources
              on the same prompts.
            </p>
            <Link href="/lab" className="btn btn-primary mt-6 w-full">
              Open Home
            </Link>
            <Link href="/datasets" className="btn mt-3 w-full">
              Datasets & Experiments
            </Link>
            <p className="hint mt-5 text-center">
              Keys stay in this tab. Runs persist on the server.
            </p>
          </div>
        </div>
      </section>

      <section id="how-it-works" className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-10 md:px-8">
          <p className="text-[13px] font-medium text-[var(--muted)]">
            How it works
          </p>
          <h2 className="mt-2 font-display text-[32px] leading-tight">
            Prompt → token → AV → judge
          </h2>
        </div>
        <div className="mx-auto grid max-w-[1180px] sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step) => (
            <div
              key={step.k}
              className="border-t border-[var(--line)] p-8 sm:border-r last:border-r-0"
            >
              <div className="text-[13px] font-medium text-[var(--accent)]">
                {step.k}
              </div>
              <div className="mt-3 text-[20px] font-medium">{step.t}</div>
              <p className="hint mt-3">{step.d}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
