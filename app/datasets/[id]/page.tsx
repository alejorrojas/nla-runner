"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { useKeys } from "@/lib/keys";
import { useStore } from "@/lib/store-client";
import { NLA_SOURCES, type TokenPolicy } from "@/lib/types";

export default function DatasetPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, save, reload } = useStore();
  const { keys, headers } = useKeys();
  const [sourceId, setSourceId] = useState<string>(NLA_SOURCES[0].id);
  const [tokenPolicy, setTokenPolicy] = useState<TokenPolicy>("last_user");
  const [evaluatorIds, setEvaluatorIds] = useState<string[]>([]);
  const [running, setRunning] = useState(false);
  const [log, setLog] = useState("");
  const [selected, setSelected] = useState<string[]>([]);

  const dataset = store?.datasets.find((d) => d.id === id);
  const experiments = useMemo(
    () => store?.experiments.filter((e) => e.datasetId === id) ?? [],
    [store, id],
  );

  if (!store) return <p className="p-8 text-[var(--muted)]">Loading…</p>;
  if (!dataset) return <p className="p-8">Dataset not found.</p>;

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
    setLog("Starting…");
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
      return;
    }
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let buf = "";
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      buf += decoder.decode(value, { stream: true });
      const lines = buf.split("\n");
      buf = lines.pop() ?? "";
      for (const line of lines) {
        if (!line.trim()) continue;
        const ev = JSON.parse(line) as { type: string; row?: { prompt: string } };
        if (ev.type === "row" && ev.row) {
          setLog(`Done: ${ev.row.prompt.slice(0, 80)}`);
        }
      }
    }
    setRunning(false);
    await reload();
  }

  return (
    <div>
      <div className="border-b border-[var(--line)] bg-[var(--card)] px-5 py-2">
        <div className="crumb">
          <Link href="/datasets">Datasets & Experiments</Link>
          <span> / </span>
          <span className="text-[var(--ink)]">{dataset.name}</span>
        </div>
      </div>
      <div className="p-5">
      <div className="mb-5 flex items-start justify-between gap-4">
        <input
          className="max-w-lg border-0 bg-transparent px-0 text-[20px] font-semibold tracking-tight shadow-none"
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
      </div>

      <section className="mb-8 rounded-lg border border-[var(--line)] bg-[var(--card)] p-4">
        <h2 className="text-[13px] font-medium">Run experiment</h2>
        <div className="mt-3 grid gap-4 md:grid-cols-3">
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
        <div className="mt-4 flex items-center gap-3">
          <button
            className="btn btn-primary"
            type="button"
            disabled={running}
            onClick={() => void run()}
          >
            {running ? "Running…" : "Run experiment"}
          </button>
          <span className="text-[12px] text-[var(--muted)]">{log}</span>
        </div>
      </section>

      <section className="mb-10">
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[13px] font-medium">Examples</h2>
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
          {dataset.examples.map((ex, i) => (
            <div
              key={ex.id}
              className="rounded-md border border-[var(--line)] p-3"
            >
              <div className="mb-1 text-[11px] text-[var(--muted)]">
                #{i + 1} prompt
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
          ))}
        </div>
      </section>

      <section>
        <div className="mb-2 flex items-center justify-between">
          <h2 className="text-[13px] font-medium">Experiments</h2>
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
        <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--card)]">
          {experiments.length === 0 ? (
            <li className="px-4 py-6 text-[13px] text-[var(--muted)]">
              No runs yet.
            </li>
          ) : (
            experiments.map((ex) => (
              <li key={ex.id} className="flex items-center gap-3 px-4 py-3">
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
                  <div className="text-[13px]">{ex.name}</div>
                  <div className="text-[11px] text-[var(--muted)]">
                    {ex.sourceId} · {ex.tokenPolicy} · {ex.status} ·{" "}
                    {ex.rows.length} rows
                  </div>
                </div>
              </li>
            ))
          )}
        </ul>
      </section>
      </div>
    </div>
  );
}
