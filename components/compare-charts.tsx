"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { expColor, expLetter } from "@/lib/exp-colors";
import { meanScores } from "@/lib/feedback-display";
import type { Experiment } from "@/lib/types";

function meanMse(ex: Experiment): number {
  const vals = ex.rows.flatMap((r) =>
    r.probes.map((p) => p.mse).filter((m): m is number => m != null),
  );
  if (vals.length === 0) return 0;
  return vals.reduce((a, b) => a + b, 0) / vals.length;
}

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

export function CompareCharts({ experiments }: { experiments: Experiment[] }) {
  const config = expConfig(experiments);
  const scoreKeys = [
    ...new Set(experiments.flatMap((e) => Object.keys(meanScores(e)))),
  ];

  const feedbackData = scoreKeys.map((metric) => {
    const row: Record<string, string | number> = { metric };
    experiments.forEach((ex, i) => {
      row[expLetter(i)] = meanScores(ex)[metric] ?? 0;
    });
    return row;
  });

  const mseData = experiments.map((ex, i) => ({
    name: expLetter(i),
    mse: Number(meanMse(ex).toFixed(3)),
    fill: expColor(i),
  }));

  return (
    <div className="grid gap-3 p-4 md:grid-cols-2">
      <Card
        title="Judge"
        hint="Share of prompts where the LLM judge said yes (1) vs no (0). Compare Llama vs Gemma, or last-user vs first-assistant."
      >
        {scoreKeys.length === 0 ? (
          <p className="py-10 text-center text-[12px] text-[var(--muted)]">
            No judge scores yet
          </p>
        ) : (
          <ChartContainer config={config} className="h-[200px] w-full">
            <BarChart accessibilityLayer data={feedbackData} barGap={4}>
              <CartesianGrid vertical={false} stroke="#d1cfc5" />
              <XAxis
                dataKey="metric"
                tickLine={false}
                axisLine={false}
                tickMargin={8}
                tick={{ fontSize: 11 }}
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
                  maxBarSize={32}
                />
              ))}
            </BarChart>
          </ChartContainer>
        )}
      </Card>

      <Card
        title="Can we read the AV?"
        hint="Mean reconstruction error of the NLA. Near 0 = the verbalization tracks the activation. Around 1 = don't trust that text."
      >
        <ChartContainer
          config={{ mse: { label: "MSE", color: expColor(0) } }}
          className="h-[200px] w-full"
        >
          <BarChart accessibilityLayer data={mseData}>
            <CartesianGrid vertical={false} stroke="#d1cfc5" />
            <XAxis dataKey="name" tickLine={false} axisLine={false} />
            <YAxis tickLine={false} axisLine={false} width={32} />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Bar dataKey="mse" radius={[4, 4, 0, 0]} maxBarSize={40}>
              {mseData.map((d) => (
                <Cell key={d.name} fill={d.fill} />
              ))}
            </Bar>
          </BarChart>
        </ChartContainer>
      </Card>
    </div>
  );
}
