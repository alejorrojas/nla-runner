"use client";

import { PageHeader } from "@/components/page-chrome";
import { useKeys } from "@/lib/keys";

export default function SettingsPage() {
  const { keys, setKeys } = useKeys();
  const ready = Boolean(keys.openai && keys.neuronpedia);

  return (
    <div>
      <PageHeader
        crumb="Keys"
        title="Session keys"
        hint="OpenAI and Neuronpedia stay in this tab. Runs persist on the server."
      />
      <div className="mx-auto max-w-xl p-6">
        <div className="surface rounded-lg p-5">
          <p className="text-[13px] leading-relaxed text-[var(--muted)]">
            Sent as request headers to the Next.js proxy. Not written to disk,
            git, or Supabase. Datasets and experiment rows live in Postgres.
          </p>
          <div
            className={`mt-4 inline-flex rounded-full px-2 py-0.5 font-mono text-[11px] ${
              ready
                ? "bg-[#e7f3ef] text-[var(--residue)]"
                : "bg-[#fff1e8] text-[var(--copper)]"
            }`}
          >
            {ready ? "both keys set" : "missing a key"}
          </div>
          <label className="mt-6 block text-[12px] text-[var(--muted)]">
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
      </div>
    </div>
  );
}
