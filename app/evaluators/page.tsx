"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import { PageHeader, PageLoader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { useStore } from "@/lib/store-client";

export default function EvaluatorsPage() {
  const { store } = useStore();
  if (!store) return <PageLoader label="Loading judges" />;

  return (
    <div>
      <PageHeader
        crumb="Personal / Evaluators"
        title="Evaluators"
        hint="LLM-as-judge on AVs. New accounts include Example judges (forum theme, names Reddit, article framing). Duplicate or rewrite them."
        action={
          <Button asChild>
            <Link href="/evaluators/new">
              <Plus />
              Evaluator
            </Link>
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
