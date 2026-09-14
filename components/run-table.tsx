"use client";

import type { Dataset, Evaluator, Experiment } from "@/lib/types";
import {
  formatScore,
  inferKind,
  meanScores,
  rowOutput,
  scoreCellStyle,
} from "@/lib/feedback-display";
import { expColor, expLetter } from "@/lib/exp-colors";

export function RunTable({
  dataset,
  experiments,
  evaluators,
}: {
  dataset: Dataset;
  experiments: Experiment[];
  evaluators: Evaluator[];
}) {
  const fields = evaluators.flatMap((ev) => ev.feedback);
  const fieldByKey = new Map(fields.map((f) => [f.key, f]));
  const keys = [
    ...new Set(
      experiments.flatMap((e) => e.rows.flatMap((r) => Object.keys(r.scores))),
    ),
  ];
  const exampleIds = [
    ...new Set(experiments.flatMap((e) => e.rows.map((r) => r.exampleId))),
  ];
  const single = experiments.length === 1;

  return (
    <div className="overflow-x-auto border-t border-[var(--line)] bg-[var(--card)]">
      <table className="w-full min-w-[920px] text-left text-[13px]">
        <thead>
          <tr className="border-b border-[var(--line)] text-[var(--ink)]">
            <th className="w-10 px-3 py-2 font-medium text-[var(--muted)]">#</th>
            <th className="px-3 py-2 font-medium">Inputs</th>
            <th className="px-3 py-2 font-medium">Reference Outputs</th>
            {experiments.map((ex, i) => (
              <th key={ex.id} className="px-3 py-2 font-medium">
                {single ? (
                  "Outputs"
                ) : (
                  <span className="inline-flex items-center gap-1.5">
                    Outputs
                    <span className="letter" style={{ background: expColor(i) }}>
                      {expLetter(i)}
                    </span>
                  </span>
                )}
              </th>
            ))}
            {keys.map((k) => {
              const avgs = experiments.map((ex) => meanScores(ex)[k]);
              const field = fieldByKey.get(k);
              return (
                <th key={k} className="px-3 py-2 font-medium">
                  <div>{k}</div>
                  {avgs.map((avg, i) =>
                    avg == null || field?.kind === "categorical" ? null : (
                      <div
                        key={experiments[i].id}
                        className="mt-0.5 text-[11px] font-normal text-[var(--muted)]"
                      >
                        {avg.toFixed(3)} AVG
                        {single ? null : (
                          <span className="ml-1">{expLetter(i)}</span>
                        )}
                      </div>
                    ),
                  )}
                </th>
              );
            })}
          </tr>
        </thead>
        <tbody>
          {exampleIds.map((eid, rowIndex) => {
            const prompt =
              experiments
                .flatMap((e) => e.rows)
                .find((r) => r.exampleId === eid)?.prompt ?? "";
            const reference =
              dataset.examples.find((ex) => ex.id === eid)?.reference ?? "";
            return (
              <tr key={eid} className="border-t border-[var(--line)] align-top">
                <td className="px-3 py-3 text-[var(--muted)]">{rowIndex + 1}</td>
                <td className="max-w-[240px] px-3 py-3">
                  <div className="whitespace-pre-wrap text-[13px] leading-relaxed text-[var(--ink)]">
                    {prompt}
                  </div>
                </td>
                <td className="max-w-[240px] px-3 py-3 text-[13px] leading-relaxed text-[var(--muted)]">
                  {reference || "—"}
                </td>
                {experiments.map((ex) => {
                  const row = ex.rows.find((r) => r.exampleId === eid);
                  return (
                    <td key={ex.id} className="max-w-[280px] px-3 py-3">
                      {row?.error ? (
                        <span className="text-[var(--warn)]">{row.error}</span>
                      ) : (
                        <div className="max-h-40 overflow-auto whitespace-pre-wrap leading-relaxed text-[var(--muted)]">
                          {row ? rowOutput(row) : "—"}
                        </div>
                      )}
                    </td>
                  );
                })}
                {keys.map((k) => {
                  const field = fieldByKey.get(k);
                  return (
                    <td key={k} className="px-0 py-0">
                      <div className="flex min-h-full min-w-[88px]">
                        {experiments.map((ex) => {
                          const row = ex.rows.find((r) => r.exampleId === eid);
                          const v = row?.scores[k];
                          const kind = field?.kind ?? inferKind(v);
                          const style = scoreCellStyle(field, v);
                          return (
                            <div
                              key={ex.id}
                              className="flex flex-1 items-center justify-end px-3 py-3 font-medium tabular-nums"
                              style={style}
                            >
                              {v === undefined ? "—" : formatScore(v, kind)}
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
  );
}
