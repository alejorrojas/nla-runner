"use client";

import Link from "next/link";
import { GradientBackground } from "@/components/gradient-background";
import { Button } from "@/components/ui/button";

const PIPELINE = [
  {
    k: "01",
    t: "Dataset",
    d: "A fixed list of prompts is the unit of comparison. Two experiments on the same set can be contrasted per example and as aggregates.",
  },
  {
    k: "02",
    t: "Token policy",
    d: "The observed position is part of the definition — last user token, first assistant token, or both — not something decided after reading each reply.",
  },
  {
    k: "03",
    t: "NLA",
    d: "Neuronpedia runs the completion and returns the verbalization at those positions. NLASmith does not train or host the autoencoder.",
  },
  {
    k: "04",
    t: "Evaluator",
    d: "A rubric, a judge model, and an output schema: boolean, score, or category, with optional reasoning. The judge is a measuring instrument, not ground truth.",
  },
  {
    k: "05",
    t: "Aggregate",
    d: "Per-example artifacts stay inspectable. Presence rate, mean score, and category mix let you see patterns instead of isolated screenshots.",
  },
];

const PIECES = [
  {
    t: "Datasets",
    d: "Create a prompt list, identify each example, and optionally attach a reference. The dataset is what makes two runs comparable.",
  },
  {
    t: "Token policy",
    d: "Keep the position rule constant so last-user vs first-assistant is an experimental factor, not an afterthought.",
  },
  {
    t: "NLA source",
    d: "Neuronpedia hosts the language model and the NLA. The lab wraps completion and explain into one internal schema.",
  },
  {
    t: "Evaluators",
    d: "Natural-language rubric, judge model, and feedback keys. The same loop can detect a theme, score a criterion, or classify verbalizations.",
  },
  {
    t: "Live runs",
    d: "The orchestrator walks the dataset, records progress per example, and separates API failures from negative judgments.",
  },
  {
    t: "Compare",
    d: "Tables and charts on the same prompts. Inspect a single verbalization without losing the global view of the experiment.",
  },
];

