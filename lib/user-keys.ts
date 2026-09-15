import { createSecretClient } from "@/lib/supabase";

export type KeyHints = {
  openaiHint: string | null;
  neuronpediaHint: string | null;
};

export type UserApiKeys = {
  openai: string;
  neuronpedia: string;
};

function throwIf(error: { message: string } | null): void {
  if (error) throw new Error(error.message);
}

function secretClient() {
  const sb = createSecretClient();
  if (!sb) throw new Error("Supabase secret client missing");
  return sb;
}

function asHints(row: {
  openai_hint?: string | null;
  neuronpedia_hint?: string | null;
} | null): KeyHints {
  return {
    openaiHint: row?.openai_hint || null,
    neuronpediaHint: row?.neuronpedia_hint || null,
  };
}

export async function getUserKeyHints(userId: string): Promise<KeyHints> {
  const sb = secretClient();
  const { data, error } = await sb.rpc("nla_key_hints", { p_user_id: userId });
  throwIf(error);
  const row = Array.isArray(data) ? data[0] : data;
  return asHints(row as { openai_hint?: string | null; neuronpedia_hint?: string | null } | null);
}

export async function saveUserKeys(
  userId: string,
  patch: { openai?: string; neuronpedia?: string },
): Promise<KeyHints> {
  const sb = secretClient();
  const { data, error } = await sb.rpc("nla_save_keys", {
    p_user_id: userId,
    p_openai: patch.openai ?? null,
    p_neuronpedia: patch.neuronpedia ?? null,
  });
  throwIf(error);
  const row = Array.isArray(data) ? data[0] : data;
  return asHints(row as { openai_hint?: string | null; neuronpedia_hint?: string | null } | null);
}

export async function readUserKeys(userId: string): Promise<UserApiKeys | null> {
  const sb = secretClient();
  const { data, error } = await sb.rpc("nla_read_keys", { p_user_id: userId });
  throwIf(error);
  const row = (Array.isArray(data) ? data[0] : data) as
    | { openai?: string | null; neuronpedia?: string | null }
    | null;
  const openai = row?.openai?.trim() || "";
  const neuronpedia = row?.neuronpedia?.trim() || "";
  if (!openai && !neuronpedia) return null;
  return { openai, neuronpedia };
}
