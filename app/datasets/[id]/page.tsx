"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import { AttachEvaluatorDialog } from "@/components/attach-evaluator-dialog";
import { CompareCharts } from "@/components/compare-charts";
import { PageHeader } from "@/components/page-chrome";
import { RunExperimentDialog } from "@/components/run-experiment-dialog";
import { RunProgress, type RunPhase, type RunTick } from "@/components/run-progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton, TableRowsSkeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import { defaultCompareIds } from "@/lib/compare-ids";
import { attachedEvaluatorIds, withDatasetEvaluators } from "@/lib/dataset-evaluators";
import { meanScores } from "@/lib/feedback-display";
import { useKeys } from "@/lib/keys";
import { nlaRunBudget } from "@/lib/neuronpedia-limits";
import { runNumberMap, runTag } from "@/lib/run-numbers";
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

type DatasetTab = "experiments" | "evaluators" | "examples";

function formatWhen(iso: string) {
  return new Date(iso).toLocaleString(undefined, {
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

export default function DatasetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, save, reload, upsertExperiment } = useStore();
  const { hints } = useKeys();
  const [sourceId, setSourceId] = useState<string>(NLA_SOURCES[0].id);
  const [tokenPolicy, setTokenPolicy] = useState<TokenPolicy>("last_user");
  const [repetitions, setRepetitions] = useState(1);
  const [evaluatorIds, setEvaluatorIds] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState("");
  const [tick, setTick] = useState<RunTick | null>(null);
  const [selected, setSelected] = useState<string[] | null>(null);
  const [tab, setTab] = useState<DatasetTab>("experiments");
  const [runOpen, setRunOpen] = useState(false);
  const [attachOpen, setAttachOpen] = useState(false);

  const dataset = store?.datasets.find((d) => d.id === id);
  const experiments = useMemo(
    () =>
      [...(store?.experiments.filter((e) => e.datasetId === id) ?? [])].sort(
        (a, b) =>
          b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id),
      ),
    [store, id],
  );
  const chosen = selected ?? defaultCompareIds(experiments);
  const attachedIds = dataset
    ? attachedEvaluatorIds(dataset, experiments)
    : [];
  const attachedEvaluators =
    store?.evaluators.filter((ev) => attachedIds.includes(ev.id)) ?? [];
  const metricKeys = [
    ...new Set(experiments.flatMap((ex) => Object.keys(meanScores(ex)))),
  ];
  const numbers = runNumberMap(experiments);

  useEffect(() => {
    if (!store || !dataset) return;
    if ((dataset.evaluatorIds ?? []).length > 0) return;
    const inferred = [
      ...new Set(experiments.flatMap((e) => e.evaluatorIds)),
    ];
    if (!inferred.length) return;
    persistDatasetEvaluators(inferred);
  }, [store, dataset, experiments]);

  useEffect(() => {
    if (evaluatorIds.length > 0 || attachedIds.length === 0) return;
    setEvaluatorIds(attachedIds);
  }, [attachedIds, evaluatorIds.length]);

  function persistDatasetEvaluators(nextIds: string[]) {
    if (!store || !dataset) return;
    void save({
      ...store,
      datasets: store.datasets.map((d) =>
        d.id === dataset.id ? withDatasetEvaluators(d, nextIds) : d,
      ),
    });
  }

  if (!store) {
    return (
      <div>
        <PageHeader
          crumb={
            <>
              <Link href="/datasets">Datasets</Link>
              <span> / </span>
              <Skeleton className="inline-block h-3.5 w-28 align-middle" />
            </>
          }
          title={<Skeleton className="h-6 w-56" />}
          action={
            <div className="flex gap-2">
              <Button type="button" variant="outline" disabled>
                <Plus />
                Evaluator
              </Button>
              <Button type="button" disabled>
                <Plus />
                Experiment
              </Button>
            </div>
          }
          tabs={
            <Tabs value="experiments" onValueChange={() => {}}>
              <TabsList variant="line" className="h-auto p-0">
                <TabsTrigger value="experiments">Experiments</TabsTrigger>
                <TabsTrigger value="evaluators" disabled>
                  Evaluators
                </TabsTrigger>
                <TabsTrigger value="examples" disabled>
                  Examples
                </TabsTrigger>
              </TabsList>
            </Tabs>
          }
        />
        <div className="page-body">
          <div className="surface overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Progress</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                <TableRowsSkeleton rows={4} columns={["w-40", "w-16", "w-12"]} />
              </tbody>
            </table>
          </div>
        </div>
      </div>
    );
  }
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

  const current = dataset;

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
    if (!hints.openaiHint || !hints.neuronpediaHint) {
      router.push("/settings");
      return;
    }
    if (evaluatorIds.length === 0) {
      setLog("Pick at least one evaluator.");
      return;
    }
    const budget = nlaRunBudget({
      promptCount: current.examples.length,
      repetitions,
      tokenPolicy,
    });
    if (budget.overLimit) {
      setLog("This run exceeds Neuronpedia's hourly NLA limits.");
      return;
    }
    setRunning(true);
    setLog("Starting experiment…");
    setTick({
      index: 0,
      total: current.examples.length * repetitions,
      prompt: current.examples[0]?.prompt ?? "",
      phase: "nla",
      completed: 0,
    });
    const res = await fetch("/api/experiments/run", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        datasetId: current.id,
        sourceId,
        tokenPolicy,
        evaluatorIds,
        repetitions,
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
                  total: ev.total ?? current.examples.length,
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
        action={
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setTab("evaluators");
                setAttachOpen(true);
              }}
            >
              <Plus />
              Evaluator
            </Button>
            <Button
              type="button"
              onClick={() => {
                setTab("experiments");
                setRunOpen(true);
              }}
            >
              <Plus />
              Experiment
            </Button>
          </div>
        }
        tabs={
          <Tabs
            value={tab}
            onValueChange={(value) => setTab(value as DatasetTab)}
          >
            <TabsList variant="line" className="h-auto p-0">
              <TabsTrigger value="experiments">Experiments</TabsTrigger>
              <TabsTrigger value="evaluators">Evaluators</TabsTrigger>
              <TabsTrigger value="examples">Examples</TabsTrigger>
            </TabsList>
          </Tabs>
        }
      />

      <div className="page-body">
        {tab === "experiments" ? (
          <>
            {running && tick ? (
              <div className="mb-6">
                <RunProgress tick={tick} />
              </div>
            ) : null}
            {experiments.length > 0 ? (
              <div className="surface mb-6 overflow-hidden">
                <CompareCharts experiments={experiments} numbers={numbers} compact />
              </div>
            ) : null}
            <section>
              <div className="mb-3 flex items-center justify-end">
                <Button
                  variant="outline"
                  type="button"
                  disabled={chosen.length < 1}
                  onClick={() =>
                    router.push(
                      `/datasets/${dataset.id}/compare?ids=${chosen.join(",")}`,
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
                      <th className="w-12">#</th>
                      <th>Experiment</th>
                      <th>Progress</th>
                      {metricKeys.map((key) => (
                        <th key={key}>{key}</th>
                      ))}
                      <th>Created</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {experiments.length === 0 ? (
                      <tr>
                        <td
                          colSpan={6 + metricKeys.length}
                          className="text-[var(--muted)]"
                        >
                          No runs yet. Start one with + Experiment.
                        </td>
                      </tr>
                    ) : (
                      experiments.map((ex) => {
                        const scores = meanScores(ex);
                        const done = ex.rows.filter((row) => !row.error).length;
                        const n = numbers.get(ex.id);
                        return (
                          <tr key={ex.id}>
                            <td>
                              <Checkbox
                                checked={chosen.includes(ex.id)}
                                onCheckedChange={(checked) =>
                                  setSelected((ids) => {
                                    const current =
                                      ids ?? defaultCompareIds(experiments);
                                    return checked === true
                                      ? [...current, ex.id]
                                      : current.filter((x) => x !== ex.id);
                                  })
                                }
                                aria-label={`Select ${ex.name}`}
                              />
                            </td>
                            <td className="font-mono text-[var(--muted)]">
                              {n != null ? runTag(n) : "—"}
                            </td>
                            <td>
                              <Link
                                href={`/datasets/${dataset.id}/compare?ids=${ex.id}`}
                                className="font-medium hover:underline"
                              >
                                {ex.name}
                              </Link>
                              <div className="font-mono text-[var(--muted)]">
                                {ex.sourceId} · {ex.tokenPolicy}
                                {(ex.repetitions ?? 1) > 1
                                  ? ` · ${ex.repetitions}×`
                                  : ""}
                              </div>
                            </td>
                            <td className="font-mono">
                              {done} / {dataset.examples.length * (ex.repetitions ?? 1)}
                            </td>
                            {metricKeys.map((key) => (
                              <td key={key} className="font-mono">
                                {scores[key] == null ? "—" : scores[key].toFixed(2)}
                              </td>
                            ))}
                            <td className="text-[var(--muted)]">
                              {formatWhen(ex.createdAt)}
                            </td>
                            <td>
                              <StatusBadge status={ex.status} />
                            </td>
                          </tr>
                        );
                      })
                    )}
                  </tbody>
                </table>
              </div>
            </section>
          </>
        ) : null}

        {tab === "evaluators" ? (
          <div className="surface overflow-hidden">
            <table className="data-table">
              <thead>
                <tr>
                  <th>Evaluator</th>
                  <th>Type</th>
                  <th>Feedback</th>
                  <th>Runs on this dataset</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {attachedEvaluators.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="text-[var(--muted)]">
                      No evaluators on this dataset yet. Add one with + Evaluator.
                    </td>
                  </tr>
                ) : (
                  attachedEvaluators.map((ev) => {
                    const runs = experiments.filter((ex) =>
                      ex.evaluatorIds.includes(ev.id),
                    ).length;
                    return (
                      <tr key={ev.id}>
                        <td>
                          <Link
                            href={`/evaluators/${ev.id}`}
                            className="font-medium hover:underline"
                          >
                            {ev.name}
                          </Link>
                        </td>
                        <td className="text-[var(--muted)]">LLM-as-judge</td>
                        <td className="text-[var(--muted)]">
                          {ev.feedback.map((f) => f.key).join(", ") || "—"}
                        </td>
                        <td className="font-mono">{runs || "—"}</td>
                        <td>
                          <Button
                            type="button"
                            variant="ghost"
                            className="text-[var(--muted)]"
                            onClick={() =>
                              persistDatasetEvaluators(
                                attachedIds.filter((eid) => eid !== ev.id),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        ) : null}

        {tab === "examples" ? (
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
        ) : null}
      </div>

      <RunExperimentDialog
        open={runOpen}
        onOpenChange={setRunOpen}
        sourceId={sourceId}
        tokenPolicy={tokenPolicy}
        evaluatorIds={evaluatorIds}
        evaluators={attachedEvaluators.length ? attachedEvaluators : store.evaluators}
        promptCount={dataset.examples.length}
        repetitions={repetitions}
        running={running}
        log={log}
        tick={tick}
        onSourceId={setSourceId}
        onTokenPolicy={setTokenPolicy}
        onEvaluatorIds={setEvaluatorIds}
        onRepetitions={setRepetitions}
        onRun={() => {
          void run();
        }}
        keysReady={Boolean(hints.openaiHint && hints.neuronpediaHint)}
      />
      <AttachEvaluatorDialog
        open={attachOpen}
        onOpenChange={setAttachOpen}
        datasetId={dataset.id}
        evaluators={store.evaluators}
        attachedIds={attachedIds}
        onAttach={(ids) => {
          persistDatasetEvaluators(ids);
          setAttachOpen(false);
        }}
      />
    </div>
  );
}

function StatusBadge({ status }: { status: Experiment["status"] }) {
  switch (status) {
    case "running":
      return (
        <Badge tone="accent">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--clay)]" />
          running
        </Badge>
      );
    case "error":
      return <Badge tone="danger">error</Badge>;
    case "done":
    case "idle":
      return <Badge>{status}</Badge>;
    default: {
      const _exhaustive: never = status;
      return _exhaustive;
    }
  }
}
