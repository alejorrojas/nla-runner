export const EXP_COLORS = ["#d97757", "#c4785a", "#b08968", "#8a8f6a"] as const;

export function expLetter(i: number): string {
  return String.fromCharCode(65 + (i % 26));
}

export function expColor(i: number): string {
  return EXP_COLORS[i % EXP_COLORS.length];
}
