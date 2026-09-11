"use client";

import { useKeys } from "@/lib/keys";

export default function SettingsPage() {
  const { keys, setKeys } = useKeys();

  return (
    <div className="mx-auto max-w-xl p-8">
      <div className="crumb mb-4">Settings</div>
      <h1 className="text-[20px] font-semibold tracking-tight">API keys</h1>
      <p className="mt-2 text-[13px] leading-relaxed text-[var(--muted)]">
        Stored in this tab&apos;s session only. Sent as request headers to the
        Next.js proxy. Not written to disk, git, or Supabase. Datasets and
        experiment runs persist in Supabase tables (server-side). Add
        <code className="mx-1">SUPABASE_URL</code> and
        <code className="mx-1">SUPABASE_SERVICE_ROLE_KEY</code> on Vercel.
      </p>
      <label className="mt-8 block text-[12px] text-[var(--muted)]">
        OpenAI
        <input
          className="mt-1 w-full font-mono text-[13px]"
          type="password"
          value={keys.openai}
          onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
          placeholder="sk-..."
        />
      </label>
      <label className="mt-4 block text-[12px] text-[var(--muted)]">
        Neuronpedia
        <input
          className="mt-1 w-full font-mono text-[13px]"
          type="password"
          value={keys.neuronpedia}
          onChange={(e) => setKeys({ ...keys, neuronpedia: e.target.value })}
          placeholder="x-api-key from neuronpedia.org"
        />
      </label>
    </div>
  );
}
