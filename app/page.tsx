"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { FadeIn } from "@/components/motion";

const FLOW = [
  { k: "01", t: "Prompt", d: "A dataset row. Short enough to read." },
  { k: "02", t: "Token", d: "Last user, first assistant, or both." },
  { k: "03", t: "AV", d: "The NLA sentence on that residual." },
  { k: "04", t: "Judge", d: "LLM scores the AV, not the chat reply." },
];

export default function LandingPage() {
  return (
    <div className="relative overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute -left-24 top-10 h-[420px] w-[420px] rounded-full bg-[radial-gradient(circle,rgba(196,92,38,0.22),transparent_62%)]"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute -right-16 top-40 h-[380px] w-[380px] rounded-full bg-[radial-gradient(circle,rgba(15,110,98,0.18),transparent_64%)]"
      />

      <section className="relative mx-auto grid max-w-6xl items-center gap-10 px-6 py-16 lg:grid-cols-[1.15fr_0.85fr]">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.22em] text-[var(--copper)]">
            Neuronpedia · LLM-as-judge
          </p>
          <h1 className="mt-4 max-w-[14ch] font-display text-[clamp(40px,7vw,76px)] leading-[0.92] tracking-tight text-[var(--ink)]">
            Score the words the model doesn&apos;t say.
          </h1>
          <p className="mt-6 max-w-lg text-[17px] leading-relaxed text-[var(--muted)]">
            NLA Eval is the experiment loop around activation verbalizations.
            Datasets, judges, runs, and compare — one lab, not five orphan
            screens.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/datasets" className="btn btn-primary px-5 py-2.5 text-[14px]">
              Open the lab
            </Link>
            <Link href="/lab" className="btn">
              Five-step walkthrough
            </Link>
          </div>
        </div>

        <FadeIn delay={0.12} className="relative">
          <motion.svg
            viewBox="0 0 420 280"
            className="w-full"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <path
              d="M10 210 C 80 40, 160 250, 220 120 S 340 40, 410 160"
              fill="none"
              stroke="#c45c26"
              strokeWidth="2.2"
              strokeLinecap="round"
            />
            <path
              d="M10 180 C 90 80, 150 200, 230 90 S 330 220, 410 110"
              fill="none"
              stroke="#0f6e62"
              strokeWidth="1.4"
              opacity="0.7"
            />
            {[
              [70, 118],
              [220, 120],
              [340, 78],
            ].map(([x, y], i) => (
              <motion.circle
                key={x}
                cx={x}
                cy={y}
                r="7"
                fill="#1c1914"
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 + i * 0.12, type: "spring" }}
              />
            ))}
          </motion.svg>
          <p className="mt-2 font-mono text-[11px] text-[var(--muted)]">
            Residual stream → NLA sentence → judge score
          </p>
        </FadeIn>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--card)]">
        <div className="mx-auto grid max-w-6xl gap-px bg-[var(--line)] sm:grid-cols-2 lg:grid-cols-4">
          {FLOW.map((step) => (
            <div key={step.k} className="bg-[var(--card)] p-6">
              <div className="font-mono text-[11px] text-[var(--copper)]">{step.k}</div>
              <div className="mt-2 font-display text-[26px]">{step.t}</div>
              <p className="mt-2 text-[13px] text-[var(--muted)]">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-6 py-16">
        <div className="grid gap-8 lg:grid-cols-2">
          <div>
            <h2 className="font-display text-[34px] leading-tight">
              AVs are signals, not beliefs.
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
              The judge reads themes in the verbalization. You still need
              behavior, or another test, before a hypothesis gets loud. The
              product is built so you can run that loop without leaving the
              dataset.
            </p>
          </div>
          <div className="surface rounded-lg p-6">
            <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-[var(--muted)]">
              Same chrome everywhere
            </p>
            <ul className="mt-4 space-y-3 text-[14px] leading-relaxed">
              <li>Live run panel: which prompt, which phase, n of N.</li>
              <li>Datasets, judges, and compare share type, color, and motion.</li>
              <li>Keys stay in the tab. Runs persist on the server.</li>
            </ul>
            <Link href="/datasets" className="mt-6 inline-block text-[13px] text-[var(--copper)]">
              Start from a dataset →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
