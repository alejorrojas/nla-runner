import type { Dataset, Experiment } from "@/lib/types";

export function attachedEvaluatorIds(
  dataset: Dataset,
  experiments: Experiment[],
): string[] {
  return [
    ...new Set([
      ...(dataset.evaluatorIds ?? []),
      ...experiments.flatMap((experiment) => experiment.evaluatorIds),
    ]),
  ];
}

export function withDatasetEvaluators(
  dataset: Dataset,
  evaluatorIds: string[],
): Dataset {
  return { ...dataset, evaluatorIds: [...new Set(evaluatorIds)] };
}
