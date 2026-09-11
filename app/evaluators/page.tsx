"use client";

import Link from "next/link";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { useStore } from "@/lib/store-client";

export default function EvaluatorsPage() {
  const { store, save } = useStore();
  if (!store) return <PageLoader label="Loading judges" />;

  return (
    <div>
      <PageHeader
        crumb="Evaluators"
        title="Evaluators"
        hint="LLM-as-judge on AVs. Same mapping language as the run table."
        action={
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
        }
      />
      <div className="p-6">
        <ul className="surface overflow-hidden rounded-lg">
          {store.evaluators.map((ev) => (
            <li key={ev.id}>
              <Link
                href={`/evaluators/${ev.id}`}
                className="flex items-center justify-between border-b border-[var(--line)] px-4 py-3 last:border-0 hover:bg-[var(--hover)]"
              >
                <span className="font-medium">{ev.name}</span>
                <span className="font-mono text-[12px] text-[var(--muted)]">
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
