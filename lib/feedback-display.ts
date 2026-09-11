import type { Experiment, ExperimentRow, FeedbackField, FeedbackKind } from "./types";

export function inferKind(value: unknown): FeedbackKind {
  if (typeof value === "boolean") return "boolean";
  if (typeof value === "number") return "continuous";
  return "categorical";
}

export function numericScore(value: unknown): number | null {
  if (typeof value === "boolean") return value ? 1 : 0;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  return null;
}

export function meanScores(ex: Experiment): Record<string, number> {
  const acc: Record<string, { sum: number; n: number }> = {};
  for (const row of ex.rows) {
    for (const [k, v] of Object.entries(row.scores)) {
      const n = numericScore(v);
      if (n == null) continue;
      acc[k] ??= { sum: 0, n: 0 };
      acc[k].sum += n;
      acc[k].n += 1;
    }
  }
  return Object.fromEntries(
    Object.entries(acc).map(([k, v]) => [k, v.n ? v.sum / v.n : 0]),
  );
}

export function formatScore(value: unknown, kind: FeedbackKind): string {
  switch (kind) {
    case "boolean": {
      const n = numericScore(value);
      if (n == null) return "—";
      return n.toFixed(2);
    }
    case "continuous": {
      const n = numericScore(value);
      if (n == null) return "—";
      return n.toFixed(2);
    }
    case "categorical":
      return value == null || value === "" ? "—" : String(value);
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function scoreCellStyle(
  field: FeedbackField | undefined,
  value: unknown,
): { background: string; color: string } {
  if (value === undefined || value === null || value === "") {
    return { background: "transparent", color: "#6b7280" };
  }
  const kind = field?.kind ?? inferKind(value);
  switch (kind) {
    case "boolean": {
      const ok = numericScore(value) === 1;
      return ok
        ? { background: "#111111", color: "#fafafa" }
        : { background: "#f4f4f5", color: "#71717a" };
    }
    case "continuous": {
      const n = numericScore(value);
      if (n == null) return { background: "transparent", color: "#6b7280" };
      const min = field?.min ?? 0;
      const max = field?.max ?? 1;
      const t = Math.min(1, Math.max(0, (n - min) / (max - min || 1)));
      const background = `color-mix(in srgb, #f4f4f5 ${Math.round((1 - t) * 100)}%, #d4d4d8 ${Math.round(t * 100)}%)`;
      const color = t >= 0.5 ? "#0a0a0a" : "#71717a";
      return { background, color };
    }
    case "categorical":
      return { background: "#f4f4f5", color: "#0a0a0a" };
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

export function rowOutput(row: ExperimentRow): string {
  if (row.error) return row.error;
  const avs = row.probes
    .map((p) => p.description.trim())
    .filter(Boolean);
  if (avs.length) return avs.join("\n\n");
  return row.completion || "—";
}
