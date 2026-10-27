"use client";

import { Alert } from "@/components/feedback/Alert";
import { PageHeader } from "@/components/data-display/PageHeader";
import { apiRequest } from "@/lib/api/client";
import { formatCad } from "@/lib/formatting/currency";
import { ApiError } from "@/types/api";
import type { LabProgress } from "@/types/lab";
import { useEffect, useState, type ReactNode } from "react";

export function StudentProgressView({ actions }: { actions?: ReactNode }) {
  const [progress, setProgress] = useState<LabProgress | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<LabProgress>("/api/lab/progress", { sameOrigin: true })
      .then(setProgress)
      .catch((caught: unknown) => {
        setError(caught instanceof ApiError ? caught.message : "Progress could not be loaded.");
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="My progress"
        description="Only your own solved challenges and points are shown."
        actions={actions}
      />

      {error ? (
        <Alert tone="error" title="Could not load">
          {error}
        </Alert>
      ) : null}

      {!error && progress === null ? <p className="text-sm text-brand-800/70">Loading...</p> : null}

      {progress ? (
        <>
          <div className="overflow-hidden rounded-lg border border-surface-border bg-white shadow-panel">
            <div className="grid divide-y divide-surface-border sm:grid-cols-3 sm:divide-x sm:divide-y-0">
              <div className="p-4">
                <div className="text-sm text-brand-800/70">Total points</div>
                <div className="text-2xl font-semibold text-brand-950">{progress.totalPoints}</div>
              </div>
              <div className="p-4">
                <div className="text-sm text-brand-800/70">Hint cost</div>
                <div className="text-2xl font-semibold text-brand-950">{progress.hintCost}</div>
              </div>
              <div className="p-4">
                <div className="text-sm text-brand-800/70">Challenges solved</div>
                <div className="text-2xl font-semibold text-brand-950">
                  {progress.solvedCount} of {progress.challenges.length}
                </div>
              </div>
            </div>

            <div className="overflow-x-auto border-t border-surface-border">
            <table className="min-w-full text-left text-sm">
              <thead className="bg-surface-muted text-brand-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Challenge</th>
                  <th className="px-4 py-3 text-right font-medium">Points</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody>
                {progress.challenges.map((challenge) => (
                  <tr key={challenge.id} className="border-t border-surface-border">
                    <td className="px-4 py-3">
                      <span className="block font-medium text-brand-950">{challenge.title}</span>
                      <span className="mt-1 block text-brand-800/70">{challenge.description}</span>
                    </td>
                    <td className="px-4 py-3 text-right">{challenge.points}</td>
                    <td className="px-4 py-3">
                      {challenge.solved && challenge.solvedAt
                        ? `Solved ${new Date(challenge.solvedAt).toLocaleDateString("en-CA")}`
                        : "Not solved"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
}
