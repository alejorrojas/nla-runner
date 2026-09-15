"use client";

import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";
import { Slot } from "radix-ui";

const buttonVariants = cva(
  "inline-flex shrink-0 cursor-pointer items-center justify-center gap-1.5 rounded-full border border-transparent text-[13px] leading-none font-medium tracking-normal whitespace-nowrap transition-colors outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/40 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-3.5",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--clay)] text-[#faf9f5] hover:bg-[var(--accent-hover)]",
        destructive:
          "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20",
        outline:
          "border-[var(--line-strong)] bg-[var(--card)] text-[var(--ink)] hover:bg-[var(--hover)]",
        secondary:
          "bg-secondary text-secondary-foreground hover:bg-secondary/80",
        ghost: "text-[var(--ink)] hover:bg-[var(--hover)]",
        link: "text-[var(--clay)] hover:underline",
        nav: "font-normal text-[var(--ink)] hover:bg-[var(--hover)]",
        inverse: "bg-[#faf9f5] text-[#141413] hover:bg-white",
        inverseOutline:
          "border-white/40 bg-transparent text-white hover:bg-white/10 hover:text-white",
      },
      size: {
        default: "h-8 px-3.5",
        lg: "h-10 px-5",
        icon: "size-8 p-0",
        nav: "h-auto w-full justify-start rounded-xl px-2.5 py-2",
      },
    },
    compoundVariants: [
      {
        variant: "link",
        class: "h-auto min-h-0 rounded-none border-0 px-0 py-0",
      },
    ],
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  },
);

function Button({
  className,
  variant = "default",
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean;
  }) {
  const Comp = asChild ? Slot.Root : "button";
  const resolvedSize =
    variant === "link" ? "default" : variant === "nav" ? "nav" : (size ?? "default");

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={resolvedSize}
      className={cn(buttonVariants({ variant, size: resolvedSize }), className)}
      {...props}
    />
  );
}

export { Button, buttonVariants };
