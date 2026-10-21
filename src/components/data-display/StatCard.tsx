import { Card, CardContent } from "@/components/ui/card";
import { ReactNode } from "react";

export function StatCard({
  label,
  value,
  hint,
  icon,
}: {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
}) {
  return (
    <Card>
      <CardContent className="flex items-start justify-between gap-3 py-5">
        <div>
          <p className="text-sm text-brand-800/70">{label}</p>
          <p className="mt-2 font-display text-2xl font-semibold tracking-tight text-brand-950">
            {value}
          </p>
          {hint ? <p className="mt-2 text-xs text-brand-800/60">{hint}</p> : null}
        </div>
        {icon ? (
          <div className="rounded-lg bg-brand-50 p-2 text-brand-700">{icon}</div>
        ) : null}
      </CardContent>
    </Card>
  );
}
