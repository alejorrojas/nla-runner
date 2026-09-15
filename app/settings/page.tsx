"use client";

import { useState } from "react";
import { PageHeader } from "@/components/page-chrome";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Skeleton } from "@/components/ui/skeleton";
import { maskStoredKey, useKeys } from "@/lib/keys";

function KeyField({
  id,
  label,
  hint,
  placeholder,
  draft,
  replacing,
  onDraft,
  onReplace,
}: {
  id: string;
  label: string;
  hint: string | null;
  placeholder: string;
  draft: string;
  replacing: boolean;
  onDraft: (value: string) => void;
  onReplace: () => void;
}) {
  const locked = Boolean(hint) && !replacing;
  return (
    <div className="field">
      <div className="flex items-center justify-between gap-3">
        <Label htmlFor={id}>{label}</Label>
        {locked ? (
          <Button type="button" variant="link" onClick={onReplace}>
            Replace key
          </Button>
        ) : null}
      </div>
      <Input
        id={id}
        className="font-mono"
        type="text"
        inputMode="text"
        autoComplete="off"
        autoCorrect="off"
        autoCapitalize="off"
        spellCheck={false}
        data-1p-ignore=""
        data-lpignore="true"
        readOnly={locked}
        value={locked ? maskStoredKey(hint!) : draft}
        onChange={(e) => {
          if (!locked) onDraft(e.target.value);
        }}
        placeholder={placeholder}
      />
    </div>
  );
}

export default function SettingsPage() {
  const { hints, saveKeys, hydrated } = useKeys();
  const [openaiDraft, setOpenaiDraft] = useState("");
  const [neuronpediaDraft, setNeuronpediaDraft] = useState("");
  const [replaceOpenai, setReplaceOpenai] = useState(false);
  const [replaceNeuronpedia, setReplaceNeuronpedia] = useState(false);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  const canSave =
    (replaceOpenai || !hints.openaiHint ? openaiDraft.trim() : "") !== "" ||
    (replaceNeuronpedia || !hints.neuronpediaHint ? neuronpediaDraft.trim() : "") !==
      "";

  async function onSave() {
    setBusy(true);
    setMessage("");
    try {
      await saveKeys({
        openai:
          replaceOpenai || !hints.openaiHint
            ? openaiDraft.trim() || undefined
            : undefined,
        neuronpedia:
          replaceNeuronpedia || !hints.neuronpediaHint
            ? neuronpediaDraft.trim() || undefined
            : undefined,
      });
      setOpenaiDraft("");
      setNeuronpediaDraft("");
      setReplaceOpenai(false);
      setReplaceNeuronpedia(false);
      setMessage("Saved to Vault.");
    } catch (err) {
      setMessage(err instanceof Error ? err.message : String(err));
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <PageHeader
        crumb="Personal / Settings"
        title="API keys"
        hint="Encrypted in Vault for your account. Needed only when you launch a new run."
      />
      <div className="mx-auto max-w-xl page-body">
        <div className="surface stack p-6">
          <p className="hint">
            We will never read your keys. They are stored encrypted used only by
            the server. After you save, the keys cannot be shown again.
          </p>
          {hydrated ? (
            <>
              <KeyField
                id="openai-key"
                label="OpenAI"
                hint={hints.openaiHint}
                placeholder="sk-..."
                draft={openaiDraft}
                replacing={replaceOpenai}
                onDraft={setOpenaiDraft}
                onReplace={() => {
                  setReplaceOpenai(true);
                  setOpenaiDraft("");
                }}
              />
              <KeyField
                id="neuronpedia-key"
                label="Neuronpedia"
                hint={hints.neuronpediaHint}
                placeholder="sk-np-..."
                draft={neuronpediaDraft}
                replacing={replaceNeuronpedia}
                onDraft={setNeuronpediaDraft}
                onReplace={() => {
                  setReplaceNeuronpedia(true);
                  setNeuronpediaDraft("");
                }}
              />
              <div className="flex items-center gap-3">
                <Button type="button" disabled={busy || !canSave} onClick={() => void onSave()}>
                  {busy ? "Saving…" : "Save keys"}
                </Button>
                {message ? (
                  <p className="text-[13px] text-[var(--muted)]">{message}</p>
                ) : null}
              </div>
            </>
          ) : (
            <>
              <div className="field">
                <Label>OpenAI</Label>
                <Skeleton className="h-8 w-full" />
              </div>
              <div className="field">
                <Label>Neuronpedia</Label>
                <Skeleton className="h-8 w-full" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
