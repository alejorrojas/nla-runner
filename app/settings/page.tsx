"use client";

import { PageHeader } from "@/components/page-chrome";
import { useKeys } from "@/lib/keys";

export default function SettingsPage() {
  const { keys, setKeys } = useKeys();
  const ready = Boolean(keys.openai && keys.neuronpedia);

  return (
    <div>
      <PageHeader
        crumb="Personal / Settings"
        title="API keys"
        hint="OpenAI and Neuronpedia stay in this tab. Runs persist on the server."
      />
      <div className="mx-auto max-w-xl page-body">
        <div className="surface stack p-6">
          <p className="hint">
            Sent as request headers to the Next.js proxy. Not written to disk,
            git, or Supabase. Datasets and experiment rows live in Postgres.
          </p>
          <div
            className={`inline-flex w-fit rounded-full px-3 py-1 text-[13px] ${
              ready ? "bg-[var(--active)]" : "bg-[var(--hover)] text-[var(--muted)]"
            }`}
          >
            {ready ? "both keys set" : "missing a key"}
          </div>
          <label className="field">
            OpenAI
            <input
              className="font-mono"
              type="password"
              value={keys.openai}
              onChange={(e) => setKeys({ ...keys, openai: e.target.value })}
              placeholder="sk-..."
            />
          </label>
          <label className="field">
            Neuronpedia
            <input
              className="font-mono"
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
