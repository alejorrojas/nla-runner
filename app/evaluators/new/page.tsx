"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { PageLoader } from "@/components/page-chrome";
import { EvaluatorEditor, blankEvaluator } from "@/components/evaluator-editor";
import { useStore } from "@/lib/store-client";

export default function NewEvaluatorPage() {
  const router = useRouter();
  const { store, save } = useStore();
  const [draft] = useState(() => blankEvaluator(crypto.randomUUID()));

  if (!store) return <PageLoader label="Loading evaluator" />;

  return (
    <EvaluatorEditor
      initial={draft}
      discardLabel="Discard"
      onDiscard={() => router.push("/evaluators")}
      onSave={(ev) => {
        void save({ ...store, evaluators: [ev, ...store.evaluators] });
        router.push("/evaluators");
      }}
    />
  );
}
