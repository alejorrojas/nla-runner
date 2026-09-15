"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader } from "@/components/page-chrome";
import { FeedbackConfig } from "@/components/feedback-config";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { mustacheVars } from "@/lib/mustache";
import { JUDGE_VARS, type Evaluator, type JudgeVar } from "@/lib/types";
import { KeysRequiredTooltip } from "@/components/keys-required-tooltip";
import { useKeys } from "@/lib/keys";

function OpenAIModelSelect({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const { hints, hydrated } = useKeys();
  const needsKey = hydrated && !hints.openaiHint;
  const [models, setModels] = useState<string[]>([]);
  const [status, setStatus] = useState<"loading" | "ready" | "error">("loading");

  useEffect(() => {
    if (!hydrated) return;
    if (needsKey) {
      setStatus("error");
      return;
    }
    let cancelled = false;
    void (async () => {
      try {
        const res = await fetch("/api/openai/models");
        const body = (await res.json()) as { models?: string[]; error?: string };
        if (!res.ok) throw new Error(body.error || "Could not load models");
        if (cancelled) return;
        setModels(body.models ?? []);
        setStatus("ready");
      } catch {
        if (cancelled) return;
        setStatus("error");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [hydrated, needsKey]);

  const options = models.includes(value)
    ? models
    : value
      ? [value, ...models]
      : models;
  const disabled = !hydrated || needsKey || status === "loading";

  return (
    <div className="field">
      <Label>OpenAI model</Label>
      <KeysRequiredTooltip active={needsKey} className="block w-full">
        <Select value={value} onValueChange={onChange} disabled={disabled}>
          <SelectTrigger className="w-full">
            <SelectValue
              placeholder={status === "loading" && !needsKey ? "Loading models…" : "Select a model"}
            />
          </SelectTrigger>
          <SelectContent className="max-h-72">
            {options.map((model) => (
              <SelectItem key={model} value={model}>
                {model}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </KeysRequiredTooltip>
    </div>
  );
}

export function EvaluatorEditor({
  initial,
  onSave,
  onDiscard,
  discardLabel,
  saveDisabled = false,
}: {
  initial: Evaluator;
  onSave: (ev: Evaluator) => void;
  onDiscard: () => void;
  discardLabel: string;
  saveDisabled?: boolean;
}) {
  const [ev, setEv] = useState<Evaluator>(initial);
  const placeholders = mustacheVars(ev.prompt);

  function patch(next: Evaluator) {
    setEv(next);
  }

  return (
    <div className="flex min-h-full flex-col">
      <PageHeader
        crumb={
          <>
            <Link href="/evaluators">Evaluators</Link>
            <span> / </span>
            <span className="text-[var(--ink)]">Configure evaluator</span>
          </>
        }
        title={
          <Input
            className="title-plain h-auto max-w-xl border-0 p-0 text-[20px] font-medium shadow-none focus-visible:ring-0"
            value={ev.name}
            onChange={(e) => patch({ ...ev, name: e.target.value })}
          />
        }
        action={
          <div className="flex items-center gap-2">
            <Button variant="outline" type="button" onClick={onDiscard}>
              {discardLabel}
            </Button>
            <Button type="button" disabled={saveDisabled} onClick={() => onSave(ev)}>
              Save
            </Button>
          </div>
        }
      />
      <div className="grid min-h-0 flex-1 bg-[var(--card)] lg:grid-cols-[1.2fr_0.8fr]">
        <div className="page-body stack border-r border-[var(--line)]">
          <div className="field">
            <Label htmlFor="evaluator-name">Name</Label>
            <Input
              id="evaluator-name"
              value={ev.name}
              onChange={(e) => patch({ ...ev, name: e.target.value })}
            />
          </div>

          <div className="stack">
            <div>
              <div className="section-title">Prompt &amp; Model</div>
              <p className="hint mt-2">
                Type {"{{name}}"} for a mapped variable. Feedback keys become the
                structured JSON the judge must return.
              </p>
            </div>
            <OpenAIModelSelect
              value={ev.openaiModel}
              onChange={(openaiModel) => patch({ ...ev, openaiModel })}
            />
            <div className="field">
              <Label htmlFor="evaluator-prompt">Prompt</Label>
              <Textarea
                id="evaluator-prompt"
                className="min-h-[280px] font-mono leading-relaxed"
                value={ev.prompt}
                onChange={(e) => patch({ ...ev, prompt: e.target.value })}
              />
            </div>
          </div>

          <div className="stack">
            <div className="section-title">Variable mapping</div>
            {placeholders.length === 0 ? (
              <p className="hint">No {"{{vars}}"} in the prompt yet.</p>
            ) : (
              placeholders.map((ph) => (
                <div key={ph} className="field">
                  <Label className="font-mono text-[var(--accent)]">{`{{${ph}}}`}</Label>
                  <Select
                    value={ev.mapping[ph] || "__unmapped"}
                    onValueChange={(value) =>
                      patch({
                        ...ev,
                        mapping: {
                          ...ev.mapping,
                          [ph]: (value === "__unmapped" ? "" : value) as JudgeVar,
                        },
                      })
                    }
                  >
                    <SelectTrigger className="w-full">
                      <SelectValue placeholder="(unmapped)" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="__unmapped">(unmapped)</SelectItem>
                      {JUDGE_VARS.map((v) => (
                        <SelectItem key={v} value={v}>
                          {v}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              ))
            )}
          </div>

          <FeedbackConfig
            feedback={ev.feedback}
            onChange={(feedback) => patch({ ...ev, feedback })}
          />
        </div>
        <div className="page-body stack">
          <div className="section-title">What the judge receives</div>
          <p className="hint">
            After Neuronpedia returns AVs, we fill Mustache from the mapping.
            Defaults that matter for NLA: <code>nla</code>,{" "}
            <code>nla_last_user</code>, <code>nla_first_assistant</code>,{" "}
            <code>prompt</code>, <code>completion</code>, <code>mse</code>,{" "}
            <code>token</code>, <code>reference</code>.
          </p>
          <p className="hint">
            Attach this evaluator on Run experiment. Compare two experiments
            (e.g. Llama vs Gemma) to get the bar chart.
          </p>
        </div>
      </div>
    </div>
  );
}

export function blankEvaluator(id: string): Evaluator {
  return {
    id,
    name: "new_judge",
    openaiModel: "gpt-4o-mini",
    prompt: "You grade an NLA verbalization.\n\nNLA:\n{{nla}}\n\nPrompt:\n{{prompt}}",
    mapping: { nla: "nla", prompt: "prompt" },
    feedback: [
      {
        key: "conciseness",
        description: "Is the output concise?",
        kind: "boolean",
        includeReasoning: true,
      },
    ],
    createdAt: new Date().toISOString(),
  };
}
