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
        <div className="rounded-md border border-[#d9e2f2] bg-[#f3f6fb] px-3 py-2.5 text-[13px] leading-relaxed text-[#3d4a5c]">
          The evaluator will provide a <span className="font-medium">true (1)</span>{" "}
          or <span className="font-medium">false (0)</span> response based on the
          feedback criteria.
        </div>
      );
    case "continuous":
      return (
        <div className="grid gap-3 sm:grid-cols-2">
          <label className="text-[13px] text-[#3d4a5c]">
            Min
            <input
              className="mt-1 w-full"
              type="number"
              value={field.min ?? 1}
              onChange={(e) =>
                onChange({ ...field, min: Number(e.target.value) })
              }
            />
          </label>
          <label className="text-[13px] text-[#3d4a5c]">
            Description for minimum value
            <input
              className="mt-1 w-full"
              value={field.minDescription ?? ""}
              onChange={(e) =>
                onChange({ ...field, minDescription: e.target.value })
              }
            />
          </label>
          <label className="text-[13px] text-[#3d4a5c]">
            Max
            <input
              className="mt-1 w-full"
              type="number"
              value={field.max ?? 10}
              onChange={(e) =>
                onChange({ ...field, max: Number(e.target.value) })
              }
            />
          </label>
          <label className="text-[13px] text-[#3d4a5c]">
            Description for maximum value
            <input
              className="mt-1 w-full"
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
        <div>
          <div className="mb-1 grid grid-cols-[1fr_1fr_auto] gap-2 text-[13px] text-[#3d4a5c]">
            <span>Category</span>
            <span>Description</span>
            <span />
          </div>
          <div className="space-y-2">
            {cats.map((cat, i) => (
              <div
                key={i}
                className="grid grid-cols-[1fr_1fr_auto] items-center gap-2"
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
            className="mt-3 text-[13px] font-medium text-[#1a4db3] hover:underline"
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
    <section className="rounded-lg border border-[var(--line)] p-4">
      <h2 className="text-[15px] font-semibold tracking-tight">
        Feedback Configuration
      </h2>
      <p className="mt-1 text-[13px] leading-relaxed text-[var(--muted)]">
        Define your evaluation criteria. Describe what you&apos;re measuring,
        then select a response format. This configuration structures how your
        evaluation results are returned.
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <div className="flex min-w-0 flex-1 flex-wrap items-center gap-2">
          {feedback.map((f, j) => (
            <label
              key={j}
              className="flex items-center gap-2 text-[13px] font-medium"
            >
              <input
                type="radio"
                name="feedback-key"
                checked={j === i}
                onChange={() => setSelected(j)}
              />
              <input
          className="w-40 border-0 bg-transparent px-0 py-0 shadow-none outline-none ring-0"
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
            className="text-[13px] text-[#1a4db3] hover:underline"
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
        <label className="flex items-center gap-2 text-[13px]">
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
        <p className="mt-3 text-[12px] text-[var(--muted)]">
          The key name is the JSON field the judge returns. Charts plot that
          key.
        </p>
      ) : null}

      <label className="mt-4 block text-[13px] text-[#3d4a5c]">
        Description
        <textarea
          className="mt-1 min-h-[72px] w-full"
          value={field.description}
          onChange={(e) => setField({ ...field, description: e.target.value })}
          placeholder="Is the output concise?"
        />
      </label>

      <label className="mt-4 block text-[13px] text-[#3d4a5c]">
        Response Format
        <select
          className="mt-1 w-48"
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

      <div className="mt-4">
        <FormatFields field={field} onChange={setField} />
      </div>
    </section>
  );
}
