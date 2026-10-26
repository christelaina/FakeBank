"use client";

import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { apiRequest } from "@/lib/api/client";
import {
  CHEQUING_NICKNAME,
  CREDIT_NICKNAMES,
  NEW_CREDIT_LIMIT,
  SAVINGS_NICKNAMES,
  SECONDARY_CHEQUING_NAME,
  SECONDARY_CHEQUING_NICKNAME,
  STARTER_ACCOUNT_DOMAIN,
} from "@/lib/config/starter-accounts";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

type Step = "details" | "accounts";

type RegisterFormProps = {
  onBackToSignIn: () => void;
};

export function RegisterForm({ onBackToSignIn }: RegisterFormProps) {
  const router = useRouter();
  const [step, setStep] = useState<Step>("details");
  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [wantsSavings, setWantsSavings] = useState(false);
  const [savingsNickname, setSavingsNickname] = useState<string>(SAVINGS_NICKNAMES[0]);
  const [wantsCredit, setWantsCredit] = useState(false);
  const [creditNickname, setCreditNickname] = useState<string>(CREDIT_NICKNAMES[0]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  function continueToAccounts(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!displayName.trim()) {
      setError("Enter a display name.");
      return;
    }
    if (!normalizedEmail.endsWith(STARTER_ACCOUNT_DOMAIN)) {
      setError(`Use a fake email ending in ${STARTER_ACCOUNT_DOMAIN}. Do not use a real email address.`);
      return;
    }
    if (password.length < 8) {
      setError("Use a password of at least 8 characters. Do not use a real password.");
      return;
    }
    setError(null);
    setStep("accounts");
  }

  async function createAccount(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await apiRequest("/api/auth/register", {
        method: "POST",
        body: {
          displayName: displayName.trim(),
          email: email.trim().toLowerCase(),
          password,
          savingsNickname: wantsSavings ? savingsNickname : null,
          creditNickname: wantsCredit ? creditNickname : null,
        },
        sameOrigin: true,
      });
      router.push("/");
      router.refresh();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Account could not be created.");
      setSubmitting(false);
    }
  }

  if (step === "details") {
    return (
      <>
        <h1 className="font-display text-xl font-semibold text-brand-950">Create a FakeBank account</h1>
        <p className="mt-1 text-sm text-brand-800/70">Fictional training bank.</p>

        <Alert tone="warning" title="Use fake details only">
          Do not use a real email address or a real password. Use a fake email that ends with{" "}
          {STARTER_ACCOUNT_DOMAIN}.
        </Alert>

        <form className="mt-6 space-y-4" onSubmit={continueToAccounts} noValidate>
          <div>
            <Label htmlFor="register-display-name">Display name</Label>
            <Input
              id="register-display-name"
              name="displayName"
              autoComplete="nickname"
              required
              value={displayName}
              onChange={(event) => setDisplayName(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="register-email">Fake email</Label>
            <Input
              id="register-email"
              name="email"
              type="email"
              autoComplete="off"
              placeholder={`you${STARTER_ACCOUNT_DOMAIN}`}
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="register-password">Fake password (8+ characters)</Label>
            <Input
              id="register-password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              value={password}
              onChange={(event) => setPassword(event.target.value)}
            />
          </div>

          {error ? (
            <Alert tone="error" title="Check your details">
              {error}
            </Alert>
          ) : null}

          <Button type="submit" className="w-full">
            Continue
          </Button>
        </form>

        <p className="mt-4 text-center text-sm text-brand-800/70">
          Already have an account?{" "}
          <button type="button" className="font-medium text-brand-700 underline" onClick={onBackToSignIn}>
            Sign in
          </button>
        </p>
      </>
    );
  }

  return (
    <>
      <h1 className="font-display text-xl font-semibold text-brand-950">Set up your accounts</h1>
      <p className="mt-1 text-sm text-brand-800/70">
        Every new customer starts with two chequing accounts. Add more if you want.
      </p>

      <form className="mt-6 space-y-5" onSubmit={createAccount} noValidate>
        <fieldset className="space-y-1 rounded-md border border-surface-border p-3">
          <p className="text-sm font-medium text-brand-950">Everyday Chequing</p>
          <p className="text-xs text-brand-800/70">Included. Nickname: {CHEQUING_NICKNAME}. Opening balance 0.00 CAD.</p>
        </fieldset>

        <fieldset className="space-y-1 rounded-md border border-surface-border p-3">
          <p className="text-sm font-medium text-brand-950">{SECONDARY_CHEQUING_NAME}</p>
          <p className="text-xs text-brand-800/70">Included. Nickname: {SECONDARY_CHEQUING_NICKNAME}. Opening balance 0.00 CAD.</p>
        </fieldset>

        <fieldset className="space-y-2 rounded-md border border-surface-border p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-brand-950">
            <input
              type="checkbox"
              checked={wantsSavings}
              onChange={(event) => setWantsSavings(event.target.checked)}
            />
            High Yield Savings
          </label>
          {wantsSavings ? (
            <div>
              <Label htmlFor="register-savings-nickname">Nickname</Label>
              <select
                id="register-savings-nickname"
                className="mt-1 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm"
                value={savingsNickname}
                onChange={(event) => setSavingsNickname(event.target.value)}
              >
                {SAVINGS_NICKNAMES.map((nickname) => (
                  <option key={nickname} value={nickname}>
                    {nickname}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="space-y-2 rounded-md border border-surface-border p-3">
          <label className="flex items-center gap-2 text-sm font-medium text-brand-950">
            <input
              type="checkbox"
              checked={wantsCredit}
              onChange={(event) => setWantsCredit(event.target.checked)}
            />
            Visa Cashback
          </label>
          <p className="text-xs text-brand-800/70">
            Opens with a {NEW_CREDIT_LIMIT.toLocaleString("en-CA", { minimumFractionDigits: 2 })} CAD available limit and no balance owing.
          </p>
          {wantsCredit ? (
            <div>
              <Label htmlFor="register-credit-nickname">Nickname</Label>
              <select
                id="register-credit-nickname"
                className="mt-1 w-full rounded-md border border-surface-border bg-white px-3 py-2 text-sm"
                value={creditNickname}
                onChange={(event) => setCreditNickname(event.target.value)}
              >
                {CREDIT_NICKNAMES.map((nickname) => (
                  <option key={nickname} value={nickname}>
                    {nickname}
                  </option>
                ))}
              </select>
            </div>
          ) : null}
        </fieldset>

        <fieldset className="space-y-1 rounded-md border border-surface-border p-3">
          <p className="text-sm font-medium text-brand-950">Investments</p>
          <p className="text-xs text-brand-800/70">Starts at zero. No holdings are created at sign-up.</p>
        </fieldset>

        {error ? (
          <Alert tone="error" title="Account could not be created">
            {error}
          </Alert>
        ) : null}

        <div className="flex gap-2">
          <Button type="button" variant="secondary" className="flex-1" onClick={() => setStep("details")} disabled={submitting}>
            Back
          </Button>
          <Button type="submit" className="flex-1" disabled={submitting}>
            {submitting ? "Creating account..." : "Create account"}
          </Button>
        </div>
      </form>
    </>
  );
}
