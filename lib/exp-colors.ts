export const EXP_COLORS = ["#1d4ed8", "#3b82f6", "#60a5fa", "#93c5fd"] as const;

export function expLetter(i: number): string {
  return String.fromCharCode(65 + (i % 26));
}

export function expColor(i: number): string {
  return EXP_COLORS[i % EXP_COLORS.length];
}
