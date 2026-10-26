"use client";

import { useRouter } from "next/navigation";
import { type FormEvent, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LabFlagBanner } from "@/features/lab/components/LabFlagBanner";

export function CryptoCheckForm() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [flag, setFlag] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const response = await fetch("/api/lab/challenges/crypto/check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });
      const body = await response.json().catch(() => null);
      if (!response.ok) {
        setError(body?.message ?? "The check could not be completed.");
        return;
      }
      setFlag(body.data.flag as string);
    } catch {
      setError("The check could not be completed.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button type="button" variant="secondary" onClick={() => router.back()}>
        Go back
      </Button>

      {flag ? <LabFlagBanner challengeId="crypto" flag={flag} /> : null}

      <Card>
        <CardHeader>
          <CardTitle>Check a decrypted password</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1">
              <Label htmlFor="crypto-username">Username</Label>
              <Input
                id="crypto-username"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                autoComplete="off"
                required
              />
            </div>
            <div className="space-y-1">
              <Label htmlFor="crypto-password">Decrypted password</Label>
              <Input
                id="crypto-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="off"
                required
              />
            </div>
            {error ? <p className="text-sm text-red-700">{error}</p> : null}
            <Button type="submit" disabled={busy}>
              {busy ? "Checking..." : "Check"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
