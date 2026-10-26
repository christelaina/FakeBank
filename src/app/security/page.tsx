"use client";

import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import { LoadingState } from "@/components/feedback/LoadingState";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { getSecurityActivity } from "@/lib/api/security";
import { formatCanadianDateTime } from "@/lib/formatting/currency";
import type { SecurityActivity } from "@/types/banking";
import { ApiError } from "@/types/api";
import { FormEvent, useEffect, useState } from "react";

export default function SecurityPage() {
  const [activity, setActivity] = useState<SecurityActivity | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    getSecurityActivity()
      .then((data) => {
        if (!cancelled) setActivity(data);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err instanceof ApiError ? err.message : "Unable to load security activity.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  function onPasswordSubmit(event: FormEvent) {
    event.preventDefault();
    setPasswordMessage(
      "Password change UI prototype only. No credentials are stored or transmitted by this form.",
    );
  }

  return (
    <div>
      <PageHeader
        title="Security Center"
        description="Sign-in activity and security notifications for your account."
      />

      {error ? (
        <Alert tone="error" title="Security activity unavailable">
          {error}
        </Alert>
      ) : null}

      {!activity && !error ? <LoadingState label="Loading security activity…" /> : null}

      {activity ? (
        <div className="grid gap-6 xl:grid-cols-2">
          <Card>
            <CardHeader>
              <CardTitle>Recent sign-in activity</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.signIns.map((event) => (
                <div
                  key={event.id}
                  className="rounded-lg border border-surface-border px-3 py-3 text-sm"
                >
                  <p className="font-medium">{formatCanadianDateTime(event.occurredAt)}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Security notifications</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              {activity.notifications.map((note) => (
                <div
                  key={note.id}
                  className="rounded-lg border border-surface-border px-3 py-3 text-sm"
                >
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-medium">{note.title}</p>
                    <Badge
                      tone={
                        note.severity === "critical"
                          ? "danger"
                          : note.severity === "warning"
                            ? "warning"
                            : "muted"
                      }
                    >
                      {note.severity}
                    </Badge>
                  </div>
                  <p className="mt-1 text-brand-800/70">{note.body}</p>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Change password</CardTitle>
              <CardDescription>
                Prototype only — does not implement real authentication or password storage.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-3" onSubmit={onPasswordSubmit}>
                <div>
                  <Label htmlFor="current-password">Current password</Label>
                  <Input id="current-password" type="password" autoComplete="current-password" />
                </div>
                <div>
                  <Label htmlFor="new-password">New password</Label>
                  <Input id="new-password" type="password" autoComplete="new-password" />
                </div>
                <div>
                  <Label htmlFor="confirm-password">Confirm new password</Label>
                  <Input id="confirm-password" type="password" autoComplete="new-password" />
                </div>
                <Button type="submit">Update password (mock)</Button>
              </form>
              {passwordMessage ? (
                <Alert className="mt-4" tone="info">
                  {passwordMessage}
                </Alert>
              ) : null}
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  );
}
