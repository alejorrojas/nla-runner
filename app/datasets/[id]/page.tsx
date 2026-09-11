"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { RunProgress, type RunPhase, type RunTick } from "@/components/run-progress";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
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
  const [tab, setTab] = useState<"experiments" | "examples">("experiments");

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
        <Link href="/datasets" className="mt-3 inline-block hover:underline">
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
          <Input
            className="title-plain h-auto max-w-xl border-0 p-0 text-[20px] font-medium shadow-none focus-visible:ring-0"
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
        tabs={
          <Tabs
            value={tab}
            onValueChange={(value) =>
              setTab(value as "experiments" | "examples")
            }
          >
            <TabsList variant="line" className="h-auto p-0">
              <TabsTrigger value="experiments">Experiments</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="page-body">
        {tab === "experiments" ? (
          <>
            <section className="surface p-6">
              <div className="flex items-end justify-between gap-4">
                <div>
                  <h2 className="section-title">Run experiment</h2>
                  <p className="hint mt-2">
                    You will see which prompt is in flight and whether we are on
                    NLA or the judge.
                  </p>
                </div>
                <Button
                  type="button"
                  disabled={running}
                  onClick={() => {
                    setTab("experiments");
                    void run();
                  }}
                >
                  {running ? "Running…" : "Run experiment"}
                </Button>
              </div>
              <div className="mt-5 grid gap-5 md:grid-cols-3">
                <div className="field">
                  <Label>NLA source</Label>
                  <Select value={sourceId} onValueChange={setSourceId}>
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {NLA_SOURCES.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="field">
                  <Label>Token policy</Label>
                  <Select
                    value={tokenPolicy}
                    onValueChange={(value) =>
                      setTokenPolicy(value as TokenPolicy)
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="last_user">Last user token</SelectItem>
                      <SelectItem value="first_assistant">
                        First assistant token
                      </SelectItem>
                      <SelectItem value="both">Both</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="field">
                  <Label>Evaluators</Label>
                  <div className="flex flex-col gap-2">
                    {store.evaluators.map((ev) => (
                      <div key={ev.id} className="flex items-center gap-2">
                        <Checkbox
                          id={`evaluator-${ev.id}`}
                          checked={evaluatorIds.includes(ev.id)}
                          onCheckedChange={(checked) =>
                            setEvaluatorIds((ids) =>
                              checked === true
                                ? [...ids, ev.id]
                                : ids.filter((x) => x !== ev.id),
                            )
                          }
                        />
                        <Label
                          htmlFor={`evaluator-${ev.id}`}
                          className="font-normal text-[var(--ink)]"
                        >
                          {ev.name}
                        </Label>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              {log ? (
                <p className="hint font-mono">
                  {log}
                </p>
              ) : null}
              <RunProgress tick={tick} />
            </section>

            <section className="mt-6">
              <div className="mb-3 flex items-center justify-end">
                <Button
                  variant="outline"
                  type="button"
                  disabled={selected.length < 1}
                  onClick={() =>
                    router.push(
                      `/datasets/${dataset.id}/compare?ids=${selected.join(",")}`,
                    )
                  }
                >
                  Compare selected
                </Button>
              </div>
              <div className="surface overflow-hidden">
                <table className="data-table">
                  <thead>
                    <tr>
                      <th className="w-10"></th>
                      <th>Name</th>
                      <th>Source</th>
                      <th>Token</th>
                      <th>Rows</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiments.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="text-[var(--muted)]">
                          No runs yet. Start one above — the list updates while it
                          runs.
                        </td>
                      </tr>
                    ) : (
                      experiments.map((ex) => (
                        <tr key={ex.id}>
                          <td>
                            <Checkbox
                              checked={selected.includes(ex.id)}
                              onCheckedChange={(checked) =>
                                setSelected((ids) =>
                                  checked === true
                                    ? [...ids, ex.id]
                                    : ids.filter((x) => x !== ex.id),
                                )
                              }
                              aria-label={`Select ${ex.name}`}
                            />
                          </td>
                          <td>
                            <Link
                              href={`/datasets/${dataset.id}/compare?ids=${ex.id}`}
                              className="font-medium hover:underline"
                            >
                              {ex.name}
                            </Link>
                          </td>
                          <td className="font-mono text-[12px] text-[var(--muted)]">
                            {ex.sourceId}
                          </td>
                          <td className="font-mono text-[12px] text-[var(--muted)]">
                            {ex.tokenPolicy}
                          </td>
                          <td className="font-mono">{ex.rows.length}</td>
                          <td>
                            <StatusBadge status={ex.status} />
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : (
          <section>
            <div className="mb-3 flex items-center justify-end">
              <Button
                variant="outline"
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
              </Button>
            </div>
            <div className="flex flex-col gap-5">
              {dataset.examples.map((ex, i) => {
                const live = tick && tick.index === i && running;
                return (
                  <div
                    key={ex.id}
                    className={`stack rounded-xl border p-6 ${
                      live
                        ? "border-[var(--accent)] bg-[var(--hover)]"
                        : "border-[var(--line)] bg-[var(--card)]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-[13px] text-[var(--muted)]">
                      <span>#{i + 1} prompt</span>
                      {live ? (
                        <span className="font-mono">
                          in flight · {tick.phase}
                        </span>
                      ) : null}
                    </div>
                    <Textarea
                      rows={3}
                      value={ex.prompt}
                      onChange={(e) =>
                        updateExample(ex.id, { prompt: e.target.value })
                      }
                    />
                    <div className="field">
                      <Label htmlFor={`ref-${ex.id}`}>
                        Reference (optional, for the judge)
                      </Label>
                      <Input
                        id={`ref-${ex.id}`}
                        value={ex.reference ?? ""}
                        onChange={(e) =>
                          updateExample(ex.id, { reference: e.target.value })
                        }
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}

function StatusBadge({ status }: { status: Experiment["status"] }) {
  switch (status) {
    case "running":
      return (
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[var(--active)] px-2 py-0.5 text-[13px]">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--accent)]" />
          running
        </span>
      );
    case "error":
      return (
        <span className="inline-flex rounded-full bg-[var(--hover)] px-2 py-0.5 text-[13px] text-[var(--muted)]">
          error
        </span>
      );
    case "done":
    case "idle":
      return (
        <span className="inline-flex rounded-full bg-[var(--active)] px-2 py-0.5 text-[13px]">
          {status}
        </span>
      );
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
