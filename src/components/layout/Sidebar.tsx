"use client";

import { Navigation } from "@/components/layout/Navigation";
import { cn } from "@/lib/utils/cn";

export function Sidebar({
  open,
  onClose,
}: {
  open?: boolean;
  onClose?: () => void;
}) {
  return (
    <>
      <div
        className={cn(
          "fixed inset-0 z-40 bg-brand-950/30 transition-opacity lg:hidden",
          open ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={onClose}
        aria-hidden={!open}
      />
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-surface-border bg-white px-4 py-5 transition-transform lg:static lg:translate-x-0",
          open ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="mb-6 px-2 lg:hidden">
          <p className="font-display text-lg font-semibold text-brand-900">
            FakeBank
          </p>
          <p className="text-xs text-brand-800/70">Cedar Grove Financial</p>
        </div>
        <Navigation onNavigate={onClose} />
        <div className="mt-auto rounded-lg border border-surface-border bg-surface px-3 py-3 text-xs text-brand-800/70">
          Fictional demo banking interface for authorized cybersecurity training.
        </div>
      </aside>
    </>
  );
}
