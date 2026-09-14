"use client";

import Link from "next/link";
import { GradientBackground } from "@/components/gradient-background";
import { LineArt } from "@/components/line-art";
import { Mark } from "@/components/mark";
import { Button } from "@/components/ui/button";
import { toAppPath } from "@/lib/urls";

const PIPELINE = [
  {
    k: "01",
    t: "Dataset",
    object: "Prompt list",
    details: "Comparison unit",
    d: "A fixed list of prompts is the unit of comparison. Two experiments on the same set can be contrasted per example and as aggregates.",
  },
  {
    k: "02",
    t: "Token policy",
    object: "Probe position",
    details: "Held constant",
    d: "The observed position is part of the definition — last user token, first assistant token, or both — not something decided after reading each reply.",
  },
  {
    k: "03",
    t: "NLA",
    object: "Neuronpedia",
    details: "Verbalization",
    d: "Neuronpedia runs the completion and returns the verbalization at those positions. NLASmith does not train or host the autoencoder.",
  },
  {
    k: "04",
    t: "Evaluator",
    object: "LLM judge",
    details: "Rubric + schema",
    d: "A rubric, a judge model, and an output schema: boolean, score, or category, with optional reasoning. The judge is a measuring instrument, not ground truth.",
  },
  {
    k: "05",
    t: "Aggregate",
    object: "Metrics",
    details: "Inspectable trail",
    d: "Per-example artifacts stay inspectable. Presence rate, mean score, and category mix let you see patterns instead of isolated screenshots.",
  },
];

const PIECES = [
  {
    t: "Datasets",
    d: "Create a prompt list, identify each example, and optionally attach a reference. The dataset is what makes two runs comparable.",
    art: "scribble" as const,
    tone: "bg-[#e8d9c4]",
    onWarm: false,
  },
  {
    t: "Token policy",
    d: "Keep the position rule constant so last-user vs first-assistant is an experimental factor, not an afterthought.",
    art: "path" as const,
    tone: "bg-[#cfc8b8]",
    onWarm: false,
  },
  {
    t: "NLA source",
    d: "Neuronpedia hosts the language model and the NLA. The lab wraps completion and explain into one internal schema.",
    art: "nodes" as const,
    tone: "bg-[#c4785a]",
    onWarm: true,
  },
  {
    t: "Evaluators",
    d: "Natural-language rubric, judge model, and feedback keys. The same loop can detect a theme, score a criterion, or classify verbalizations.",
    art: "hands" as const,
    tone: "bg-[#e3dacc]",
    onWarm: false,
  },
  {
    t: "Live runs",
    d: "The orchestrator walks the dataset, records progress per example, and separates API failures from negative judgments.",
    art: "globe" as const,
    tone: "bg-[#d4a08a]",
    onWarm: true,
  },
  {
    t: "Compare",
    d: "Tables and charts on the same prompts. Inspect a single verbalization without losing the global view of the experiment.",
    art: "puzzle" as const,
    tone: "bg-[#f0eee6]",
    onWarm: false,
  },
];

const LIMITS = [
  {
    t: "NLA is a measurement",
    d: "An NLA can simplify or invent detail. Fraser-Taliente et al. already warn against treating the sentence as a faithful dump of the activation.",
  },
  {
    t: "The judge is an instrument",
    d: "An LLM-as-a-judge moves with the rubric, the judge model, and what you put in context. Those choices are stored with the run so the measurement can be audited.",
  },
  {
    t: "Coverage has edges",
    d: "Comparing models may mix layers or autoencoders that are not strictly equivalent. Cost grows with prompts, positions, and evaluators.",
  },
];

