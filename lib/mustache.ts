export function mustacheVars(template: string): string[] {
  const found = template.matchAll(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g);
  return [...new Set([...found].map((m) => m[1]))];
}

export function renderMustache(
  template: string,
  values: Record<string, string>,
): string {
  return template.replace(/\{\{\s*([a-zA-Z0-9_]+)\s*\}\}/g, (_, key: string) => {
    return values[key] ?? "";
  });
}
