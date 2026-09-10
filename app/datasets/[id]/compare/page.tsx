"use client";

import Link from "next/link";
import { useParams, useSearchParams } from "next/navigation";
import { Suspense, useMemo } from "react";
import { CompareCharts } from "@/components/compare-charts";
import { expColor, expLetter } from "@/lib/exp-colors";
import { useStore } from "@/lib/store-client";
import { NLA_SOURCES, type Experiment } from "@/lib/types";

function meanScores(ex: Experiment): Record<string, number> {
  const acc: Record<string, { sum: number; n: number }> = {};
  for (const row of ex.rows) {
    for (const [k, v] of Object.entries(row.scores)) {
      const n =
        typeof v === "boolean" ? (v ? 1 : 0) : typeof v === "number" ? v : NaN;
      if (Number.isNaN(n)) continue;
      acc[k] ??= { sum: 0, n: 0 };
      acc[k].sum += n;
      acc[k].n += 1;
    }
  }
  return Object.fromEntries(
    Object.entries(acc).map(([k, v]) => [k, v.n ? v.sum / v.n : 0]),
  );
}

export default function ComparePage() {
  return (
    <Suspense
      fallback={<p className="p-8 text-[13px] text-[var(--muted)]">Loading…</p>}
    >
      <CompareInner />
    </Suspense>
  );
}

function CompareInner() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const { store } = useStore();
  const ids = (search.get("ids") || "").split(",").filter(Boolean);

  const dataset = store?.datasets.find((d) => d.id === id);
  const experiments = useMemo(
    () =>
      (store?.experiments.filter((e) => ids.includes(e.id)) ?? []).sort(
        (a, b) => ids.indexOf(a.id) - ids.indexOf(b.id),
      ),
    [store, ids],
  );

  if (!store) return <p className="p-8 text-[13px] text-[var(--muted)]">Loading…</p>;
  if (!dataset) return <p className="p-8">Dataset not found.</p>;

  const keys = [
    ...new Set(experiments.flatMap((e) => Object.keys(meanScores(e)))),
  ];
  const exampleIds = [
    ...new Set(experiments.flatMap((e) => e.rows.map((r) => r.exampleId))),
  ];
  const sourceLabel = (ex: Experiment) =>
    NLA_SOURCES.find((s) => s.id === ex.sourceId)?.label ?? ex.name;

  return (
    <div>
      <div className="border-b border-[var(--line)] bg-[var(--card)] px-5 py-2">
        <div className="crumb">
          <Link href="/datasets">Datasets & Experiments</Link>
          <span> / </span>
          <Link href={`/datasets/${dataset.id}`}>{dataset.name}</Link>
          <span> / </span>
          <span className="text-[var(--ink)]">Comparing {experiments.length} Experiments</span>
        </div>
      </div>

      <div className="flex flex-wrap items-center gap-2 border-b border-[var(--line)] bg-[var(--card)] px-5 py-3">
        <h1 className="text-[18px] font-semibold tracking-tight">Comparing</h1>
        {experiments.map((ex, i) => (
          <span key={ex.id} className="pill">
            <span className="letter" style={{ background: expColor(i) }}>
              {expLetter(i)}
            </span>
            <span className="max-w-[220px] truncate font-mono text-[11px]">
              {sourceLabel(ex)} · {ex.tokenPolicy}
            </span>
          </span>
        ))}
      </div>

      <CompareCharts experiments={experiments} />

      <div className="overflow-x-auto border-t border-[var(--line)] bg-[var(--card)]">
        <table className="w-full min-w-[980px] text-left text-[12px]">
          <thead>
            <tr className="border-b border-[var(--line)] text-[13px] font-medium text-[var(--ink)]">
              <th className="w-8 px-3 py-2 font-medium text-[var(--muted)]">#</th>
              <th className="px-3 py-2 font-medium">Inputs</th>
              {experiments.map((ex, i) => (
                <th key={ex.id} className="px-3 py-2 font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    NLAs
                    <span className="letter" style={{ background: expColor(i) }}>
                      {expLetter(i)}
                    </span>
                  </span>
                </th>
              ))}
              {keys.map((k) => (
                <th key={k} className="px-3 py-2 font-medium">
                  {k}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {exampleIds.map((eid, rowIndex) => {
              const prompt =
                experiments
                  .flatMap((e) => e.rows)
                  .find((r) => r.exampleId === eid)?.prompt ?? "";
              return (
                <tr
                  key={eid}
                  className="border-t border-[var(--line)] align-top"
                >
                  <td className="px-3 py-3 text-[var(--muted)]">{rowIndex + 1}</td>
                  <td className="max-w-[260px] px-3 py-3">
                    <pre className="whitespace-pre-wrap font-mono text-[11px] leading-relaxed text-[#0f7b3a]">
                      {JSON.stringify({ prompt }, null, 2)}
                    </pre>
                  </td>
                  {experiments.map((ex) => {
                    const row = ex.rows.find((r) => r.exampleId === eid);
                    return (
                      <td key={ex.id} className="max-w-[320px] px-3 py-3">
                        {row?.error ? (
                          <span className="text-[var(--warn)]">{row.error}</span>
                        ) : (
                          <div className="space-y-3">
                            {row?.probes.map((p) => (
                              <div key={`${p.label}-${p.position}`}>
                                <div className="text-[10px] text-[var(--muted)]">
                                  {p.label} · {JSON.stringify(p.token)} · mse{" "}
                                  {p.mse?.toFixed(2) ?? "—"}
                                </div>
                                <div className="mt-1 max-h-36 overflow-auto whitespace-pre-wrap text-[12px] leading-relaxed text-[#374151]">
                                  {p.description || "(empty AV)"}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </td>
                    );
                  })}
                  {keys.map((k) => {
                    const vals = experiments.map((ex) => {
                      const row = ex.rows.find((r) => r.exampleId === eid);
                      return row?.scores[k];
                    });
                    const nums = vals.map((v) =>
                      typeof v === "boolean" ? (v ? 1 : 0) : typeof v === "number" ? v : null,
                    );
                    const max = Math.max(
                      ...nums.filter((n): n is number => n != null),
                      -Infinity,
                    );
                    return (
                      <td key={k} className="px-0 py-0">
                        <div className="flex min-h-full">
                          {experiments.map((ex, i) => {
                            const row = ex.rows.find((r) => r.exampleId === eid);
                            const v = row?.scores[k];
                            const n =
                              typeof v === "boolean"
                                ? v
                                  ? 1
                                  : 0
                                : typeof v === "number"
                                  ? v
                                  : null;
                            const tint =
                              n != null && nums.filter((x) => x != null).length > 1
                                ? n === max
                                  ? "bg-[var(--score-up)]"
                                  : "bg-[var(--score-down)]"
                                : "";
                            return (
                              <div
                                key={ex.id}
                                className={`flex-1 px-3 py-3 font-mono text-[12px] ${tint}`}
                                style={{ color: expColor(i) }}
                              >
                                <div className="text-[10px] text-[var(--muted)]">
                                  {expLetter(i)}
                                </div>
                                {v === undefined ? "—" : String(v)}
                              </div>
                            );
                          })}
                        </div>
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
