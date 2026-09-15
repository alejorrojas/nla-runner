"use client";

import { useMemo } from "react";
import {
  columnResizingFeature,
  columnSizingFeature,
  createColumnHelper,
  createPaginatedRowModel,
  createSortedRowModel,
  rowPaginationFeature,
  rowSortingFeature,
  sortFn_alphanumeric,
  sortFn_basic,
  tableFeatures,
  useTable,
} from "@tanstack/react-table";
import type { Dataset, Evaluator, Experiment } from "@/lib/types";
import {
  formatScore,
  inferKind,
  meanScores,
  nlaVerbalization,
  rowModelOutput,
  scoreCellStyle,
} from "@/lib/feedback-display";
import { experimentKpis } from "@/lib/compare-metrics";
import {
  articleFraming,
  forumLexeme,
  namesReddit,
  nlaCharCount,
  nlaText,
  rowMse,
} from "@/lib/nla-signals";
import { runNumberMap, runTag } from "@/lib/run-numbers";
import { Button } from "@/components/ui/button";

const features = tableFeatures({
  columnResizingFeature,
  columnSizingFeature,
  rowPaginationFeature,
  rowSortingFeature,
  sortedRowModel: createSortedRowModel(),
  paginatedRowModel: createPaginatedRowModel(),
  sortFns: { alphanumeric: sortFn_alphanumeric, basic: sortFn_basic },
});

const helper = createColumnHelper<typeof features, CompareRow>();

type CompareRow = {
  exampleId: string;
  index: number;
  prompt: string;
  reference: string;
  outputs: Record<string, string>;
  nlas: Record<string, string>;
  mse: Record<string, number | null>;
  chars: Record<string, number>;
  scores: Record<string, Record<string, unknown>>;
  lexicalReddit: Record<string, boolean>;
  lexicalForum: Record<string, boolean>;
  lexicalArticle: Record<string, boolean>;
};

