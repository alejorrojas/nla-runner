"use client";

import { useLimitedMotion } from "@/components/motion";
import { cn } from "@/lib/utils";

export function Skeleton({
  className,
}: {
  className?: string;
}) {
  const limited = useLimitedMotion();
  return (
    <div
      aria-hidden
      className={cn(
        "rounded-md bg-[var(--hover)]",
        !limited && "animate-pulse",
        className,
      )}
    />
  );
}

export function TableRowsSkeleton({
  rows = 4,
  columns,
}: {
  rows?: number;
  columns: string[];
}) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr key={i}>
          {columns.map((width, j) => (
            <td key={j}>
              <Skeleton className={cn("h-3.5", width)} />
            </td>
          ))}
        </tr>
      ))}
    </>
  );
}
