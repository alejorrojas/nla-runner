export const CATALOG_DATASET_ID = "ds-reddit-pilot";
export const CATALOG_EVALUATOR_ID = "ev-reddit";
export const CATALOG_EXPERIMENT_ID = "exp-forum-prior-llama-last-user";

export function siteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_ENV === "production"
      ? "https://nlasmith.com"
      : "http://localhost:3000")
  );
}

export function appUrl(): string {
  return (
    process.env.NEXT_PUBLIC_APP_URL ||
    (process.env.VERCEL_ENV === "production"
      ? "https://app.nlasmith.com"
      : siteUrl())
  );
}

export function isApexHost(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return h === "nlasmith.com" || h === "www.nlasmith.com";
}

export function isAppHost(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return h === "app.nlasmith.com" || h.startsWith("app.");
}

export function isLocalHost(host: string): boolean {
  const h = host.split(":")[0].toLowerCase();
  return h === "localhost" || h === "127.0.0.1";
}

export function toAppPath(path: string): string {
  const base = appUrl().replace(/\/$/, "");
  if (base.includes("localhost") || base.includes("127.0.0.1")) return path;
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${base}${suffix}`;
}
