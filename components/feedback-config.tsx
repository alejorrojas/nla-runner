"use client";

import { Info, Trash2 } from "lucide-react";
import { useState } from "react";
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
          <label className="field">
            Min
            <input
              type="number"
              value={field.min ?? 1}
              onChange={(e) =>
                onChange({ ...field, min: Number(e.target.value) })
              }
            />
          </label>
          <label className="field">
            Description for minimum value
            <input
              value={field.minDescription ?? ""}
              onChange={(e) =>
                onChange({ ...field, minDescription: e.target.value })
              }
            />
          </label>
          <label className="field">
            Max
            <input
              type="number"
              value={field.max ?? 10}
              onChange={(e) =>
                onChange({ ...field, max: Number(e.target.value) })
              }
            />
          </label>
          <label className="field">
            Description for maximum value
            <input
              value={field.maxDescription ?? ""}
              onChange={(e) =>
                onChange({ ...field, maxDescription: e.target.value })
              }
            />
          </label>
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
                <input
                  value={cat.name}
                  onChange={(e) => {
                    const categories = cats.map((c, j) =>
                      j === i ? { ...c, name: e.target.value } : c,
                    );
                    onChange({ ...field, categories });
                  }}
                />
                <input
                  value={cat.description}
                  onChange={(e) => {
                    const categories = cats.map((c, j) =>
                      j === i ? { ...c, description: e.target.value } : c,
                    );
                    onChange({ ...field, categories });
                  }}
                />
                <button
                  className="rounded-md p-2 text-[var(--muted)] hover:bg-[var(--hover)] hover:text-[var(--ink)]"
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
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            ))}
          </div>
          <button
            className="w-fit text-[13px] font-medium text-[var(--accent)] hover:underline"
            type="button"
            onClick={() =>
              onChange({
                ...field,
                categories: [...cats, { name: "", description: "" }],
              })
            }
          >
            + Category
          </button>
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
    <section className="rounded-xl border border-[var(--line)] p-6">
      <h2 className="section-title">Feedback Configuration</h2>
      <p className="hint mt-2">
        Define your evaluation criteria. Describe what you&apos;re measuring,
        then select a response format. This configuration structures how your
        evaluation results are returned.
      </p>

      <div className="mt-5 flex flex-col gap-5">
        <div className="flex flex-wrap items-center gap-3">
          {feedback.map((f, j) => (
            <label
              key={j}
              className="flex items-center gap-2 text-[13px] font-medium text-[var(--ink)]"
            >
              <input
                type="radio"
                name="feedback-key"
                checked={j === i}
                onChange={() => setSelected(j)}
              />
              <input
                className="w-44"
                value={f.key}
                onChange={(e) => {
                  const next = feedback.map((item, k) =>
                    k === j ? { ...item, key: e.target.value } : item,
                  );
                  onChange(next);
                }}
              />
            </label>
          ))}
          <button
            className="text-[13px] font-medium text-[var(--accent)] hover:underline"
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
            + Criterion
          </button>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center gap-2 text-[13px] text-[var(--ink)]">
            <input
              type="checkbox"
              checked={field.includeReasoning !== false}
              onChange={(e) =>
                setField({ ...field, includeReasoning: e.target.checked })
              }
            />
            Include reasoning
            <span title="The judge returns a short justification alongside the score.">
              <Info className="h-3.5 w-3.5 text-[var(--muted)]" />
            </span>
          </label>
          <button
            className="btn"
            type="button"
            onClick={() => setAdvanced((v) => !v)}
          >
            Advanced
          </button>
        </div>

        {advanced ? (
          <p className="hint">
            The key name is the JSON field the judge returns. Charts plot that
            key.
          </p>
        ) : null}

        <label className="field">
          Description
          <textarea
            className="min-h-[88px]"
            value={field.description}
            onChange={(e) => setField({ ...field, description: e.target.value })}
            placeholder="Is the output concise?"
          />
        </label>

        <label className="field">
          Response Format
          <select
            className="w-48"
            value={field.kind}
            onChange={(e) =>
              setField(withKind(field, e.target.value as FeedbackKind))
            }
          >
            <option value="boolean">Boolean</option>
            <option value="continuous">Score</option>
            <option value="categorical">Categorical</option>
          </select>
        </label>

        <FormatFields field={field} onChange={setField} />
      </div>
    </section>
  );
}
