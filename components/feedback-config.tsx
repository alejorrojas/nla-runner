"use client";

import { Info, Plus, Trash2 } from "lucide-react";
import { useState } from "react";
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
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";
import type { FeedbackCategory, FeedbackField, FeedbackKind } from "@/lib/types";

function categoriesOf(field: FeedbackField): FeedbackCategory[] {
  if (field.categories?.length) return field.categories;
  return [{ name: "category", description: "" }];
}

function withKind(field: FeedbackField, kind: FeedbackKind): FeedbackField {
  switch (kind) {
    case "boolean":
      return { ...field, kind };
    case "continuous":
      return {
        ...field,
        kind,
        min: field.min ?? 1,
        max: field.max ?? 10,
      };
    case "categorical":
      return { ...field, kind, categories: categoriesOf(field) };
    default: {
      const _never: never = kind;
      return _never;
    }
  }
}

function FormatFields({
  field,
  onChange,
}: {
  field: FeedbackField;
  onChange: (next: FeedbackField) => void;
}) {
  switch (field.kind) {
    case "boolean":
      return (
        <div className="rounded-lg border border-[var(--line)] bg-[var(--hover)] px-4 py-3 text-[13px] leading-relaxed text-[var(--muted)]">
          The evaluator will provide a <span className="font-medium text-[var(--ink)]">true (1)</span>{" "}
          or <span className="font-medium text-[var(--ink)]">false (0)</span> response based on the
          feedback criteria.
        </div>
      );
    case "continuous":
      return (
        <div className="grid gap-5 sm:grid-cols-2">
          <div className="field">
            <Label htmlFor="feedback-min">Min</Label>
            <Input
              id="feedback-min"
              type="number"
              value={field.min ?? 1}
              onChange={(e) =>
                onChange({ ...field, min: Number(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <Label htmlFor="feedback-min-desc">Description for minimum value</Label>
            <Input
              id="feedback-min-desc"
              value={field.minDescription ?? ""}
              onChange={(e) =>
                onChange({ ...field, minDescription: e.target.value })
              }
            />
          </div>
          <div className="field">
            <Label htmlFor="feedback-max">Max</Label>
            <Input
              id="feedback-max"
              type="number"
              value={field.max ?? 10}
              onChange={(e) =>
                onChange({ ...field, max: Number(e.target.value) })
              }
            />
          </div>
          <div className="field">
            <Label htmlFor="feedback-max-desc">Description for maximum value</Label>
            <Input
              id="feedback-max-desc"
              value={field.maxDescription ?? ""}
              onChange={(e) =>
                onChange({ ...field, maxDescription: e.target.value })
              }
            />
          </div>
        </div>
      );
    case "categorical": {
      const cats = categoriesOf(field);
      return (
        <div className="stack">
          <div className="grid grid-cols-[1fr_1fr_auto] gap-3 text-[13px] text-[var(--muted)]">
            <span>Category</span>
            <span>Description</span>
            <span />
          </div>
          <div className="flex flex-col gap-3">
            {cats.map((cat, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-3"
              >
                <Input
                  value={cat.name}
                  onChange={(e) => {
                    const categories = cats.map((c, j) =>
                      j === i ? { ...c, name: e.target.value } : c,
                    );
                    onChange({ ...field, categories });
                  }}
                />
                <Input
                  value={cat.description}
                  onChange={(e) => {
                    const categories = cats.map((c, j) =>
                      j === i ? { ...c, description: e.target.value } : c,
                    );
                    onChange({ ...field, categories });
                  }}
                />
                <Button
                  variant="ghost"
                  size="icon-sm"
                  type="button"
                  aria-label="Remove category"
                  disabled={cats.length <= 1}
                  onClick={() =>
                    onChange({
                      ...field,
                      categories: cats.filter((_, j) => j !== i),
                    })
                  }
                >
                  <Trash2 />
                </Button>
              </div>
            ))}
          </div>
          <Button
            variant="ghost"
            className="w-fit text-[var(--muted)]"
            type="button"
            onClick={() =>
              onChange({
                ...field,
                categories: [...cats, { name: "", description: "" }],
              })
            }
          >
            <Plus />
            Add category
          </Button>
        </div>
      );
    }
    default: {
      const _never: never = field.kind;
      return _never;
    }
  }
}

export function FeedbackConfig({
  feedback,
  onChange,
}: {
  feedback: FeedbackField[];
  onChange: (next: FeedbackField[]) => void;
}) {
  const [selected, setSelected] = useState(0);
  const [advanced, setAdvanced] = useState(false);
  const i = Math.min(selected, Math.max(0, feedback.length - 1));
  const field = feedback[i];

  function setField(next: FeedbackField) {
    onChange(feedback.map((f, j) => (j === i ? next : f)));
  }

  if (!field) return null;

  return (
    <div className="stack">
      <div>
        <div className="section-title">Feedback Configuration</div>
        <p className="hint mt-2">
          Define the score fields the judge returns. Name each metric, describe
          what it measures, then pick a response format.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        {feedback.map((f, j) => (
          <Button
            key={j}
            type="button"
            variant={j === i ? "secondary" : "ghost"}
            className={cn(
              j === i
                ? "bg-[var(--active)] text-[var(--ink)]"
                : "text-[var(--muted)]",
            )}
            onClick={() => setSelected(j)}
          >
            {f.key || "untitled"}
          </Button>
        ))}
        <Button
          variant="ghost"
          className="text-[var(--muted)]"
          type="button"
          onClick={() => {
            onChange([
              ...feedback,
              {
                key: "metric",
                description: "",
                kind: "boolean",
                includeReasoning: true,
              },
            ]);
            setSelected(feedback.length);
          }}
        >
          <Plus />
          Add metric
        </Button>
      </div>

      <div className="field max-w-xs">
        <Label htmlFor="feedback-key">Metric key</Label>
        <Input
          id="feedback-key"
          value={field.key}
          onChange={(e) => {
            const next = feedback.map((item, k) =>
              k === i ? { ...item, key: e.target.value } : item,
            );
            onChange(next);
          }}
        />
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex h-8 items-center gap-2">
          <Switch
            id="include-reasoning"
            size="sm"
            checked={field.includeReasoning !== false}
            onCheckedChange={(checked) =>
              setField({ ...field, includeReasoning: checked })
            }
          />
          <Label htmlFor="include-reasoning" className="text-[var(--muted)]">
            Include reasoning
          </Label>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="ghost"
                size="icon-xs"
                className="text-[var(--muted)]"
                aria-label="About include reasoning"
              >
                <Info />
              </Button>
            </TooltipTrigger>
            <TooltipContent className="max-w-xs">
              The judge returns a short justification alongside the score.
            </TooltipContent>
          </Tooltip>
        </div>
        <Button
          variant="outline"
          type="button"
          onClick={() => setAdvanced((v) => !v)}
        >
          Advanced
        </Button>
        {feedback.length > 1 ? (
          <Button
            variant="ghost"
            className="text-[var(--muted)]"
            type="button"
            onClick={() => {
              onChange(feedback.filter((_, j) => j !== i));
              setSelected(Math.max(0, i - 1));
            }}
          >
            <Trash2 />
            Remove metric
          </Button>
        ) : null}
      </div>

      {advanced ? (
        <p className="hint">
          The key name is the JSON field the judge returns. Charts plot that
          key.
        </p>
      ) : null}

      <div className="field">
        <Label htmlFor="feedback-description">Description</Label>
        <Textarea
          id="feedback-description"
          className="min-h-[88px]"
          value={field.description}
          onChange={(e) => setField({ ...field, description: e.target.value })}
          placeholder="Is the output concise?"
        />
      </div>

      <div className="field max-w-xs">
        <Label>Response format</Label>
        <Select
          value={field.kind}
          onValueChange={(value) =>
            setField(withKind(field, value as FeedbackKind))
          }
        >
          <SelectTrigger className="w-full">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="boolean">Boolean</SelectItem>
            <SelectItem value="continuous">Score</SelectItem>
            <SelectItem value="categorical">Categorical</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <FormatFields field={field} onChange={setField} />
    </div>
  );
}
