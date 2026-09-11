"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { RunProgress, type RunPhase, type RunTick } from "@/components/run-progress";
import { useKeys } from "@/lib/keys";
import { useStore } from "@/lib/store-client";
import { NLA_SOURCES, type Experiment, type ExperimentRow, type TokenPolicy } from "@/lib/types";

type StreamEvent = {
  type: string;
  row?: ExperimentRow;
  experiment?: Experiment;
  index?: number;
  total?: number;
  prompt?: string;
  phase?: RunPhase;
};

export default function DatasetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, save, reload, upsertExperiment } = useStore();
  const { keys, headers } = useKeys();
  const [sourceId, setSourceId] = useState<string>(NLA_SOURCES[0].id);
  const [tokenPolicy, setTokenPolicy] = useState<TokenPolicy>("last_user");
  const [evaluatorIds, setEvaluatorIds] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState("");
  const [tick, setTick] = useState<RunTick | null>(null);
  const [selected, setSelected] = useState<string[]>([]);

  const dataset = store?.datasets.find((d) => d.id === id);
  const experiments = useMemo(
    () => store?.experiments.filter((e) => e.datasetId === id) ?? [],
    [store, id],
  );

  useEffect(() => {
    if (!store || evaluatorIds.length > 0) return;
    const first = store.evaluators[0];
    if (first) setEvaluatorIds([first.id]);
  }, [store, evaluatorIds.length]);

  if (!store) return <PageLoader label="Loading dataset" />;
  if (!dataset) {
    return (
      <div className="p-10">
        <p>Dataset not found.</p>
        <Link href="/datasets" className="mt-3 inline-block text-[var(--copper)]">
          Back to datasets
        </Link>
      </div>
    );
  }

  const updateExample = (
    exampleId: string,
    patch: { prompt?: string; reference?: string },
  ) => {
    void save({
      ...store,
      datasets: store.datasets.map((d) =>
        d.id !== dataset.id
          ? d
          : {
              ...d,
              examples: d.examples.map((ex) =>
                ex.id === exampleId ? { ...ex, ...patch } : ex,
              ),
            },
      ),
    });
  };

  async function run() {
    if (!keys.openai || !keys.neuronpedia) {
      router.push("/settings");
      return;
    }
    if (evaluatorIds.length === 0) {
      setLog("Pick at least one evaluator.");
      return;
    }
    setRunning(true);
    setLog("Starting experiment…");
    setTick({
      index: 0,
      total: dataset!.examples.length,
      prompt: dataset!.examples[0]?.prompt ?? "",
      phase: "nla",
      completed: 0,
    });
    const res = await fetch("/api/experiments/run", {
      method: "POST",
      headers: { "Content-Type": "application/json", ...headers },
      body: JSON.stringify({
        datasetId: dataset!.id,
        sourceId,
        tokenPolicy,
        evaluatorIds,
      }),
    });
    if (!res.ok || !res.body) {
      setLog(await res.text());
      setRunning(false);
      setTick(null);
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    let completed = 0;
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const ev = JSON.parse(line) as StreamEvent;
        if (ev.type === "start" && ev.experiment) {
          upsertExperiment(ev.experiment);
          setLog(`Running ${ev.experiment.name}`);
        }
        if (ev.type === "progress" && ev.prompt && ev.phase && ev.total != null && ev.index != null) {
          setTick({
            index: ev.index,
            total: ev.total,
            prompt: ev.prompt,
            phase: ev.phase,
            completed,
          });
          setLog(
            `${ev.phase === "nla" ? "NLA" : "Judge"} · ${ev.index + 1}/${ev.total}`,
          );
        }
        if (ev.type === "row" && ev.row) {
          completed += 1;
          if (ev.experiment) upsertExperiment(ev.experiment);
          setTick((prev) =>
            prev
              ? { ...prev, completed }
              : {
                  index: ev.index ?? completed - 1,
                  total: ev.total ?? dataset!.examples.length,
                  prompt: ev.row?.prompt ?? "",
                  phase: "judge",
                  completed,
                },
          );
        }
        if (ev.type === "done" && ev.experiment) {
          upsertExperiment(ev.experiment);
        }
      }
    }
    setRunning(false);
    setTick(null);
    setLog("Run finished.");
    await reload();
  }

  return (
    <div>
      <PageHeader
        crumb={
          <>
            <Link href="/datasets">Datasets</Link>
            <span> / </span>
            <span className="text-[var(--ink)]">{dataset.name}</span>
          </>
        }
        title={
          <input
            className="max-w-xl border-0 bg-transparent px-0 font-display text-[28px] shadow-none"
            value={dataset.name}
            onChange={(e) =>
              void save({
                ...store,
                datasets: store.datasets.map((d) =>
                  d.id === dataset.id ? { ...d, name: e.target.value } : d,
                ),
              })
            }
          />
        }
        hint={`${dataset.examples.length} prompts · ${experiments.length} experiments`}
      />

      <div className="p-6">
        <section className="surface rounded-lg p-5">
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="font-display text-[22px]">Run experiment</h2>
              <p className="mt-1 text-[13px] text-[var(--muted)]">
                You will see which prompt is in flight and whether we are on NLA
                or the judge.
              </p>
            </div>
            <button
              className="btn btn-primary"
              type="button"
              disabled={running}
              onClick={() => void run()}
            >
              {running ? "Running…" : "Run experiment"}
            </button>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            <label className="text-[12px] text-[var(--muted)]">
              NLA source
              <select
                className="mt-1 w-full"
                value={sourceId}
                onChange={(e) => setSourceId(e.target.value)}
              >
                {NLA_SOURCES.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.label}
                  </option>
                ))}
              </select>
            </label>
            <label className="text-[12px] text-[var(--muted)]">
              Token policy
              <select
                className="mt-1 w-full"
                value={tokenPolicy}
                onChange={(e) => setTokenPolicy(e.target.value as TokenPolicy)}
              >
                <option value="last_user">Last user token</option>
                <option value="first_assistant">First assistant token</option>
                <option value="both">Both</option>
              </select>
            </label>
            <div className="text-[12px] text-[var(--muted)]">
              Evaluators
              <div className="mt-1 space-y-1">
                {store.evaluators.map((ev) => (
                  <label key={ev.id} className="flex items-center gap-2 text-[var(--ink)]">
                    <input
                      type="checkbox"
                      checked={evaluatorIds.includes(ev.id)}
                      onChange={(e) =>
                        setEvaluatorIds((ids) =>
                          e.target.checked
                            ? [...ids, ev.id]
                            : ids.filter((x) => x !== ev.id),
                        )
                      }
                    />
                    {ev.name}
                  </label>
                ))}
              </div>
            </div>
          </div>
          {log ? (
            <p className="mt-3 font-mono text-[12px] text-[var(--muted)]">{log}</p>
          ) : null}
          <RunProgress tick={tick} />
        </section>

        <section className="mt-8">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[22px]">Examples</h2>
            <button
              className="btn"
              type="button"
              onClick={() =>
                void save({
                  ...store,
                  datasets: store.datasets.map((d) =>
                    d.id !== dataset.id
                      ? d
                      : {
                          ...d,
                          examples: [
                            ...d.examples,
                            { id: crypto.randomUUID(), prompt: "" },
                          ],
                        },
                  ),
                })
              }
            >
              Add example
            </button>
          </div>
          <div className="space-y-3">
            {dataset.examples.map((ex, i) => {
              const live = tick && tick.index === i && running;
              return (
                <div
                  key={ex.id}
                  className={`rounded-lg border p-4 ${
                    live
                      ? "border-[var(--copper)] bg-[#fff8f2]"
                      : "border-[var(--line)] bg-[var(--card)]"
                  }`}
                >
                  <div className="mb-1 flex items-center justify-between text-[11px] text-[var(--muted)]">
                    <span>#{i + 1} prompt</span>
                    {live ? (
                      <span className="font-mono text-[var(--copper)]">
                        in flight · {tick.phase}
                      </span>
                    ) : null}
                  </div>
                  <textarea
                    className="w-full text-[13px]"
                    rows={3}
                    value={ex.prompt}
                    onChange={(e) =>
                      updateExample(ex.id, { prompt: e.target.value })
                    }
                  />
                  <div className="mt-2 text-[11px] text-[var(--muted)]">
                    Reference (optional, for the judge)
                  </div>
                  <input
                    className="mt-1 w-full text-[13px]"
                    value={ex.reference ?? ""}
                    onChange={(e) =>
                      updateExample(ex.id, { reference: e.target.value })
                    }
                  />
                </div>
              );
            })}
          </div>
        </section>

        <section className="mt-10">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-display text-[22px]">Experiments</h2>
            <button
              className="btn"
              type="button"
              disabled={selected.length < 1}
              onClick={() =>
                router.push(
                  `/datasets/${dataset.id}/compare?ids=${selected.join(",")}`,
                )
              }
            >
              Compare selected
            </button>
          </div>
          <ul className="surface overflow-hidden rounded-lg">
            {experiments.length === 0 ? (
              <li className="px-4 py-8 text-[13px] text-[var(--muted)]">
                No runs yet. Start one above — the list updates while it runs.
              </li>
            ) : (
              experiments.map((ex) => (
                <li
                  key={ex.id}
                  className="flex items-center gap-3 border-b border-[var(--line)] px-4 py-3 last:border-0"
                >
                  <input
                    type="checkbox"
                    checked={selected.includes(ex.id)}
                    onChange={(e) =>
                      setSelected((ids) =>
                        e.target.checked
                          ? [...ids, ex.id]
                          : ids.filter((x) => x !== ex.id),
                      )
                    }
                  />
                  <div className="min-w-0 flex-1">
                    <Link
                      href={`/datasets/${dataset.id}/compare?ids=${ex.id}`}
                      className="text-[14px] hover:underline"
                    >
                      {ex.name}
                    </Link>
                    <div className="font-mono text-[11px] text-[var(--muted)]">
                      {ex.sourceId} · {ex.tokenPolicy} · {ex.rows.length} rows
                    </div>
                  </div>
                  <StatusBadge status={ex.status} />
                </li>
              ))
            )}
          </ul>
        </section>
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Experiment["status"] }) {
  switch (status) {
    case "running":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#fff1e8] px-2 py-0.5 font-mono text-[11px] text-[var(--copper)]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--copper)]" />
          running
        </span>
      );
    case "error":
      return (
        <span className="inline-flex rounded-full bg-[#fde8e6] px-2 py-0.5 font-mono text-[11px] text-[var(--warn)]">
          error
        </span>
      );
    case "done":
    case "idle":
      return (
        <span className="inline-flex rounded-full bg-[#e7f3ef] px-2 py-0.5 font-mono text-[11px] text-[var(--residue)]">
          {status}
        </span>
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
