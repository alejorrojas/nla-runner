export const EXP_COLORS = ["#2bbbad", "#d14d9a", "#4f8cff", "#f0a202"] as const;

export function expLetter(i: number): string {
  return String.fromCharCode(65 + (i % 26));
}

export function expColor(i: number): string {
  return EXP_COLORS[i % EXP_COLORS.length];
}
