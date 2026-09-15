"use client";

import Link from "next/link";
import { MotionConfig } from "framer-motion";
import { ExperimentIllustration } from "@/components/experiment-illustration";
import { GradientBackground } from "@/components/gradient-background";
import { Mark } from "@/components/mark";
import { FooterWordmark } from "@/components/footer-wordmark";
import { FadeIn, Reveal, RevealGroup, RevealItem } from "@/components/motion";
import { MotivationIllustration } from "@/components/motivation-illustration";
import { ProductIllustration } from "@/components/product-illustration";
import { TokenPolicyIllustration } from "@/components/token-policy-illustration";
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
    image: "/dataset.png",
    kind: "dataset" as const,
  },
  {
    t: "Token policy",
    d: "Keep the position rule constant so last-user vs first-assistant is an experimental factor, not an afterthought.",
    image: "/tokenpolicy.png",
    kind: "token-policy" as const,
  },
  {
    t: "NLA source",
    d: "Neuronpedia hosts the language model and the NLA. The lab wraps completion and explain into one internal schema.",
    image: "/nlasource.png",
    kind: "nla-source" as const,
  },
  {
    t: "Evaluators",
    d: "Natural-language rubric, judge model, and feedback keys. The same loop can detect a theme, score a criterion, or classify verbalizations.",
    image: "/evaluators.png",
    kind: "evaluators" as const,
  },
  {
    t: "Live runs",
    d: "The orchestrator walks the dataset, records progress per example, and separates API failures from negative judgments.",
    image: "/liveruns.png",
    kind: "live-runs" as const,
  },
  {
    t: "Compare",
    d: "Tables and charts on the same prompts. Inspect a single verbalization without losing the global view of the experiment.",
    image: "/metrics.png",
    kind: "metrics" as const,
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
    <MotionConfig reducedMotion="user">
      <div className="bg-[#faf9f5]">
      <section className="relative isolate flex min-h-screen items-center justify-center overflow-hidden px-6">
        <GradientBackground />
        <div className="absolute inset-0 z-[1] bg-[#141413]/10 md:bg-[#141413]/15" />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 z-[2] h-[min(52vh,28rem)]"
          style={{
            background:
              "linear-gradient(to top, #faf9f5 0%, rgb(250 249 245 / 0.55) 18%, rgb(250 249 245 / 0.22) 40%, rgb(250 249 245 / 0.06) 62%, transparent 86%)",
          }}
        />
        <div className="relative z-10 mx-auto max-w-3xl px-4 py-28 text-center">
          <FadeIn>
            <p className="text-[13px] font-medium tracking-[0.14em] text-white/70 uppercase">
              NLASmith · CONAIISI 2026
            </p>
          </FadeIn>
          <FadeIn delay={0.06}>
            <h1 className="mt-5 font-display text-[clamp(40px,6.4vw,72px)] leading-[0.95] text-white">
              From one activation
              <br />
              to a systematic experiment.
            </h1>
          </FadeIn>
          <FadeIn delay={0.12}>
            <p className="mx-auto mt-6 max-w-2xl text-[16px] leading-relaxed text-white/80">
              Neuronpedia makes Natural Language Activations easy to inspect one at a
              time. NLASmith is the missing loop: datasets, token policies,
              configurable judges, and aggregated metrics — so hypotheses about
              internal representations can be run, reproduced, and compared.
            </p>
          </FadeIn>
          <FadeIn delay={0.18} className="mt-9 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={toAppPath("/lab")}>Open the prototype</Link>
            </Button>
            <Button asChild variant="inverseOutline" size="lg">
              <a href="#pipeline">See the pipeline</a>
            </Button>
          </FadeIn>
        </div>
      </section>

      <section id="motivation" className="-mt-24 px-6 pb-8 md:px-8">
        <div className="relative z-10 mx-auto flex max-w-[1180px] flex-col gap-4">
          <RevealGroup className="grid gap-4 lg:grid-cols-12">
            <RevealItem as="article" className="overflow-hidden rounded-2xl bg-[#c4785a] lg:col-span-7">
              <div className="relative aspect-[3/1] min-h-[180px] w-full">
                <MotivationIllustration
                  kind="gap"
                  src="/thegap.png"
                  alt="A prompt connecting into a cluster of activations"
                  sizes="(min-width: 1024px) 680px, 100vw"
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
            </RevealItem>

            <RevealItem as="article" className="flex min-h-[320px] flex-col rounded-2xl bg-[#f0eee6] p-7 lg:col-span-5">
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
            </RevealItem>
          </RevealGroup>
          <RevealGroup className="grid gap-4 lg:grid-cols-12">
            <RevealItem as="article" className="overflow-hidden rounded-2xl bg-[#e3dacc] lg:col-span-5">
              <div className="relative aspect-[5/3] w-full">
                <MotivationIllustration
                  kind="method"
                  src="/method.png"
                  alt="LangSmith’s loop applied to NLA"
                  sizes="(min-width: 1024px) 480px, 100vw"
                />
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
            </RevealItem>

            <RevealItem as="article" className="flex flex-col rounded-2xl bg-[#f0eee6] p-7 lg:col-span-7">
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
            </RevealItem>
          </RevealGroup>
        </div>
      </section>

      <section id="pipeline" className="bg-[#faf9f5] px-6 py-20 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
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
          </Reveal>
          <RevealGroup className="mt-12 grid gap-4 lg:grid-cols-5">
            {PIPELINE.map((step) => (
              <RevealItem
                as="article"
                key={step.k}
                lift
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
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="product" className="bg-[#faf9f5] px-6 pb-8 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <p className="text-[13px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
              Product
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">
              A working loop for configuration, execution, and comparison.
            </h2>
            <p className="font-editorial mt-5 max-w-2xl text-[22px] leading-snug text-[#3d3d3a]">
              The first version keeps only what turns a manual inspection into a
              reproducible process.
            </p>
          </Reveal>
          <RevealGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {PIECES.map((item) => (
              <RevealItem
                as="article"
                key={item.t}
                lift
                className="overflow-hidden rounded-2xl bg-[#faf9f5] ring-1 ring-[#d1cfc5]"
              >
                <div className="relative h-44">
                  {item.kind === "token-policy" ? (
                    <TokenPolicyIllustration />
                  ) : (
                    <ProductIllustration
                      kind={item.kind}
                      src={item.image}
                      alt={item.t}
                    />
                  )}
                </div>
                <div className="p-6">
                  <h3 className="text-[20px] leading-tight font-medium tracking-tight">
                    {item.t}
                  </h3>
                  <p className="mt-3 text-[14px] leading-relaxed text-[var(--muted)]">
                    {item.d}
                  </p>
                </div>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section id="use-case" className="px-6 py-16 md:px-8">
        <Reveal className="mx-auto grid max-w-[1180px] overflow-hidden rounded-2xl bg-[#FAF8F4] lg:grid-cols-2">
          <div className="relative min-h-[240px] bg-[#FAF8F4] lg:min-h-full">
            <ExperimentIllustration />
          </div>
          <div className="flex flex-col justify-center bg-[#d4a08a] px-10 py-16 text-[#141413]">
            <p className="text-[13px] font-semibold tracking-[0.18em] uppercase">
              An experiment
            </p>
            <h2 className="mt-5 font-display text-[clamp(28px,3.2vw,42px)] leading-[1.08]">
              Forum-like associations that never appear in the reply.
            </h2>
            <p className="mt-6 max-w-md text-[16px] leading-relaxed">
              In some open-ended questions, verbalizations seemed tied to Reddit
              or forum-like discourse even when the generated answer never named
              that source. We ran that hunch as an experiment in the prototype:
              dataset, token position, NLA source, rubric, and aggregated
              metrics.
            </p>
          </div>
        </Reveal>
      </section>

      <section id="limits" className="bg-[#faf9f5] px-6 py-24 md:px-8">
        <div className="mx-auto max-w-[1180px]">
          <Reveal>
            <p className="text-[13px] font-medium tracking-[0.12em] text-[var(--muted)] uppercase">
              How to read the numbers
            </p>
            <h2 className="mt-4 max-w-2xl font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">
              Automatic scores are measurements, not a verdict on the residual.
            </h2>
          </Reveal>
          <RevealGroup className="mt-12 divide-y divide-[#d1cfc5] border-y border-[#d1cfc5]">
            {LIMITS.map((item) => (
              <RevealItem
                key={item.t}
                className="grid gap-4 py-8 md:grid-cols-[0.8fr_1.2fr] md:items-baseline"
              >
                <h3 className="text-[20px] font-medium tracking-tight">{item.t}</h3>
                <p className="text-[16px] leading-relaxed text-[var(--muted)]">
                  {item.d}
                </p>
              </RevealItem>
            ))}
          </RevealGroup>
        </div>
      </section>

      <section className="px-6 pb-24 md:px-8">
        <Reveal className="mx-auto max-w-[1180px] rounded-2xl bg-[#141413] px-8 py-20 text-center text-[#faf9f5] md:px-16">
          <div className="mb-8 flex justify-center">
            <Mark className="h-12 w-12" />
          </div>
          <h2 className="font-display text-[clamp(32px,4vw,48px)] leading-[1.05]">
            Configure once. Run the dataset. Keep the trail.
          </h2>
          <p className="font-editorial mx-auto mt-5 max-w-xl text-[22px] leading-snug text-[#cccccc]">
            Datasets, evaluators, and experiment rows persist. Open the prototype,
            attach a judge, and turn a one-off inspection into a configuration
            you can repeat.
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-center gap-3">
            <Button asChild size="lg">
              <Link href={toAppPath("/lab")}>Open Home</Link>
            </Button>
            <Button asChild variant="inverseOutline" size="lg">
              <Link href={toAppPath("/datasets")}>Datasets & Experiments</Link>
            </Button>
          </div>
        </Reveal>
      </section>

      <footer className="overflow-hidden bg-[#141413] text-[#cccccc]">
        <div className="flex flex-col gap-8 px-4 pt-12 md:flex-row md:items-start md:justify-between md:px-18">
          <p className="max-w-xl text-[14px] leading-relaxed">
            NLASmith is a research prototype from Universidad Tecnológica Nacional,
            Facultad Regional Resistencia. Built on Neuronpedia NLA and the
            Natural Language Autoencoders line of work.
          </p>
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
            <Link href="/contact" className="hover:text-[#faf9f5]">
              Contact
            </Link>
          </div>
        </div>
        <div
          className="@container pointer-events-none w-full select-none px-1 pt-12 pb-10 md:pt-16 md:pb-14"
          aria-hidden
        >
          <div className="flex w-full items-end justify-center gap-[0.8cqw]">
            <Mark className="mb-[0.08em] h-[16.4cqw] w-[16.4cqw] shrink-0" />
            <FooterWordmark />
          </div>
        </div>
      </footer>
      </div>
    </MotionConfig>
  );
}
