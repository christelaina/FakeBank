"use client";

import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/types/api";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type Hint = {
  id: string;
  title: string;
  cost: number;
  purchased: boolean;
  steps: string[] | null;
};

export function HintDialog({ onClose }: { onClose: () => void }) {
  const [hints, setHints] = useState<Hint[] | null>(null);
  const [selected, setSelected] = useState<Hint | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    apiRequest<Hint[]>("/api/lab/hints", { sameOrigin: true })
      .then(setHints)
      .catch((caught: unknown) => {
        setError(caught instanceof ApiError ? caught.message : "Walkthroughs could not be loaded.");
      });
  }, []);

  useEffect(() => {
    function onKey(event: KeyboardEvent) {
      if (event.key === "Escape") onClose();
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  async function buy(hint: Hint) {
    setBusy(true);
    setError(null);
    try {
      const result = await apiRequest<{ steps: string[] }>("/api/lab/hints", {
        method: "POST",
        body: { challengeId: hint.id },
        sameOrigin: true,
      });
      const updated = { ...hint, purchased: true, steps: result.steps };
      setSelected(updated);
      setHints((current) => current?.map((item) => (item.id === hint.id ? updated : item)) ?? null);
    } catch (caught: unknown) {
      setError(caught instanceof ApiError ? caught.message : "The walkthrough could not be bought.");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-brand-950/40 p-4">
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="hint-dialog-title"
        className="max-h-[85vh] w-full max-w-lg overflow-y-auto rounded-lg border border-surface-border bg-white p-5 shadow-panel"
      >
        <div className="flex items-start justify-between gap-4">
          <h2 id="hint-dialog-title" className="font-display text-lg font-semibold text-brand-950">
            Hints
          </h2>
          <Button variant="primary" size="md" onClick={onClose} aria-label="Close hints">
            Close
          </Button>
        </div>
        <p className="mt-1 text-sm text-brand-800/70">
          A walkthrough lowers your score by half the challenge points. Your score can go below zero.
        </p>

        {error ? (
          <Alert tone="error" className="mt-4">
            {error}
          </Alert>
        ) : null}

        {hints === null && !error ? <p className="mt-4 text-sm text-brand-800/70">Loading...</p> : null}

        {selected ? (
          <div className="mt-4">
            <h3 className="font-semibold text-brand-950">{selected.title} walkthrough</h3>
            <ol className="mt-2 list-decimal space-y-2 pl-5 text-sm text-brand-950">
              {selected.steps?.map((step) => <li key={step}>{step}</li>)}
            </ol>
            <div className="mt-4 flex justify-end">
              <Button variant="primary" size="md" onClick={() => setSelected(null)}>
                Back to list
              </Button>
            </div>
          </div>
        ) : null}

        {!selected && hints ? (
          <ul className="mt-4 divide-y divide-surface-border rounded-md border border-surface-border">
            {hints.map((hint) => (
              <li key={hint.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <span className="font-medium text-brand-950">{hint.title}</span>
                {hint.purchased ? (
                  <Button variant="secondary" size="sm" onClick={() => setSelected(hint)}>
                    View
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    size="sm"
                    disabled={busy}
                    onClick={() => buy(hint)}
                    aria-label={`Buy ${hint.title} walkthrough for ${hint.cost} points`}
                  >
                    Buy ({hint.cost} pts)
                  </Button>
                )}
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </div>,
    document.body,
  );
}
