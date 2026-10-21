import { cn } from "@/lib/utils/cn";
import { InputHTMLAttributes, forwardRef } from "react";

export const Input = forwardRef<HTMLInputElement, InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        "flex h-10 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-brand-950 placeholder:text-brand-700/40 disabled:cursor-not-allowed disabled:bg-surface-muted",
        className,
      )}
      {...props}
    />
  ),
);

Input.displayName = "Input";
