"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { EvaluatorEditor, blankEvaluator } from "@/components/evaluator-editor";
import { useStore } from "@/lib/store-client";

export default function NewEvaluatorPage() {
  const router = useRouter();
  const { store, save } = useStore();
  const [draft] = useState(() => blankEvaluator(crypto.randomUUID()));

  return (
    <EvaluatorEditor
      initial={draft}
      discardLabel="Discard"
      saveDisabled={!store}
      onDiscard={() => router.push("/evaluators")}
      onSave={(ev) => {
        if (!store) return;
        void save({ ...store, evaluators: [ev, ...store.evaluators] });
        router.push("/evaluators");
      }}
    />
  );
}
