import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[13px] font-medium leading-none",
  {
    variants: {
      tone: {
        default: "bg-[var(--sand)] text-[var(--ink)]",
        accent:
          "bg-[color-mix(in_srgb,var(--clay)_16%,transparent)] text-[var(--clay)]",
        muted: "bg-[var(--hover)] text-[var(--muted)]",
        danger:
          "bg-[color-mix(in_srgb,var(--destructive)_12%,transparent)] text-destructive",
      },
    },
    defaultVariants: {
      tone: "default",
    },
  },
);

function Badge({
  className,
  tone,
  ...props
}: React.ComponentProps<"span"> & VariantProps<typeof badgeVariants>) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ tone }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
