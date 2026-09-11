import { createClient, type SupabaseClient } from "@supabase/supabase-js";

function projectUrl(): string | undefined {
  return process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
}

/** Browser / public components. Same privileges as the legacy anon key. */
export function createPublishableClient(): SupabaseClient | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
  if (!url || !key) return null;
  return createClient(url, key);
}

/** Server-only. Bypasses RLS. Replaces the legacy service_role JWT. */
export function createSecretClient(): SupabaseClient | null {
  const url = projectUrl();
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
