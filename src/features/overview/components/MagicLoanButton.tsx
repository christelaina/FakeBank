"use client";

import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/types/api";
import { Banknote } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";

export function MagicLoanButton() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setPending(true);
    setError(null);
    try {
      await apiRequest("/api/magic-loan", { method: "POST", sameOrigin: true });
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Magic loan could not be added.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="flex flex-col items-start gap-1">
      <button
        type="button"
        onClick={onClick}
        disabled={pending}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-brand-800 hover:bg-surface-muted disabled:opacity-60"
      >
        <Banknote className="h-4 w-4" />
        {pending ? "Adding..." : "Magic loan"}
      </button>
      {error ? <span className="text-xs text-red-700">{error}</span> : null}
    </div>
  );
}
