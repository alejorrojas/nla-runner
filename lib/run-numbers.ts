import type { Experiment } from "@/lib/types";

export function runNumberMap(experiments: Experiment[]): Map<string, number> {
  const byDataset = new Map<string, Experiment[]>();
  for (const experiment of experiments) {
    const list = byDataset.get(experiment.datasetId) ?? [];
    list.push(experiment);
    byDataset.set(experiment.datasetId, list);
  }
  const numbers = new Map<string, number>();
  for (const list of byDataset.values()) {
    const used = new Set<number>();
    for (const experiment of list) {
      if (experiment.runNumber == null) continue;
      numbers.set(experiment.id, experiment.runNumber);
      used.add(experiment.runNumber);
    }
    [...list]
      .filter((experiment) => experiment.runNumber == null)
      .sort(
        (a, b) =>
          a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id),
      )
      .forEach((experiment) => {
        let n = 1;
        while (used.has(n)) n += 1;
        numbers.set(experiment.id, n);
        used.add(n);
      });
  }
  return numbers;
}

export function nextRunNumber(
  experiments: Experiment[],
  datasetId: string,
): number {
  const peers = experiments.filter((e) => e.datasetId === datasetId);
  const used = [...runNumberMap(peers).values()];
  return (used.length ? Math.max(...used) : 0) + 1;
}

export function assignMissingRunNumbers(
  experiments: Experiment[],
): Experiment[] {
  const numbers = runNumberMap(experiments);
  return experiments.map((experiment) =>
    experiment.runNumber != null
      ? experiment
      : { ...experiment, runNumber: numbers.get(experiment.id) ?? 1 },
  );
}

export function runTag(n: number): string {
  return `#${n}`;
}

export function runChartLabel(n: number, name: string): string {
  return `${runTag(n)}: ${name}`;
}

export function shortenRunLabel(label: string, max = 16): string {
  if (label.length <= max) return label;
  return `${label.slice(0, Math.max(1, max - 1))}…`;
}
