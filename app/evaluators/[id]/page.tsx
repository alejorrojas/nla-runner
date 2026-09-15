"use client";

import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { EvaluatorEditor } from "@/components/evaluator-editor";
import { PageHeader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { useStore } from "@/lib/store-client";

function EvaluatorEditorSkeleton() {
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
        title={<Skeleton className="h-6 w-48" />}
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" disabled>
              Delete
            </Button>
            <Button type="button" disabled>
              Save
            </Button>
          </div>
        }
      />
      <div className="grid min-h-0 flex-1 bg-[var(--card)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="page-body stack border-r border-[var(--line)]">
          <div className="field">
            <Label>Name</Label>
            <Skeleton className="h-8 w-full" />
          </div>
          <div className="stack">
            <div>
              <div className="section-title">Prompt &amp; Model</div>
              <p className="hint mt-2">
                Type {"{{name}}"} for a mapped variable. Feedback keys become the
                structured JSON the judge must return.
              </p>
            </div>
            <div className="field">
              <Label>OpenAI model</Label>
              <Skeleton className="h-8 w-full" />
            </div>
            <div className="field">
              <Label>Prompt</Label>
              <Skeleton className="h-[280px] w-full" />
            </div>
          </div>
          <div className="stack">
            <div className="section-title">Variable mapping</div>
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        </div>
        <div className="page-body stack">
          <div className="section-title">What the judge receives</div>
          <p className="hint">
            After Neuronpedia returns AVs, we fill Mustache from the mapping.
          </p>
        </div>
      </div>
    </div>
  );
}

export default function EvaluatorEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, save } = useStore();
  const ev = store?.evaluators.find((e) => e.id === id);

  if (!store) return <EvaluatorEditorSkeleton />;
  if (!ev) return <p className="page-body">Evaluator not found.</p>;

  return (
    <EvaluatorEditor
      key={ev.id}
      initial={ev}
      discardLabel="Delete"
      onDiscard={() => {
        void save({
          ...store,
          evaluators: store.evaluators.filter((e) => e.id !== ev.id),
        });
        router.push("/evaluators");
      }}
      onSave={(next) => {
        void save({
          ...store,
          evaluators: store.evaluators.map((e) => (e.id === ev.id ? next : e)),
        });
        router.push("/evaluators");
      }}
    />
  );
}
