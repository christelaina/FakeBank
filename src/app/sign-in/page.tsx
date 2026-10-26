"use client";

import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RegisterForm } from "@/features/auth/components/RegisterForm";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export default function SignInPage() {
  const router = useRouter();
  const [registering, setRegistering] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest("/api/auth/sign-in", {
        method: "POST",
        body: { email, password },
        sameOrigin: true,
      });
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Sign-in could not be completed.");
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-surface-muted px-4">
      <div className="w-full max-w-sm rounded-lg border border-surface-border bg-white p-6 shadow-panel">
        {registering ? (
          <RegisterForm onBackToSignIn={() => setRegistering(false)} />
        ) : (
          <>
            <h1 className="font-display text-xl font-semibold text-brand-950">Sign in to FakeBank</h1>
            <p className="mt-1 text-sm text-brand-800/70">Fictional training bank.</p>

            <form className="mt-6 space-y-4" onSubmit={onSubmit} noValidate>
              <div>
                <Label htmlFor="sign-in-email">Email</Label>
                <Input
                  id="sign-in-email"
                  name="email"
                  type="email"
                  autoComplete="username"
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>
              <div>
                <Label htmlFor="sign-in-password">Password</Label>
                <Input
                  id="sign-in-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              {error ? (
                <Alert tone="error" title="Sign-in failed">
                  {error}
                </Alert>
              ) : null}

              <Button type="submit" className="w-full" disabled={submitting}>
                {submitting ? "Signing in..." : "Sign in"}
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-brand-800/70">
              New user?{" "}
              <button
                type="button"
                className="font-medium text-brand-700 underline"
                onClick={() => {
                  setError(null);
                  setRegistering(true);
                }}
              >
                Create an account
              </button>
            </p>
          </>
        )}
      </div>
    </main>
  );
}
