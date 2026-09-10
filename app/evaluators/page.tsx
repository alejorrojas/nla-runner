"use client";

import Link from "next/link";
import { useStore } from "@/lib/store-client";

export default function EvaluatorsPage() {
  const { store, save } = useStore();
  if (!store) return <p className="p-8 text-[var(--muted)]">Loading…</p>;

  return (
    <div>
      <div className="border-b border-[var(--line)] bg-[var(--card)] px-5 py-2">
        <div className="crumb">Evaluators</div>
      </div>
      <div className="p-5">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-[20px] font-semibold tracking-tight">Evaluators</h1>
          <p className="mt-1 text-[13px] text-[var(--muted)]">
            LLM-as-judge on NLA verbalizations.
          </p>
        </div>
        <button
          className="btn btn-primary"
          type="button"
          onClick={() => {
            const id = crypto.randomUUID();
            void save({
              ...store,
              evaluators: [
                {
                  id,
                  name: "new_judge",
                  openaiModel: "gpt-4o-mini",
                  prompt:
                    "You grade an NLA verbalization.\n\nNLA:\n{{nla}}\n\nPrompt:\n{{prompt}}",
                  mapping: { nla: "nla", prompt: "prompt" },
                  feedback: [
                    {
                      key: "conciseness",
                      description: "Is the output concise?",
                      kind: "boolean",
                      includeReasoning: true,
                    },
                  ],
                  createdAt: new Date().toISOString(),
                },
                ...store.evaluators,
              ],
            });
          }}
        >
          New LLM judge
        </button>
      </div>
      <ul className="divide-y divide-[var(--line)] overflow-hidden rounded-lg border border-[var(--line)] bg-[var(--card)]">
        {store.evaluators.map((ev) => (
          <li key={ev.id}>
            <Link
              href={`/evaluators/${ev.id}`}
              className="flex items-center justify-between px-4 py-3 hover:bg-[var(--hover)]"
            >
              <span>{ev.name}</span>
              <span className="text-[12px] text-[var(--muted)]">
                {ev.openaiModel} · {ev.feedback.map((f) => f.key).join(", ")}
              </span>
            </Link>
          </li>
        ))}
      </ul>
      </div>
    </div>
  );
}
