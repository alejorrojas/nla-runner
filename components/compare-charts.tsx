"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { expColor, expLetter } from "@/lib/exp-colors";
import { experimentKpis, exampleSeries } from "@/lib/compare-metrics";
import { meanScores } from "@/lib/feedback-display";
import type { Experiment } from "@/lib/types";

function expConfig(experiments: Experiment[]): ChartConfig {
  return Object.fromEntries(
    experiments.map((ex, i) => [
      expLetter(i),
      { label: `${expLetter(i)} · ${ex.tokenPolicy}`, color: expColor(i) },
    ]),
  ) as ChartConfig;
}

function Card({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-[var(--line)] bg-[var(--card)] p-4">
      <div className="mb-1 text-[13px] font-medium">{title}</div>
      {hint ? (
        <div className="mb-2 text-[11px] leading-snug text-[var(--muted)]">
          {hint}
        </div>
      ) : null}
      {children}
    </div>
  );
}

function fmtPct(n: number | null): string {
  if (n == null) return "—";
  return `${(n * 100).toFixed(0)}%`;
}

function fmtNum(n: number | null, digits = 3): string {
  if (n == null) return "—";
  return n.toFixed(digits);
}

export function CompareCharts({ experiments }: { experiments: Experiment[] }) {
  const config = expConfig(experiments);
  const scoreKeys = [
    ...new Set(experiments.flatMap((e) => Object.keys(meanScores(e)))),
  ];
  const kpis = experiments.map(experimentKpis);
  const primary = kpis[0];

  const rateRows = [
    ...scoreKeys.map((metric) => {
      const row: Record<string, string | number> = { metric };
      experiments.forEach((ex, i) => {
        row[expLetter(i)] = meanScores(ex)[metric] ?? 0;
      });
      return row;
    }),
    {
      metric: "lexical_reddit",
      ...Object.fromEntries(
        experiments.map((_, i) => [expLetter(i), kpis[i].lexicalReddit]),
      ),
    },
    {
      metric: "lexical_forum",
      ...Object.fromEntries(
        experiments.map((_, i) => [expLetter(i), kpis[i].lexicalForum]),
      ),
    },
    {
      metric: "lexical_article",
      ...Object.fromEntries(
        experiments.map((_, i) => [expLetter(i), kpis[i].lexicalArticle]),
      ),
    },
  ];

  const mixData = experiments.flatMap((ex, i) => {
    const k = kpis[i];
    return [
      { name: `${expLetter(i)} true`, n: k.forumTrue, fill: expColor(i) },
      {
        name: `${expLetter(i)} false`,
        n: k.forumFalse,
        fill: i === 0 ? "#c5bfb3" : "#d9d4c8",
      },
    ];
  });

  const series = exampleSeries(experiments);

  return (
    <div className="space-y-3 p-4">
      {primary ? (
        <div className="grid gap-2 sm:grid-cols-3 lg:grid-cols-6">
          <Kpi label="Rows" value={String(primary.n)} hint={`${primary.errors} errors`} />
          <Kpi
            label="LLM forum"
            value={fmtPct(primary.llmHit)}
            hint={`${primary.forumTrue}/${primary.n - primary.errors} true`}
          />
          <Kpi
            label="Lexical Reddit"
            value={fmtPct(primary.lexicalReddit)}
            hint="r/, reddit, subreddit in the AV"
          />
          <Kpi
            label="Lexical article"
            value={fmtPct(primary.lexicalArticle)}
            hint="encyclopedia / howto / news cues"
          />
          <Kpi
            label="Mean MSE"
            value={fmtNum(primary.meanMse)}
            hint={`median ${fmtNum(primary.medianMse)}`}
          />
          <Kpi
            label="Mean AV chars"
            value={primary.meanChars != null ? Math.round(primary.meanChars).toString() : "—"}
            hint="length of the verbalization"
          />
        </div>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-2">
        <Card
          title="Rates"
          hint="LLM judges (0–1) plus cheap lexical checks on the same AVs. Extra judges you attach to a run show up here as more bars."
        >
          <ChartContainer config={config} className="h-[220px] w-full">
            <BarChart accessibilityLayer data={rateRows} barGap={3}>
              <CartesianGrid vertical={false} stroke="#d1cfc5" />
              <XAxis
                dataKey="metric"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 10 }}
                interval={0}
              />
              <YAxis
                domain={[0, 1]}
                tickLine={false}
                axisLine={false}
                width={28}
                tick={{ fontSize: 11 }}
              />
              <ChartTooltip content={<ChartTooltipContent />} />
              {experiments.map((_, i) => (
                <Bar
                  key={expLetter(i)}
                  dataKey={expLetter(i)}
                  fill={expColor(i)}
                  radius={[4, 4, 0, 0]}
                  maxBarSize={28}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </Card>

        <Card
          title="Forum true vs false"
          hint="Counts from the mentions_reddit judge. Compare runs by selecting two experiments."
        >
          <ChartContainer
            config={{ n: { label: "prompts", color: expColor(0) } }}
            className="h-[220px] w-full"
          >
            <BarChart accessibilityLayer data={mixData}>
              <CartesianGrid vertical={false} stroke="#d1cfc5" />
              <XAxis dataKey="name" tickLine={false} axisLine={false} tick={{ fontSize: 11 }} />
              <YAxis allowDecimals={false} tickLine={false} axisLine={false} width={24} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="n" radius={[4, 4, 0, 0]} maxBarSize={40}>
                {mixData.map((d) => (
                  <Cell key={d.name} fill={d.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        </Card>

        <Card
          title="MSE by example"
          hint="Reconstruction error at the probed token. Near 0 = the sentence tracks the activation."
        >
          <ChartContainer
            config={Object.fromEntries(
              experiments.map((_, i) => [
                `mse${expLetter(i)}`,
                { label: `MSE ${expLetter(i)}`, color: expColor(i) },
              ]),
            )}
            className="h-[220px] w-full"
          >
            <BarChart accessibilityLayer data={series} barGap={2}>
              <CartesianGrid vertical={false} stroke="#d1cfc5" />
              <XAxis dataKey="example" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} width={36} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {experiments.map((_, i) => (
                <Bar
                  key={expLetter(i)}
                  dataKey={`mse${expLetter(i)}`}
                  fill={expColor(i)}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </Card>

        <Card
          title="AV length by example"
          hint="Character count of the verbalization. Long, rambling AVs often pair with forum-like framing."
        >
          <ChartContainer
            config={Object.fromEntries(
              experiments.map((_, i) => [
                `chars${expLetter(i)}`,
                { label: `chars ${expLetter(i)}`, color: expColor(i) },
              ]),
            )}
            className="h-[220px] w-full"
          >
            <BarChart accessibilityLayer data={series} barGap={2}>
              <CartesianGrid vertical={false} stroke="#d1cfc5" />
              <XAxis dataKey="example" tickLine={false} axisLine={false} tick={{ fontSize: 10 }} />
              <YAxis tickLine={false} axisLine={false} width={36} tick={{ fontSize: 11 }} />
              <ChartTooltip content={<ChartTooltipContent />} />
              {experiments.map((_, i) => (
                <Bar
                  key={expLetter(i)}
                  dataKey={`chars${expLetter(i)}`}
                  fill={expColor(i)}
                  radius={[3, 3, 0, 0]}
                  maxBarSize={18}
                />
              ))}
            </BarChart>
          </ChartContainer>
        </Card>
      </div>
    </div>
  );
}

function Kpi({
  label,
  value,
  hint,
}: {
  label: string;
  hint: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-[var(--line)] bg-[var(--card)] px-3 py-3">
      <div className="text-[10px] font-semibold uppercase tracking-[0.08em] text-[var(--muted)]">
        {label}
      </div>
      <div className="font-display mt-1 text-[22px] leading-none tracking-tight">{value}</div>
      <div className="mt-1 text-[11px] text-[var(--muted)]">{hint}</div>
    </div>
  );
}
