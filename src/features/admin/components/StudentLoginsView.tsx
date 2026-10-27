"use client";

import { Alert } from "@/components/feedback/Alert";
import { PageHeader } from "@/components/data-display/PageHeader";
import { apiRequest } from "@/lib/api/client";
import type { StudentLogin } from "@/lib/server/admin/student-logins";
import { ApiError } from "@/types/api";
import { useEffect, useState } from "react";

export function StudentLoginsView() {
  const [logins, setLogins] = useState<StudentLogin[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    apiRequest<StudentLogin[]>("/api/admin/student-logins", { sameOrigin: true })
      .then(setLogins)
      .catch((caught: unknown) => {
        setError(caught instanceof ApiError ? caught.message : "Student logins could not be loaded.");
      });
  }, []);

  return (
    <div>
      <PageHeader
        title="Student logins"
        description="Student emails and clear text passwords. Do not share this page with students."
      />

      {error ? (
        <Alert tone="error" title="Could not load">
          {error}
        </Alert>
      ) : null}

      {!error && logins === null ? <p className="text-sm text-brand-800/70">Loading...</p> : null}

      {logins && logins.length === 0 ? (
        <p className="text-sm text-brand-800/70">No student accounts yet.</p>
      ) : null}

      {logins && logins.length > 0 ? (
        <div className="overflow-x-auto rounded-lg border border-surface-border bg-white shadow-panel">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-surface-muted text-brand-800">
              <tr>
                <th className="px-4 py-3 font-medium">Display name</th>
                <th className="px-4 py-3 font-medium">Email</th>
                <th className="px-4 py-3 font-medium">Password</th>
              </tr>
            </thead>
            <tbody>
              {logins.map((row) => (
                <tr key={row.userId} className="border-t border-surface-border">
                  <td className="px-4 py-3">{row.displayName}</td>
                  <td className="px-4 py-3">{row.email}</td>
                  <td className="px-4 py-3 font-mono">{row.password}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : null}
    </div>
  );
}
