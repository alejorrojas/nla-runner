"use client";

import Link from "next/link";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-client";

export default function EvaluatorsPage() {
  const { store, save } = useStore();
  if (!store) return <PageLoader label="Loading judges" />;

  return (
    <div>
      <PageHeader
        crumb="Personal / Evaluators"
        title="Evaluators"
        hint="LLM-as-judge on AVs. Same mapping language as the run table."
        action={
          <Button
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
            + Evaluator
          </Button>
        }
      />
      <div className="page-body">
        <div className="surface overflow-hidden">
          <table className="data-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Model</th>
                <th>Feedback</th>
              </tr>
            </thead>
            <tbody>
              {store.evaluators.map((ev) => (
                <tr key={ev.id}>
                  <td>
                    <Link href={`/evaluators/${ev.id}`} className="font-medium hover:underline">
                      {ev.name}
                    </Link>
                  </td>
                  <td className="font-mono">{ev.openaiModel}</td>
                  <td className="text-[var(--muted)]">
                    {ev.feedback.map((f) => f.key).join(", ")}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
