"use client";

import { Alert } from "@/components/feedback/Alert";
import { PageHeader } from "@/components/data-display/PageHeader";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/types/api";
import type { LabLeaderboardRow } from "@/types/lab";
import { useEffect, useState } from "react";

export function LeaderboardView() {
  const [rows, setRows] = useState<LabLeaderboardRow[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<LabLeaderboardRow[]>("/api/admin/leaderboard", { sameOrigin: true })
      .then(setRows)
      .catch((caught: unknown) => {
        setError(caught instanceof ApiError ? caught.message : "Leaderboard could not be loaded.");
      });
  }, []);

  return (
    <div>
      <PageHeader title="Leaderboard" description="Read-only view of student points. Points cannot be changed here." />

      {error ? (
        <Alert tone="error" title="Could not load">
          {error}
        </Alert>
      ) : null}

      {!error && rows === null ? <p className="text-sm text-brand-800/70">Loading...</p> : null}

      {rows && rows.length === 0 ? <p className="text-sm text-brand-800/70">No students yet.</p> : null}

      {rows && rows.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-surface-border bg-white shadow-panel">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-brand-800">
              <tr>
                <th className="px-4 py-3 font-medium">Rank</th>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 text-right font-medium">Challenges solved</th>
                <th className="px-4 py-3 text-right font-medium">Points</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={`${row.rank}-${row.displayName}`} className="border-t border-surface-border">
                  <td className="px-4 py-3">{row.rank}</td>
                  <td className="px-4 py-3 font-medium text-brand-950">{row.displayName}</td>
                  <td className="px-4 py-3 text-right">{row.solvedCount}</td>
                  <td className="px-4 py-3 text-right">{row.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
