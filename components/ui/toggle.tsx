"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Toggle as TogglePrimitive } from "radix-ui";

const toggleVariants = cva(
  "inline-flex h-8 items-center justify-center gap-1.5 rounded-full px-3 text-[13px] font-medium whitespace-nowrap outline-none transition-colors hover:bg-[var(--hover)] focus-visible:border-[var(--clay)] focus-visible:ring-[3px] focus-visible:ring-[var(--clay)]/25 disabled:pointer-events-none disabled:opacity-50 data-[state=on]:bg-[color-mix(in_srgb,var(--clay)_16%,transparent)] data-[state=on]:text-[var(--clay)] [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default: "bg-transparent",
        outline:
          "border border-[var(--line-strong)] bg-[var(--card)] hover:bg-[var(--hover)]",
      },
      size: {
        default: "h-8 px-3",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Toggle({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<typeof TogglePrimitive.Root> &
  VariantProps<typeof toggleVariants>) {
  return (
    <TogglePrimitive.Root
      data-slot="toggle"
      className={cn(toggleVariants({ variant, size }), className)}
      {...props}
    />
  );
}

export { Toggle, toggleVariants };
