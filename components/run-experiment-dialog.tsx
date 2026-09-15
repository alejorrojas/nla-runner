"use client";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { RunProgress, type RunTick } from "@/components/run-progress";
import { KeysRequiredTooltip } from "@/components/keys-required-tooltip";
import { NLA_SOURCES, type Evaluator, type TokenPolicy } from "@/lib/types";

export function RunExperimentDialog({
  open,
  onOpenChange,
  sourceId,
  tokenPolicy,
  evaluatorIds,
  evaluators,
  running,
  log,
  tick,
  onSourceId,
  onTokenPolicy,
  onEvaluatorIds,
  onRun,
  keysReady,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceId: string;
  tokenPolicy: TokenPolicy;
  evaluatorIds: string[];
  evaluators: Evaluator[];
  running: boolean;
  log: string;
  tick: RunTick | null;
  onSourceId: (id: string) => void;
  onTokenPolicy: (policy: TokenPolicy) => void;
  onEvaluatorIds: (ids: string[]) => void;
  onRun: () => void;
  keysReady: boolean;
}) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>New experiment</DialogTitle>
          <DialogDescription>
            Pick a source, token policy, and judges. Progress shows which prompt
            is in flight.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-5">
          <div className="field">
            <Label>NLA source</Label>
            <Select value={sourceId} onValueChange={onSourceId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {NLA_SOURCES.map((s) => (
                  <SelectItem key={s.id} value={s.id}>
                    {s.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="field">
            <Label>Token policy</Label>
            <Select
              value={tokenPolicy}
              onValueChange={(value) => onTokenPolicy(value as TokenPolicy)}
            >
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="last_user">Last user token</SelectItem>
                <SelectItem value="first_assistant">First assistant token</SelectItem>
                <SelectItem value="both">Both</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="field">
            <Label>Evaluators</Label>
            {evaluators.length === 0 ? (
              <p className="hint">Attach an evaluator on the Evaluators tab first.</p>
            ) : (
              <div className="flex flex-col gap-2">
                {evaluators.map((ev) => (
                  <div key={ev.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`run-evaluator-${ev.id}`}
                      checked={evaluatorIds.includes(ev.id)}
                      onCheckedChange={(checked) =>
                        onEvaluatorIds(
                          checked === true
                            ? [...evaluatorIds, ev.id]
                            : evaluatorIds.filter((id) => id !== ev.id),
                        )
                      }
                    />
                    <Label
                      htmlFor={`run-evaluator-${ev.id}`}
                      className="font-normal text-[var(--ink)]"
                    >
                      {ev.name}
                    </Label>
                  </div>
                ))}
              </div>
            )}
          </div>
          {log ? <p className="hint font-mono">{log}</p> : null}
          <RunProgress tick={tick} />
          <div className="flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              disabled={running}
              onClick={() => onOpenChange(false)}
            >
              Cancel
            </Button>
            <KeysRequiredTooltip active={!keysReady}>
              <Button
                type="button"
                disabled={running || !keysReady}
                onClick={onRun}
              >
                {running ? "Running…" : "Run experiment"}
              </Button>
            </KeysRequiredTooltip>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