export default function LandingPage() {
  return (
    <div className="bg-[#faf9f5]">
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6">
        <GradientBackground />
        <div className="absolute inset-0 z-[1] bg-[#141413]/15" />
        <div className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-44 bg-gradient-to-t from-[#faf9f5] to-transparent" />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-28 text-center">
          <p className="text-[13px] font-medium tracking-[0.14em] text-white/70 uppercase">
            NLASmith · CONAIISI 2026
          </p>
          <h1 className="mt-5 font-display text-[clamp(40px,6.4vw,72px)] leading-[0.95] text-white">
            From one activation
            <br />
            to a systematic experiment.
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-white/80">
            Neuronpedia makes Natural Language Activations easy to inspect one at a
            time. NLASmith is the missing loop: datasets, token policies,
            configurable judges, and aggregated metrics — so hypotheses about
            internal representations can be run, reproduced, and compared.
          </p>
          <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 bg-[#faf9f5] px-6 text-[#141413] hover:bg-white"
            >
              <Link href={toAppPath("/lab")}>Open the prototype</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 border-white/40 bg-transparent px-6 text-white hover:bg-white/10 hover:text-white"
            >
              <a href="#pipeline">See the pipeline</a>
            </Button>
          </div>
        </div>
      </section>

      <section id="motivation" className="-mt-16 px-6 pb-8 md:px-8">
        <div className="relative z-10 mx-auto max-w-[1180px]">
          <div className="grid gap-4 lg:grid-cols-12">
            <article className="overflow-hidden rounded-2xl bg-[#c4785a] lg:col-span-7">
              <div className="flex min-h-[220px] items-center justify-center px-8 pt-8">
                <LineArt
                  kind="constellation"
                  onWarm
                  className="h-48 w-full max-w-[420px]"
                />
              </div>
              <div className="bg-[#faf9f5] p-7">
                <p className="text-[12px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
                  The gap · 01
                </p>
                <h2 className="mt-2 font-display text-[clamp(26px,3vw,36px)] leading-[1.08]">
                  Exploring one verbalization is not the same as running an experiment.
                </h2>
                <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
                  Natural Language Autoencoders turn a hidden activation into a
                  sentence and can reconstruct the activation from that text. Those
                  verbalizations are interpretable — they are not a literal or
                  infallible readout of the model’s state.
                </p>
              </div>
            </article>

            <article className="flex min-h-[320px] flex-col rounded-2xl bg-[#f0eee6] p-7 lg:col-span-5">
              <p className="text-[12px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
                02
              </p>
              <h3 className="mt-5 text-[22px] leading-tight font-medium tracking-tight">
                The pieces exist. The loop does not.
              </h3>
              <p className="mt-4 text-[15px] leading-relaxed text-[var(--muted)]">
                Neuronpedia already exposes NLA through a web UI and an API.
                Coordinating that across many examples — and keeping the decisions
                that produced each result — is still left to ad-hoc scripts.
              </p>
              <p className="font-editorial mt-auto pt-8 text-[20px] leading-snug text-[#3d3d3a]">
                The artifact under test is not only the visible reply. It is the NLA
                at positions fixed before the run begins.
              </p>
            </article>

            <article className="overflow-hidden rounded-2xl bg-[#e3dacc] lg:col-span-5">
              <div className="flex h-44 items-center justify-center">
                <LineArt kind="scribble" className="h-full w-full max-w-[280px]" />
              </div>
              <div className="bg-[#faf9f5] p-7">
                <p className="text-[12px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
                  03 · Method
                </p>
                <h3 className="mt-2 text-[22px] leading-tight font-medium tracking-tight">
                  LangSmith’s shape, a different object
                </h3>
                <p className="mt-3 text-[15px] leading-relaxed text-[var(--muted)]">
                  Datasets, repeated runs, automatic evaluators, comparative views.
                  NLASmith applies that methodological shape to the NLA at positions
                  fixed by the experiment — not only the visible reply.
                </p>
              </div>
            </article>

            <article className="flex flex-col rounded-2xl bg-[#f0eee6] p-7 lg:col-span-7">
              <p className="text-[12px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
                04 · Scope
              </p>
              <h3 className="mt-5 text-[22px] leading-tight font-medium tracking-tight">
                Infrastructure, not a new method
              </h3>
              <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-[var(--muted)]">
                This is not a new interpretability method and it does not train a
                new autoencoder. It is so the same flow can test different
                hypotheses without being locked to one phenomenon or domain.
              </p>
              <dl className="mt-auto grid gap-0 divide-y border-t border-[#d1cfc5] pt-6 text-[13px] sm:grid-cols-3 sm:divide-x sm:divide-y-0">
                <div className="flex justify-between gap-3 py-3 sm:flex-col sm:px-0 sm:pr-5">
                  <dt className="tracking-[0.12em] text-[var(--muted)] uppercase">
                    Object
                  </dt>
                  <dd>NLA at a token</dd>
                </div>
                <div className="flex justify-between gap-3 py-3 sm:flex-col sm:px-5">
                  <dt className="tracking-[0.12em] text-[var(--muted)] uppercase">
                    Host
                  </dt>
                  <dd>Neuronpedia</dd>
                </div>
                <div className="flex justify-between gap-3 py-3 sm:flex-col sm:pl-5">
                  <dt className="tracking-[0.12em] text-[var(--muted)] uppercase">
                    Loop
                  </dt>
                  <dd className="underline decoration-[#cfcbbd] underline-offset-4">
                    Dataset → judge
                  </dd>
                </div>
              </dl>
            </article>
          </div>
        </div>
      </section>

      <section id="pipeline" className="bg-[#faf9f5] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[13px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
            Conceptual pipeline
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">
            Dataset, token policy, NLA, evaluator, results.
          </h2>
          <p className="font-editorial mt-5 max-w-2xl text-[22px] leading-snug text-[#3d3d3a]">
            Each dataset example runs under a fixed configuration. Selected
            positions go to the NLA service. Verbalizations are scored with
            criteria defined up front.
          </p>
          <div className="mt-12 grid gap-4 lg:grid-cols-5">
            {PIPELINE.map((step) => (
              <article
                key={step.k}
                className="flex flex-col rounded-2xl bg-[#f0eee6] p-6"
              >
                <h3 className="text-[22px] leading-tight font-medium tracking-tight">
                  {step.t}
                </h3>
                <p className="mt-4 flex-1 text-[14px] leading-relaxed text-[var(--muted)]">
                  {step.d}
                </p>
                <dl className="mt-8 divide-y border-t border-[#d1cfc5] text-[13px]">
                  <div className="flex justify-between gap-3 py-3">
                    <dt className="tracking-[0.12em] text-[var(--muted)] uppercase">
                      Step
                    </dt>
                    <dd>{step.k}</dd>
                  </div>
                  <div className="flex justify-between gap-3 py-3">
                    <dt className="tracking-[0.12em] text-[var(--muted)] uppercase">
                      Object
                    </dt>
                    <dd>{step.object}</dd>
                  </div>
                  <div className="flex justify-between gap-3 py-3">
                    <dt className="tracking-[0.12em] text-[var(--muted)] uppercase">
                      Details
                    </dt>
                    <dd className="underline decoration-[#cfcbbd] underline-offset-4">
                      {step.details}
                    </dd>
                  </div>
                </dl>
                <Button asChild className="mt-5 h-10 w-fit px-5">
                  <Link href={toAppPath("/lab")}>
                    Open prototype
                    <span aria-hidden>→</span>
                  </Link>
                </Button>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="product" className="bg-[#faf9f5] px-6 pb-8 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[13px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
            Prototype
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">
            A working loop for configuration, execution, and comparison.
          </h2>
          <p className="font-editorial mt-5 max-w-2xl text-[22px] leading-snug text-[#3d3d3a]">
            The first version keeps only what turns a manual inspection into a
            reproducible process.
          </p>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIECES.map((item) => (
              <article
                key={item.t}
                className="overflow-hidden rounded-2xl bg-[#faf9f5] ring-1 ring-[#d1cfc5]"
              >
                <div className={`flex h-44 items-center justify-center ${item.tone}`}>
                  <LineArt
                    kind={item.art}
                    onWarm={item.onWarm}
                    className="h-full w-full max-w-[240px]"
                  />
                </div>
                <div className="p-6">
                  <p className="text-[12px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
                    Product
                  </p>
                  <h3 className="mt-2 text-[20px] leading-tight font-medium tracking-tight">
                    {item.t}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
                    {item.d}
                  </p>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section id="use-case" className="px-6 py-16 md:px-8">
        <div className="mx-auto grid max-w-[1180px] overflow-hidden rounded-2xl lg:grid-cols-2">
          <div className="flex min-h-[360px] items-center justify-center bg-[#f0eee6] p-10">
            <LineArt kind="constellation" className="h-64 w-full max-w-[420px]" />
          </div>
          <div className="flex flex-col justify-center bg-[#d4a08a] px-10 py-16 text-[#141413]">
            <div className="flex items-center gap-3">
              <Mark className="h-9 w-9" />
              <p className="text-[13px] font-medium tracking-[0.18em] uppercase">
                NLASMITH
              </p>
            </div>
            <h2 className="mt-5 font-display text-[clamp(28px,3.2vw,42px)] leading-[1.08]">
              Forum-like associations that never appear in the reply.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed">
              In some open-ended questions, verbalizations seemed tied to Reddit
              or forum-like discourse even when the generated answer never named
              that source. A qualitative hunch becomes a measurable setup:
              dataset, token position, NLA source, rubric, and aggregated
              metrics.
            </p>
          </div>
        </div>
      </section>

      <section id="limits" className="bg-[#faf9f5] px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <p className="text-[13px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
            How to read the numbers
          </p>
          <h2 className="mt-4 max-w-2xl font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">
            Automatic scores are measurements, not a verdict on the residual.
          </h2>
          <div className="mt-12 divide-y divide-[#d1cfc5] border-y border-[#d1cfc5]">
            {LIMITS.map((item) => (
              <div
                key={item.t}
                className="grid gap-4 py-8 md:grid-cols-[0.8fr_1.2fr] md:items-baseline"
              >
                <h3 className="text-[20px] font-medium tracking-tight">{item.t}</h3>
                <p className="text-[16px] leading-relaxed text-[var(--muted)]">
                  {item.d}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-8">
        <div className="mx-auto max-w-[1180px] rounded-2xl bg-[#141413] px-8 py-20 text-center text-[#faf9f5] md:px-16">
          <div className="mb-8 flex justify-center">
            <Mark className="h-12 w-12" />
          </div>
          <h2 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">
            Configure once. Run the dataset. Keep the trail.
          </h2>
          <p className="font-editorial mx-auto mt-5 max-w-xl text-[22px] leading-snug text-[#cccccc]">
            Keys stay in this tab. Datasets, evaluators, and experiment rows
            persist. Open the prototype, attach a judge, and turn a one-off
            inspection into a configuration you can repeat.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button
              asChild
              size="lg"
              className="h-11 bg-[#faf9f5] px-6 text-[#141413] hover:bg-white"
            >
              <Link href={toAppPath("/lab")}>Open Home</Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-11 border-white/25 bg-transparent px-6 text-[#faf9f5] hover:bg-white/10 hover:text-white"
            >
              <Link href={toAppPath("/datasets")}>Datasets & Experiments</Link>
            </Button>
          </div>
        </div>
      </section>

      <footer className="bg-[#141413] text-[#cccccc]">
        <div className="mx-auto flex max-w-[1180px] flex-col gap-8 px-6 py-12 md:flex-row md:items-start md:justify-between md:px-8">
          <div className="flex max-w-xl items-start gap-3">
            <Mark className="mt-0.5 h-8 w-8 shrink-0" />
            <p className="text-[14px] leading-relaxed">
              NLASmith is a research prototype from Universidad Tecnológica Nacional,
              Facultad Regional Resistencia. Built on Neuronpedia NLA and the
              Natural Language Autoencoders line of work.
            </p>
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-2 text-[13px]">
            <a href="#motivation" className="hover:text-[#faf9f5]">
              Why
            </a>
            <a href="#pipeline" className="hover:text-[#faf9f5]">
              Pipeline
            </a>
            <Link href={toAppPath("/lab")} className="hover:text-[#faf9f5]">
              Home
            </Link>
            <Link href={toAppPath("/datasets")} className="hover:text-[#faf9f5]">
              Datasets
            </Link>
          </div>
        </div>
      </footer>
    </div>
  );
}
