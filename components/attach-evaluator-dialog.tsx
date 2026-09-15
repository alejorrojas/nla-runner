"use client";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import type { Evaluator } from "@/lib/types";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import Link from "next/link";
import { Plus } from "lucide-react";

export function AttachEvaluatorDialog({
  open,
  onOpenChange,
  datasetId,
  evaluators,
  attachedIds,
  onAttach,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  datasetId: string;
  evaluators: Evaluator[];
  attachedIds: string[];
  onAttach: (ids: string[]) => void;
}) {
  const available = evaluators.filter((ev) => !attachedIds.includes(ev.id));

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add evaluator</DialogTitle>
          <DialogDescription>
            Create a new judge or attach one you already have.
          </DialogDescription>
        </DialogHeader>
        <Button asChild>
          <Link href={`/evaluators/new?dataset=${datasetId}`}>
            <Plus />
            Create evaluator
          </Link>
        </Button>
        {available.length === 0 ? (
          <p className="hint">
            {evaluators.length === 0
              ? "No evaluators in this workspace yet."
              : "Every evaluator is already on this dataset."}
          </p>
        ) : (
          <div className="stack">
            <div className="section-title">Existing</div>
            {available.map((ev) => (
              <div key={ev.id} className="flex items-center justify-between gap-3">
                <Label className="font-normal text-[var(--ink)]">{ev.name}</Label>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onAttach([...attachedIds, ev.id])}
                >
                  Add
                </Button>
              </div>
            ))}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