const BOOL_FIELD = {
  key: "bool",
  description: "",
  kind: "boolean" as const,
};

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
  const single = experiments.length === 1;
  const numbers = useMemo(() => runNumberMap(experiments), [experiments]);
  const tagFor = (experiment: Experiment) =>
    runTag(numbers.get(experiment.id) ?? experiment.runNumber ?? 1);
  const kpis = useMemo(
    () => experiments.map((ex) => experimentKpis(ex)),
    [experiments],
  );

  const data = useMemo<CompareRow[]>(() => {
    const exampleIds = [
      ...new Set(experiments.flatMap((e) => e.rows.map((r) => r.exampleId))),
    ];
    return exampleIds.map((eid, rowIndex) => {
      const prompt =
        experiments.flatMap((e) => e.rows).find((r) => r.exampleId === eid)
          ?.prompt ?? "";
      const reference =
        dataset.examples.find((ex) => ex.id === eid)?.reference ?? "";
      const outputs: CompareRow["outputs"] = {};
      const nlas: CompareRow["nlas"] = {};
      const mse: CompareRow["mse"] = {};
      const chars: CompareRow["chars"] = {};
      const scores: CompareRow["scores"] = {};
      const lexicalReddit: CompareRow["lexicalReddit"] = {};
      const lexicalForum: CompareRow["lexicalForum"] = {};
      const lexicalArticle: CompareRow["lexicalArticle"] = {};
      for (const ex of experiments) {
        const row = ex.rows.find((r) => r.exampleId === eid);
        outputs[ex.id] = row ? rowModelOutput(row) : "—";
        nlas[ex.id] = row ? nlaVerbalization(row) || "—" : "—";
        mse[ex.id] = row ? rowMse(row) : null;
        chars[ex.id] = row ? nlaCharCount(row) : 0;
        scores[ex.id] = row?.scores ?? {};
        const text = row ? nlaText(row) : "";
        lexicalReddit[ex.id] = row ? namesReddit(text) : false;
        lexicalForum[ex.id] = row ? forumLexeme(text) : false;
        lexicalArticle[ex.id] = row ? articleFraming(text) : false;
      }
      return {
        exampleId: eid,
        index: rowIndex + 1,
        prompt,
        reference,
        outputs,
        nlas,
        mse,
        chars,
        scores,
        lexicalReddit,
        lexicalForum,
        lexicalArticle,
      };
    });
  }, [dataset.examples, experiments]);

  const columns = useMemo(
    () =>
      helper.columns([
        helper.accessor("index", {
          header: "#",
          size: 56,
          minSize: 44,
          enableSorting: true,
          sortFn: "basic",
        }),
        helper.accessor("prompt", {
          header: "Inputs",
          size: 220,
          minSize: 120,
          sortFn: "alphanumeric",
          cell: (info) => (
            <div className="whitespace-pre-wrap leading-relaxed">{info.getValue()}</div>
          ),
        }),
        helper.accessor("reference", {
          header: "Reference",
          size: 140,
          minSize: 80,
          sortFn: "alphanumeric",
          cell: (info) => (
            <span className="text-[var(--muted)]">{info.getValue() || "—"}</span>
          ),
        }),
        ...experiments.map((ex) =>
          helper.accessor((row) => row.outputs[ex.id], {
            id: `out-${ex.id}`,
            header: single ? "Output" : `Output ${tagFor(ex)}`,
            size: 240,
            minSize: 120,
            sortFn: "alphanumeric",
            cell: (info) => (
              <div className="max-h-36 overflow-auto whitespace-pre-wrap leading-relaxed text-[var(--muted)]">
                {info.getValue()}
              </div>
            ),
          }),
        ),
        ...experiments.map((ex) =>
          helper.accessor((row) => row.nlas[ex.id], {
            id: `nla-${ex.id}`,
            header: single ? "NLA" : `NLA ${tagFor(ex)}`,
            size: 280,
            minSize: 140,
            sortFn: "alphanumeric",
            cell: (info) => (
              <div className="max-h-36 overflow-auto whitespace-pre-wrap leading-relaxed text-[var(--muted)]">
                {info.getValue()}
              </div>
            ),
          }),
        ),
        ...keys.map((k) => {
          const field = fieldByKey.get(k);
          const avgs = experiments.map((ex) => meanScores(ex)[k]);
          return helper.accessor((row) => row.scores[experiments[0]?.id ?? ""]?.[k], {
            id: `score-${k}`,
            header: () => (
              <div>
                <div>{k}</div>
                {avgs.map((avg, i) =>
                  avg == null || field?.kind === "categorical" ? null : (
                    <div
                      key={experiments[i].id}
                      className="mt-0.5 text-[11px] font-normal text-[var(--muted)]"
                    >
                      {avg.toFixed(3)} AVG
                      {single ? null : ` ${tagFor(experiments[i])}`}
                    </div>
                  ),
                )}
              </div>
            ),
            size: 110,
            minSize: 80,
            sortFn: "basic",
            cell: (info) => {
              const row = info.row.original;
              return (
                <div className="flex min-h-full min-w-[72px]">
                  {experiments.map((ex) => {
                    const v = row.scores[ex.id]?.[k];
                    const kind = field?.kind ?? inferKind(v);
                    const style = scoreCellStyle(field, v);
                    return (
                      <div
                        key={ex.id}
                        className="flex flex-1 items-center justify-end px-1 py-1 font-medium tabular-nums"
                        style={style}
                      >
                        {v === undefined ? "—" : formatScore(v, kind)}
                      </div>
                    );
                  })}
                </div>
              );
            },
          });
        }),
        ...(
          [
            ["lexical_reddit", "lexicalReddit", "lexicalReddit"],
            ["lexical_forum", "lexicalForum", "lexicalForum"],
            ["lexical_article", "lexicalArticle", "lexicalArticle"],
          ] as const
        ).map(([title, rowKey, kpiKey]) => {
          const avgs = kpis.map((k) => k[kpiKey]);
          return helper.accessor((row) => row[rowKey][experiments[0]?.id ?? ""], {
            id: title,
            header: () => (
              <div>
                <div>{title}</div>
                {avgs.map((avg, i) => (
                  <div
                    key={experiments[i].id}
                    className="mt-0.5 text-[11px] font-normal text-[var(--muted)]"
                  >
                    {avg.toFixed(3)} AVG
                    {single ? null : ` ${tagFor(experiments[i])}`}
                  </div>
                ))}
              </div>
            ),
            size: 120,
            minSize: 88,
            sortFn: "basic",
            cell: (info) => {
              const row = info.row.original;
              return (
                <div className="flex min-h-full min-w-[72px]">
                  {experiments.map((ex) => {
                    const v = row[rowKey][ex.id];
                    const style = scoreCellStyle(BOOL_FIELD, v);
                    return (
                      <div
                        key={ex.id}
                        className="flex flex-1 items-center justify-end px-1 py-1 font-medium tabular-nums"
                        style={style}
                      >
                        {formatScore(v, "boolean")}
                      </div>
                    );
                  })}
                </div>
              );
            },
          });
        }),
        ...experiments.map((ex) =>
          helper.accessor((row) => row.mse[ex.id], {
            id: `mse-${ex.id}`,
            header: single ? "MSE" : `MSE ${tagFor(ex)}`,
            size: 88,
            minSize: 64,
            sortFn: "basic",
            cell: (info) => {
              const v = info.getValue();
              return (
                <span className="tabular-nums">
                  {v == null ? "—" : v.toFixed(3)}
                </span>
              );
            },
          }),
        ),
        ...experiments.map((ex) =>
          helper.accessor((row) => row.chars[ex.id], {
            id: `chars-${ex.id}`,
            header: single ? "AV chars" : `AV chars ${tagFor(ex)}`,
            size: 96,
            minSize: 72,
            sortFn: "basic",
            cell: (info) => (
              <span className="tabular-nums">{info.getValue()}</span>
            ),
          }),
        ),
      ]),
    [experiments, fieldByKey, keys, kpis, numbers, single],
  );

  const table = useTable(
    {
      features,
      columns,
      data,
      columnResizeMode: "onChange",
      initialState: {
        pagination: { pageIndex: 0, pageSize: 10 },
        sorting: [{ id: "index", desc: false }],
      },
    },
    (state) => state,
  );

  return (
    <div className="border-t border-[var(--line)] bg-[var(--card)]">
      <div className="overflow-x-auto">
        <table
          className="text-left text-[13px]"
          style={{
            width: "100%",
            minWidth: table.getTotalSize(),
            tableLayout: "fixed",
          }}
        >
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-[var(--line)]">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    colSpan={header.colSpan}
                    className="relative px-3 py-2 font-medium text-[var(--ink)]"
                    style={{ width: header.getSize() }}
                  >
                    {header.isPlaceholder ? null : (
                      <Button
                        type="button"
                        variant="ghost"
                        aria-label="Sort column"
                        className="h-auto max-w-full justify-start rounded-none px-0 py-0 font-medium"
                        onClick={header.column.getToggleSortingHandler()}
                      >
                        <table.FlexRender header={header} />
                        {{
                          asc: " ↑",
                          desc: " ↓",
                        }[header.column.getIsSorted() as string] ?? null}
                      </Button>
                    )}
                    <div
                      onDoubleClick={() => header.column.resetSize()}
                      onMouseDown={header.getResizeHandler()}
                      onTouchStart={header.getResizeHandler()}
                      className={`tt-resizer ${header.column.getIsResizing() ? "isResizing" : ""}`}
                    />
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-t border-[var(--line)] align-top">
                {row.getAllCells().map((cell) => (
                  <td
                    key={cell.id}
                    className="px-3 py-3"
                    style={{ width: cell.column.getSize() }}
                  >
                    <table.FlexRender cell={cell} />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[var(--line)] px-3 py-2 text-[12px] text-[var(--muted)]">
        <span>
          {table.getRowCount()} rows · page {table.state.pagination.pageIndex + 1} of{" "}
          {table.getPageCount() || 1}
        </span>
        <div className="flex items-center gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Prev
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
