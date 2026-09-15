"use client";

import type { ReactNode } from "react";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";

export const KEYS_REQUIRED_HINT =
  "Add your OpenAI and Neuronpedia keys in Settings.";

export function KeysRequiredTooltip({
  active,
  className,
  children,
}: {
  active: boolean;
  className?: string;
  children: ReactNode;
}) {
  if (!active) return <>{children}</>;
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <span className={className ?? "inline-flex"}>{children}</span>
      </TooltipTrigger>
      <TooltipContent side="top">{KEYS_REQUIRED_HINT}</TooltipContent>
    </Tooltip>
  );
}
