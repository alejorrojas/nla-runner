"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { PageHeader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useKeys } from "@/lib/keys";

function KeyField({
  id,
  label,
  value,
  onChange,
  placeholder,
}: {
  id: string;
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
}) {
  const [hidden, setHidden] = useState(true);

  return (
    <div className="field">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          className={`pr-10 font-mono ${hidden ? "key-masked" : ""}`}
          type="text"
          inputMode="text"
          autoComplete="off"
          autoCorrect="off"
          autoCapitalize="off"
          spellCheck={false}
          data-1p-ignore=""
          data-lpignore="true"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon-xs"
          className="absolute top-1/2 right-2 -translate-y-1/2 text-[var(--muted)]"
          aria-label={hidden ? "Show key" : "Hide key"}
          onClick={() => setHidden((v) => !v)}
        >
          {hidden ? <Eye /> : <EyeOff />}
        </Button>
      </div>
    </div>
  );
}

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
          <KeyField
            id="openai-key"
            label="OpenAI"
            value={keys.openai}
            onChange={(openai) => setKeys({ ...keys, openai })}
            placeholder="sk-..."
          />
          <KeyField
            id="neuronpedia-key"
            label="Neuronpedia"
            value={keys.neuronpedia}
            onChange={(neuronpedia) => setKeys({ ...keys, neuronpedia })}
            placeholder="x-api-key from neuronpedia.org"
          />
        </div>
      </div>
    </div>
  );
}
