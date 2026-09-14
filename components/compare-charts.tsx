"use client";

import { Bar, BarChart, CartesianGrid, Cell, XAxis, YAxis } from "recharts";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { expColor, expLetter } from "@/lib/exp-colors";
import { aggregateSeries } from "@/lib/compare-metrics";
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
  const series = aggregateSeries(experiments);
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
            <div className="mb-2 text-[13px] font-medium">{panel.title}</div>
            <ChartContainer
              config={{
                [panel.dataKey]: {
                  label: panel.title,
                  color: expColor(0),
                },
              }}
              className={`${chartH} w-full`}
            >
              <BarChart accessibilityLayer data={series} barGap={4}>
                <CartesianGrid vertical={false} stroke="var(--line)" />
                <XAxis
                  dataKey="run"
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
                <Bar dataKey={panel.dataKey} radius={[3, 3, 0, 0]} maxBarSize={28}>
                  {experiments.map((_, i) => (
                    <Cell key={expLetter(i)} fill={expColor(i)} />
                  ))}
                </Bar>
              </BarChart>
            </ChartContainer>
          </div>
        ))}
      </div>
    </div>
  );
}
