"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { FeedbackConfig } from "@/components/feedback-config";
import { mustacheVars } from "@/lib/mustache";
import { useStore } from "@/lib/store-client";
import {
  JUDGE_VARS,
  OPENAI_MODELS,
  type Evaluator,
  type JudgeVar,
  type Store,
} from "@/lib/types";

export default function EvaluatorEditorPage() {
  const { id } = useParams<{ id: string }>();
  const { store, save } = useStore();
  const ev = store?.evaluators.find((e) => e.id === id);

  if (!store) return <p className="p-8 text-[var(--muted)]">Loading…</p>;
  if (!ev) return <p className="p-8">Evaluator not found.</p>;

  return <Editor store={store} ev={ev} save={save} />;
}

function Editor({
  store,
  ev,
  save,
}: {
  store: Store;
  ev: Evaluator;
  save: (next: Store) => Promise<void>;
}) {
  const router = useRouter();
  const placeholders = mustacheVars(ev.prompt);

  function patch(next: Evaluator) {
    void save({
      ...store,
      evaluators: store.evaluators.map((e) => (e.id === ev.id ? next : e)),
    });
  }

  return (
    <div className="flex min-h-full flex-col bg-[var(--card)]">
      <header className="flex items-center justify-between border-b border-[var(--line)] px-5 py-2">
        <div className="crumb">
          <Link href="/evaluators">Evaluators</Link>
          <span> / </span>
          <span className="text-[var(--ink)]">Configure Evaluator</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            className="btn"
            type="button"
            onClick={() => {
              void save({
                ...store,
                evaluators: store.evaluators.filter((e) => e.id !== ev.id),
              });
              router.push("/evaluators");
            }}
          >
            Delete
          </button>
          <button
            className="btn btn-primary"
            type="button"
            onClick={() => router.push("/evaluators")}
          >
            Save
          </button>
        </div>
      </header>
      <div className="grid min-h-0 flex-1 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="border-r border-[var(--line)] p-6">
          <label className="text-[12px] text-[var(--muted)]">
            Name
            <input
              className="mt-1 w-full"
              value={ev.name}
              onChange={(e) => patch({ ...ev, name: e.target.value })}
            />
          </label>
          <div className="mt-6 text-[13px] font-medium">Prompt &amp; Model</div>
          <p className="mt-1 text-[12px] text-[var(--muted)]">
            Type {"{{name}}"} for a mapped variable. Feedback keys become the
            structured JSON the judge must return (LangSmith&apos;s feedback
            configuration).
          </p>
          <label className="mt-3 block text-[12px] text-[var(--muted)]">
            OpenAI model
            <select
              className="mt-1 w-full"
              value={ev.openaiModel}
              onChange={(e) => patch({ ...ev, openaiModel: e.target.value })}
            >
              {OPENAI_MODELS.map((m) => (
                <option key={m} value={m}>
                  {m}
                </option>
              ))}
            </select>
          </label>
          <div className="mt-3 text-[11px] text-[var(--muted)]">
            Prompt editor · Mustache
          </div>
          <textarea
            className="mt-1 min-h-[280px] w-full font-mono text-[12px] leading-relaxed"
            value={ev.prompt}
            onChange={(e) => patch({ ...ev, prompt: e.target.value })}
          />
          <div className="mt-6 text-[13px] font-medium">Variable mapping</div>
          <div className="mt-2 space-y-2">
            {placeholders.length === 0 ? (
              <p className="text-[12px] text-[var(--muted)]">
                No {"{{vars}}"} in the prompt yet.
              </p>
            ) : (
              placeholders.map((ph) => (
                <label
                  key={ph}
                  className="flex items-center justify-between gap-3 text-[12px]"
                >
                  <span className="font-mono text-[var(--a)]">{`{{${ph}}}`}</span>
                  <select
                    value={ev.mapping[ph] ?? ""}
                    onChange={(e) =>
                      patch({
                        ...ev,
                        mapping: {
                          ...ev.mapping,
                          [ph]: e.target.value as JudgeVar,
                        },
                      })
                    }
                  >
                    <option value="">(unmapped)</option>
                    {JUDGE_VARS.map((v) => (
                      <option key={v} value={v}>
                        {v}
                      </option>
                    ))}
                  </select>
                </label>
              ))
            )}
          </div>
          <div className="mt-8">
            <FeedbackConfig
              feedback={ev.feedback}
              onChange={(feedback) => patch({ ...ev, feedback })}
            />
          </div>
        </div>
        <div className="p-6 text-[13px] text-[var(--muted)]">
          <div className="font-medium text-[var(--ink)]">What the judge receives</div>
          <p className="mt-2 leading-relaxed">
            After Neuronpedia returns AVs, we fill Mustache from the mapping.
            Defaults that matter for NLA: <code>nla</code>,{" "}
            <code>nla_last_user</code>, <code>nla_first_assistant</code>,{" "}
            <code>prompt</code>, <code>completion</code>, <code>mse</code>,{" "}
            <code>token</code>, <code>reference</code>.
          </p>
          <p className="mt-3 leading-relaxed">
            Attach this evaluator on Run experiment. Compare two experiments (e.g.
            Llama vs Gemma) to get the bar chart.
          </p>
        </div>
      </div>
    </div>
  );
}
