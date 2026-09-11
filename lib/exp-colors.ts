export const EXP_COLORS = ["#111111", "#525252", "#8a8a8a", "#c4c4c4"] as const;

export function expLetter(i: number): string {
  return String.fromCharCode(65 + (i % 26));
}

export function expColor(i: number): string {
  return EXP_COLORS[i % EXP_COLORS.length];
}
