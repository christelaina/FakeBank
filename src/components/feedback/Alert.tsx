import { cn } from "@/lib/utils/cn";
import { AlertCircle, CheckCircle2, Info, TriangleAlert } from "lucide-react";
import { HTMLAttributes } from "react";

const styles = {
  info: {
    wrap: "border-sky-200 bg-sky-50 text-sky-950",
    icon: Info,
  },
  success: {
    wrap: "border-emerald-200 bg-emerald-50 text-emerald-950",
    icon: CheckCircle2,
  },
  warning: {
    wrap: "border-amber-200 bg-amber-50 text-amber-950",
    icon: TriangleAlert,
  },
  error: {
    wrap: "border-red-200 bg-red-50 text-red-950",
    icon: AlertCircle,
  },
} as const;

export function Alert({
  tone = "info",
  className,
  children,
  title,
  ...props
}: HTMLAttributes<HTMLDivElement> & {
  tone?: keyof typeof styles;
  title?: string;
}) {
  const Icon = styles[tone].icon;
  return (
    <div
      role="alert"
      className={cn(
        "flex gap-3 rounded-lg border px-4 py-3 text-sm",
        styles[tone].wrap,
        className,
      )}
      {...props}
    >
      <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
      <div>
        {title ? <p className="font-semibold">{title}</p> : null}
        <div className={title ? "mt-1" : undefined}>{children}</div>
      </div>
    </div>
  );
}
