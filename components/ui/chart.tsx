"use client";

import * as React from "react";
import * as RechartsPrimitive from "recharts";
import { cn } from "@/lib/utils";

const THEMES = { light: "", dark: ".dark" } as const;

export type ChartConfig = Record<
  string,
  {
    label?: React.ReactNode;
    icon?: React.ComponentType;
  } & ({ color?: string; theme?: never } | { color?: never; theme: Record<keyof typeof THEMES, string> })
>;

const ChartContext = React.createContext<{ config: ChartConfig } | null>(null);

function useChart() {
  const context = React.useContext(ChartContext);
  if (!context) {
    throw new Error("useChart must be used within a <ChartContainer />");
  }
  return context;
}

function ChartContainer({
  id,
  className,
  children,
  config,
  ...props
}: React.ComponentProps<"div"> & {
  config: ChartConfig;
  children: React.ComponentProps<
    typeof RechartsPrimitive.ResponsiveContainer
  >["children"];
}) {
  const uniqueId = React.useId();
  const chartId = `chart-${id ?? uniqueId.replace(/:/g, "")}`;

  return (
    <ChartContext.Provider value={{ config }}>
      <div
        data-chart={chartId}
        className={cn(
          "flex justify-center text-xs [&_.recharts-cartesian-axis-tick_text]:fill-[var(--muted)] [&_.recharts-cartesian-grid_line[stroke='#ccc']]:stroke-[var(--line)] [&_.recharts-rectangle.recharts-tooltip-cursor]:fill-[#f3f4f7] [&_.recharts-layer]:outline-none [&_.recharts-surface]:outline-none",
          className,
        )}
        {...props}
      >
        <ChartStyle id={chartId} config={config} />
        <RechartsPrimitive.ResponsiveContainer initialDimension={{ width: 320, height: 200 }}>
          {children}
        </RechartsPrimitive.ResponsiveContainer>
      </div>
    </ChartContext.Provider>
  );
}

function ChartStyle({ id, config }: { id: string; config: ChartConfig }) {
  const colorConfig = Object.entries(config).filter(
    ([, item]) => item.theme ?? item.color,
  );
  if (!colorConfig.length) return null;
  return (
    <style
      dangerouslySetInnerHTML={{
        __html: Object.entries(THEMES)
          .map(
            ([theme, prefix]) => `
${prefix} [data-chart=${id}] {
${colorConfig
  .map(([key, itemConfig]) => {
    const color =
      itemConfig.theme?.[theme as keyof typeof itemConfig.theme] ??
      itemConfig.color;
    return color ? `  --color-${key}: ${color};` : null;
  })
  .join("\n")}
}
`,
          )
          .join("\n"),
      }}
    />
  );
}

const ChartTooltip = RechartsPrimitive.Tooltip;

function ChartTooltipContent({
  active,
  payload,
  className,
  label,
  nameKey,
}: {
  active?: boolean;
  payload?: ReadonlyArray<{
    name?: string;
    dataKey?: string | number;
    value?: number | string;
    color?: string;
    payload?: { fill?: string };
  }>;
  className?: string;
  label?: string;
  nameKey?: string;
}) {
  const { config } = useChart();
  if (!active || !payload?.length) return null;

  return (
    <div
      className={cn(
        "grid min-w-[8rem] gap-1.5 rounded-lg border border-[var(--line)] bg-white px-2.5 py-1.5 text-xs shadow-lg",
        className,
      )}
    >
      {label ? <div className="font-medium text-[var(--ink)]">{label}</div> : null}
      {payload.map((item, index) => {
        const key = `${nameKey ?? item.name ?? item.dataKey ?? "value"}`;
        const cfg = config[key];
        return (
          <div key={index} className="flex items-center justify-between gap-4">
            <span className="flex items-center gap-1.5 text-[var(--muted)]">
              <span
                className="h-2 w-2 rounded-[2px]"
                style={{ background: item.color ?? item.payload?.fill }}
              />
              {cfg?.label ?? item.name}
            </span>
            <span className="font-mono font-medium tabular-nums">
              {typeof item.value === "number"
                ? item.value.toLocaleString(undefined, { maximumFractionDigits: 3 })
                : String(item.value ?? "")}
            </span>
          </div>
        );
      })}
    </div>
  );
}

export { ChartContainer, ChartTooltip, ChartTooltipContent, ChartStyle };
