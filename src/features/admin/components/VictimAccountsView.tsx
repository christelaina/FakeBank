"use client";

import { Alert } from "@/components/feedback/Alert";
import { PageHeader } from "@/components/data-display/PageHeader";
import { apiRequest } from "@/lib/api/client";
import { formatCad } from "@/lib/formatting/currency";
import type { LabVictimAccount } from "@/lib/server/admin/victims";
import { ApiError } from "@/types/api";
import { useEffect, useState } from "react";

export function VictimAccountsView() {
  const [victims, setVictims] = useState<LabVictimAccount[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<LabVictimAccount[]>("/api/admin/victims", { sameOrigin: true })
      .then(setVictims)
      .catch((caught: unknown) => {
        setError(caught instanceof ApiError ? caught.message : "Victim accounts could not be loaded.");
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Victim accounts"
        description="Read-only view of the hidden victim accounts linked to each student."
      />

      {error ? (
        <Alert tone="error" title="Could not load">
          {error}
        </Alert>
      ) : null}

      {!error && victims === null ? <p className="text-sm text-brand-800/70">Loading...</p> : null}

      {victims && victims.length === 0 ? (
        <p className="text-sm text-brand-800/70">No victim accounts yet.</p>
      ) : null}

      {victims && victims.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-surface-border bg-white shadow-panel">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-brand-800">
              <tr>
                <th className="px-4 py-3 font-medium">Student</th>
                <th className="px-4 py-3 font-medium">Victim account</th>
                <th className="px-4 py-3 font-medium">Number</th>
                <th className="px-4 py-3 text-right font-medium">Balance</th>
                <th className="px-4 py-3 text-right font-medium">Available</th>
              </tr>
            </thead>
            <tbody>
              {victims.map((row) => (
                <tr key={`${row.victimUserId}-${row.accountId ?? "none"}`} className="border-t border-surface-border">
                  <td className="px-4 py-3">
                    <div className="font-medium text-brand-950">{row.studentDisplayName}</div>
                    <div className="text-brand-800/70">{row.studentEmail}</div>
                  </td>
                  <td className="px-4 py-3">{row.accountName ?? "No account"}</td>
                  <td className="px-4 py-3">{row.maskedNumber ?? "-"}</td>
                  <td className="px-4 py-3 text-right">
                    {row.balance === null ? "-" : formatCad(row.balance)}
                  </td>
                  <td className="px-4 py-3 text-right">
                    {row.availableBalance === null ? "-" : formatCad(row.availableBalance)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
