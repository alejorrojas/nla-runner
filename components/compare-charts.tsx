"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { expColor, expLetter } from "@/lib/exp-colors";
import { exampleSeries } from "@/lib/compare-metrics";
import { meanScores } from "@/lib/feedback-display";
import type { Experiment } from "@/lib/types";

type Panel = {
  id: string;
  title: string;
  dataKey: string;
  yMax?: number;
};

function panelsFor(experiments: Experiment[]): Panel[] {
  const judgeKeys = [
    ...new Set(experiments.flatMap((e) => Object.keys(meanScores(e)))),
  ];
  const judges: Panel[] = judgeKeys.map((key) => ({
    id: key,
    title: key,
    dataKey: key,
    yMax: 1,
  }));
  return [
    ...judges,
    { id: "lexical_reddit", title: "lexical_reddit", dataKey: "lexical_reddit", yMax: 1 },
    { id: "lexical_forum", title: "lexical_forum", dataKey: "lexical_forum", yMax: 1 },
    { id: "lexical_article", title: "lexical_article", dataKey: "lexical_article", yMax: 1 },
    { id: "mse", title: "MSE", dataKey: "mse" },
    { id: "chars", title: "AV chars", dataKey: "chars" },
  ];
}

export function CompareCharts({
  experiments,
  compact = false,
}: {
  experiments: Experiment[];
  compact?: boolean;
}) {
  const series = exampleSeries(experiments);
  const panels = panelsFor(experiments);
  const chartH = compact ? "h-[140px]" : "h-[160px]";
  const trackPct = Math.max(100, (panels.length / 3) * 100);

  return (
    <div
      className={`chart-strip overflow-x-auto bg-[var(--card)] ${compact ? "" : "border-b border-[var(--line)]"}`}
    >
      <div className="flex" style={{ width: `${trackPct}%` }}>
        {panels.map((panel) => (
          <div
            key={panel.id}
            className="min-w-0 flex-1 border-r border-[var(--line)] px-3 py-3 last:border-r-0"
          >
            <div className="mb-2 flex items-center justify-between gap-2">
              <div className="text-[13px] font-medium">{panel.title}</div>
              {experiments.length > 1 ? (
                <div className="flex flex-wrap gap-2 text-[11px] text-[var(--muted)]">
                  {experiments.map((_, i) => (
                    <span key={expLetter(i)} className="inline-flex items-center gap-1">
                      <span
                        className="h-2 w-2 rounded-full"
                        style={{ background: expColor(i) }}
                      />
                      {expLetter(i)}
                    </span>
                  ))}
                </div>
              ) : null}
            </div>
            <ChartContainer
              config={Object.fromEntries(
                experiments.map((_, i) => [
                  `${panel.dataKey}${expLetter(i)}`,
                  { label: `${panel.title} ${expLetter(i)}`, color: expColor(i) },
                ]),
              )}
              className={`${chartH} w-full`}
            >
              <BarChart accessibilityLayer data={series} barGap={2}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis
                  dataKey="example"
                  tickLine={false}
                  axisLine={false}
                  tick={{ fontSize: 10 }}
                />
                <YAxis
                  tickLine={false}
                  axisLine={false}
                  width={32}
                  tick={{ fontSize: 10 }}
                  domain={panel.yMax != null ? [0, panel.yMax] : undefined}
                />
                <ChartTooltip content={<ChartTooltipContent />} />
                {experiments.map((_, i) => (
                  <Bar
                    key={expLetter(i)}
                    dataKey={`${panel.dataKey}${expLetter(i)}`}
                    fill={expColor(i)}
                    radius={[3, 3, 0, 0]}
                    maxBarSize={18}
                  />
                ))}
              </BarChart>
            </ChartContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
