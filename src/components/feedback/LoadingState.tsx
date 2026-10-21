export function LoadingState({ label = "Loading…" }: { label?: string }) {
  return (
    <div
      className="flex min-h-[160px] items-center justify-center rounded-xl border border-dashed border-surface-border bg-white/70 px-4 py-8 text-sm text-brand-800/70"
      role="status"
      aria-live="polite"
    >
      {label}
    </div>
  );
}
