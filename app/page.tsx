"use client";

import Link from "next/link";
import { CosmicField } from "@/components/cosmic-field";

const FLOW = [
  { k: "01", t: "Prompt", d: "A dataset row. Short enough to read." },
  { k: "02", t: "Token", d: "Last user, first assistant, or both." },
  { k: "03", t: "AV", d: "The NLA sentence on that residual." },
  { k: "04", t: "Judge", d: "LLM scores the AV, not the chat reply." },
];

export default function LandingPage() {
  return (
    <div>
      <section className="relative mx-auto grid min-h-[calc(100vh-76px)] max-w-[1180px] items-center gap-12 px-8 pb-16 pt-6 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="relative max-w-xl">
          <p className="text-[13px] font-medium tracking-[0.04em] text-[var(--muted)]">
            Neuronpedia · LLM-as-judge
          </p>
          <h1 className="mt-4 font-display text-[clamp(44px,6.4vw,72px)] leading-[0.96] text-[var(--ink)]">
            The platform for
            <br />
            residual-stream eval.
          </h1>
          <p className="mt-6 max-w-md text-[16px] leading-relaxed text-[var(--muted)]">
            Observe, evaluate, and compare activation verbalizations. Score the
            words the model does not say.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/datasets" className="btn btn-primary px-5 py-2.5 text-[14px]">
              Open the lab
            </Link>
            <Link href="/lab" className="btn">
              How it works
            </Link>
          </div>
          <div className="mt-14">
            <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-[var(--muted)]">
              The loop
            </p>
            <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-[13px] text-[var(--ink)]">
              {FLOW.map((step) => (
                <span key={step.k} className="flex items-baseline gap-2">
                  <span className="font-mono text-[11px] text-[var(--muted)]">
                    {step.k}
                  </span>
                  {step.t}
                </span>
              ))}
            </div>
          </div>
        </div>

        <div className="relative">
          <div className="overflow-hidden rounded-2xl border border-[var(--line)] shadow-[0_24px_80px_rgba(10,10,10,0.08)]">
            <CosmicField variant="hero" className="aspect-[5/4] w-full" />
          </div>
          <p className="mt-3 font-mono text-[11px] text-[var(--muted)]">
            Residual stream → verbalization → judge
          </p>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto grid max-w-[1180px] sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step) => (
            <div
              key={step.k}
              className="border-[var(--line)] p-8 sm:border-r last:border-r-0"
            >
              <div className="font-mono text-[11px] text-[var(--muted)]">{step.k}</div>
              <div className="mt-3 font-display text-[28px] leading-none">{step.t}</div>
              <p className="mt-3 text-[13px] leading-relaxed text-[var(--muted)]">
                {step.d}
              </p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
