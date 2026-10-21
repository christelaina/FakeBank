import { cn } from "@/lib/utils/cn";
import { TextareaHTMLAttributes, forwardRef } from "react";

export const Textarea = forwardRef<
  HTMLTextAreaElement,
  TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      "flex min-h-[96px] w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm text-brand-950 placeholder:text-brand-700/40 disabled:cursor-not-allowed disabled:bg-surface-muted",
      className,
    )}
    {...props}
  />
));

Textarea.displayName = "Textarea";