export default function LandingPage() {
  return (
    <div>
          <p className="text-[13px] font-medium tracking-[0.14em] text-white/70 uppercase">
            NLASmith · CONAIISI 2026
          </p>
          <h1 className="mt-5 font-display text-[clamp(40px,6.4vw,72px)] leading-[0.95] text-white">
            From one activation
            <br />
            to a systematic experiment.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-white/75">
            Neuronpedia makes Natural Language Activations easy to inspect one at a
            time. NLASmith is the missing loop: datasets, token policies,
            configurable judges, and aggregated metrics — so hypotheses about
            internal representations can be run, reproduced, and compared.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-10 px-6">
              <Link href="/lab">Open the prototype</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-10 border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#pipeline">See the pipeline</a>
            </Button>
          </div>
        </div>
      </section>

      <section
        id="motivation"
        className="border-t border-[var(--line)] bg-white"
      >
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-8">
          <p className="text-[13px] font-medium text-[var(--muted)]">
            The gap
          </p>
          <h2 className="mt-2 max-w-3xl font-display text-[32px] leading-tight">
            Exploring one verbalization is not the same as running an experiment.
          </h2>
          <div className="mt-8 grid gap-8 text-[15px] leading-relaxed text-[var(--muted)] md:grid-cols-2">
            <p>
              Natural Language Autoencoders turn a hidden activation into a
              sentence and can reconstruct the activation from that text. Those
              verbalizations are interpretable — they are not a literal or
              infallible readout of the model&apos;s state.
            </p>
            <p>
              Neuronpedia already exposes NLA through a web UI and an API. The
              pieces exist: pick a prompt, choose a position, fetch a
              verbalization. Coordinating that across many examples — and keeping
              the decisions that produced each result — is still left to ad-hoc
              scripts.
            </p>
            <p>
              LangSmith showed how LLM applications get evaluated: datasets,
              repeated runs, automatic evaluators, comparative views. NLASmith
              applies that methodological shape to a different object. The
              artifact under test is not only the visible reply. It is the NLA
              at positions fixed by the experiment.
            </p>
            <p>
              This is not a new interpretability method and it does not train a
              new autoencoder. It is infrastructure so the same flow can test
              different hypotheses without being locked to one phenomenon or
              domain.
            </p>
          </div>
        </div>
      </section>

      <section
        id="pipeline"
        className="border-t border-[var(--line)] bg-[var(--bg)]"
      >
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-8">
          <p className="text-[13px] font-medium text-[var(--muted)]">
            Conceptual pipeline
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-[32px] leading-tight">
            Dataset, token policy, NLA, evaluator, results.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            Each dataset example runs under a fixed configuration. Selected
            positions go to the NLA service. Verbalizations are scored with
            criteria defined up front. Individual outcomes are stored so they
            can be aggregated and compared.
          </p>
        </div>
        <div className="mx-auto grid max-w-[1180px] sm:grid-cols-2 lg:grid-cols-5">
          {PIPELINE.map((step) => (
            <div
              key={step.k}
              className="border-t border-[var(--line)] p-6 sm:border-r lg:last:border-r-0"
            >
              <div className="text-[13px] font-medium text-[var(--accent)]">
                {step.k}
              </div>
              <div className="mt-3 text-[18px] font-medium">{step.t}</div>
              <p className="hint mt-3">{step.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="product" className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-8">
          <p className="text-[13px] font-medium text-[var(--muted)]">
            Prototype
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-[32px] leading-tight">
            A working loop for configuration, execution, and comparison.
          </h2>
          <p className="mt-3 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
            The first version keeps only what turns a manual inspection into a
            reproducible process: define the experiment before it starts, walk
            the dataset, persist artifacts, and look at both the case and the
            aggregate.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIECES.map((item) => (
              <div
                key={item.t}
                className="rounded-xl border border-[var(--line)] p-5"
              >
                <h3 className="text-[15px] font-medium">{item.t}</h3>
                <p className="hint mt-2">{item.d}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section
        id="use-case"
        className="border-t border-[var(--line)] bg-[var(--bg)]"
      >
        <div className="mx-auto grid max-w-[1180px] gap-10 px-6 py-16 md:grid-cols-[0.9fr_1.1fr] md:px-8">
          <div>
            <p className="text-[13px] font-medium text-[var(--muted)]">
              Example hypothesis
            </p>
            <h2 className="mt-2 font-display text-[32px] leading-tight">
              Forum-like associations that never appear in the reply.
            </h2>
          </div>
          <div className="space-y-4 text-[15px] leading-relaxed text-[var(--muted)]">
            <p>
              In some open-ended questions, verbalizations seemed tied to Reddit
              or forum-like discourse even when the generated answer never named
              that source. That is a useful first case: a qualitative hunch
              becomes a measurable setup.
            </p>
            <p>
              The point is not to claim Reddit caused the model, or that an NLA
              literally describes its internals. It is to show that a research
              question can be written as a dataset, a token position, an NLA
              source, a rubric, and aggregated metrics.
            </p>
          </div>
        </div>
      </section>

      <section
        id="limits"
        className="border-t border-[var(--line)] bg-white"
      >
        <div className="mx-auto max-w-[1180px] px-6 py-16 md:px-8">
          <p className="text-[13px] font-medium text-[var(--muted)]">
            How to read the numbers
          </p>
          <h2 className="mt-2 max-w-2xl font-display text-[32px] leading-tight">
            Automatic scores are measurements, not a verdict on the residual.
          </h2>
          <div className="mt-8 grid gap-8 text-[15px] leading-relaxed text-[var(--muted)] md:grid-cols-3">
            <p>
              An NLA can simplify or invent detail. Fraser-Taliente et al.
              already warn against treating the sentence as a faithful dump of
              the activation.
            </p>
            <p>
              An LLM-as-a-judge moves with the rubric, the judge model, and what
              you put in context. Those choices are stored with the run so the
              measurement can be audited.
            </p>
            <p>
              Coverage depends on which NLAs and APIs exist. Comparing models
              may mix layers or autoencoders that are not strictly equivalent.
              Cost grows with prompts, positions, and evaluators.
            </p>
          </div>
        </div>
      </section>

      <section className="border-t border-[var(--line)] bg-[var(--bg)]">
        <div className="mx-auto max-w-[1180px] px-6 py-20 text-center md:px-8">
          <h2 className="font-display text-[32px] leading-tight">
            Configure once. Run the dataset. Keep the trail.
          </h2>
          <p className="mx-auto mt-3 max-w-xl text-[15px] leading-relaxed text-[var(--muted)]">
            Keys stay in this tab. Datasets, evaluators, and experiment rows
            persist. Open the prototype, attach a judge, and turn a one-off
            inspection into a configuration you can repeat.
          </p>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg" className="h-10 px-6">
              <Link href="/lab">Open Home</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-10 px-6">
              <Link href="/datasets">Datasets & Experiments</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="border-t border-[var(--line)] bg-white">
        <div className="mx-auto max-w-[1180px] px-6 py-8 text-[13px] leading-relaxed text-[var(--muted)] md:px-8">
          <p>
            NLASmith is a research prototype from Universidad Tecnológica Nacional,
            Facultad Regional Resistencia. Built on Neuronpedia NLA and the
            Natural Language Autoencoders line of work.
          </p>
        </div>
      </footer>
    </div>
  );
}
