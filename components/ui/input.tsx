import * as React from "react";
import { cn } from "@/lib/utils";
import { fieldControlClass, fieldRadiusClass } from "@/lib/control-styles";

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        fieldControlClass,
        fieldRadiusClass,
        "h-8 w-full min-w-0 px-3 py-1 file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-[13px] file:font-medium",
        className,
      )}
      {...props}
    />
  );
}

export { Input };
