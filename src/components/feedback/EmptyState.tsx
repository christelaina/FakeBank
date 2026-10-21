export function EmptyState({
  title,
  description,
}: {
  title: string;
  description?: string;
}) {
  return (
    <div className="rounded-xl border border-dashed border-surface-border bg-white/70 px-6 py-10 text-center">
      <p className="font-medium text-brand-950">{title}</p>
      {description ? (
        <p className="mt-2 text-sm text-brand-800/70">{description}</p>
      ) : null}
    </div>
  );
}
