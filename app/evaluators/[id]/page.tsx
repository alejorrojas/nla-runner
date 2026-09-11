"use client";

import { useParams, useRouter } from "next/navigation";
import { PageLoader } from "@/components/page-chrome";
import { EvaluatorEditor } from "@/components/evaluator-editor";
import { useStore } from "@/lib/store-client";

export default function EvaluatorEditorPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { store, save } = useStore();
  const ev = store?.evaluators.find((e) => e.id === id);

  if (!store) return <PageLoader label="Loading evaluator" />;
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
