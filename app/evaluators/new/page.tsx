"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { EvaluatorEditor, blankEvaluator } from "@/components/evaluator-editor";
import { attachedEvaluatorIds, withDatasetEvaluators } from "@/lib/dataset-evaluators";
import { useStore } from "@/lib/store-client";

function NewEvaluatorForm() {
  const router = useRouter();
  const params = useSearchParams();
  const datasetId = params.get("dataset");
  const { store, save } = useStore();
  const [draft] = useState(() => blankEvaluator(crypto.randomUUID()));
  const back = datasetId ? `/datasets/${datasetId}` : "/evaluators";

  return (
    <EvaluatorEditor
      initial={draft}
      discardLabel="Discard"
      saveDisabled={!store}
      onDiscard={() => router.push(back)}
      onSave={(ev) => {
        if (!store) return;
        const datasets = datasetId
          ? store.datasets.map((d) =>
              d.id === datasetId
                ? withDatasetEvaluators(d, [
                    ...attachedEvaluatorIds(
                      d,
                      store.experiments.filter((e) => e.datasetId === d.id),
                    ),
                    ev.id,
                  ])
                : d,
            )
          : store.datasets;
        void save({
          ...store,
          evaluators: [ev, ...store.evaluators],
          datasets,
        });
        router.push(back);
      }}
    />
  );
}

export default function NewEvaluatorPage() {
  return (
    <Suspense>
      <NewEvaluatorForm />
    </Suspense>
  );
}
