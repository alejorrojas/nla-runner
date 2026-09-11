"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, PageLoader } from "@/components/page-chrome";
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

  if (!store) return <PageLoader label="Loading evaluator" />;
  if (!ev) return <p className="page-body">Evaluator not found.</p>;

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
    <div className="flex min-h-full flex-col">
      <PageHeader
        crumb={
          <>
            <Link href="/evaluators">Evaluators</Link>
            <span> / </span>
            <span className="text-[var(--ink)]">Configure evaluator</span>
          </>
        }
        title={
          <input
            className="title-plain max-w-xl text-[20px] font-medium"
            value={ev.name}
            onChange={(e) => patch({ ...ev, name: e.target.value })}
          />
        }
        action={
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
        }
      />
      <div className="grid min-h-0 flex-1 bg-[var(--card)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="page-body stack border-r border-[var(--line)]">
          <label className="field">
            Name
            <input
              value={ev.name}
              onChange={(e) => patch({ ...ev, name: e.target.value })}
            />
          </label>

          <div className="stack">
            <div>
              <div className="section-title">Prompt &amp; Model</div>
              <p className="hint mt-2">
                Type {"{{name}}"} for a mapped variable. Feedback keys become the
                structured JSON the judge must return.
              </p>
            </div>
            <label className="field">
              OpenAI model
              <select
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
            <label className="field">
              Prompt
              <textarea
                className="min-h-[280px] font-mono leading-relaxed"
                value={ev.prompt}
                onChange={(e) => patch({ ...ev, prompt: e.target.value })}
              />
            </label>
          </div>

          <div className="stack">
            <div className="section-title">Variable mapping</div>
            {placeholders.length === 0 ? (
              <p className="hint">No {"{{vars}}"} in the prompt yet.</p>
            ) : (
              placeholders.map((ph) => (
                <label key={ph} className="field">
                  <span className="font-mono text-[var(--accent)]">{`{{${ph}}}`}</span>
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

          <FeedbackConfig
            feedback={ev.feedback}
            onChange={(feedback) => patch({ ...ev, feedback })}
          />
        </div>
        <div className="page-body stack">
          <div className="section-title">What the judge receives</div>
          <p className="hint">
            After Neuronpedia returns AVs, we fill Mustache from the mapping.
            Defaults that matter for NLA: <code>nla</code>,{" "}
            <code>nla_last_user</code>, <code>nla_first_assistant</code>,{" "}
            <code>prompt</code>, <code>completion</code>, <code>mse</code>,{" "}
            <code>token</code>, <code>reference</code>.
          </p>
          <p className="hint">
            Attach this evaluator on Run experiment. Compare two experiments
            (e.g. Llama vs Gemma) to get the bar chart.
          </p>
        </div>
      </div>
    </div>
  );
}
