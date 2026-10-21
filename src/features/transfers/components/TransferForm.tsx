"use client";

import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { createTransfer } from "@/lib/api/transfers";
import { formatCad } from "@/lib/formatting/currency";
import {
  transferFormSchema,
  type TransferFormValues,
} from "@/lib/validation/transfer";
import type { Account, TransferResult } from "@/types/banking";
import { ApiError } from "@/types/api";
import { FormEvent, useMemo, useState } from "react";

type Step = "edit" | "review" | "result";

export function TransferForm({ accounts }: { accounts: Account[] }) {
  const [step, setStep] = useState<Step>("edit");
  const [values, setValues] = useState<TransferFormValues>({
    sourceAccountId: accounts[0]?.id ?? "",
    destinationAccountId: accounts[1]?.id ?? "",
    amount: 0,
    description: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<TransferResult | null>(null);

  const source = useMemo(
    () => accounts.find((a) => a.id === values.sourceAccountId),
    [accounts, values.sourceAccountId],
  );
  const destination = useMemo(
    () => accounts.find((a) => a.id === values.destinationAccountId),
    [accounts, values.destinationAccountId],
  );

  function validate(): boolean {
    const parsed = transferFormSchema.safeParse(values);
    if (!parsed.success) {
      const next: Record<string, string> = {};
      parsed.error.issues.forEach((issue) => {
        const key = issue.path[0]?.toString() ?? "form";
        next[key] = issue.message;
      });
      setFieldErrors(next);
      return false;
    }
    setFieldErrors({});
    setValues(parsed.data);
    return true;
  }

  function onContinue(event: FormEvent) {
    event.preventDefault();
    setError(null);
    if (validate()) setStep("review");
  }

  async function onConfirm() {
    setSubmitting(true);
    setError(null);
    try {
      const transferResult = await createTransfer({
        sourceAccountId: values.sourceAccountId,
        destinationAccountId: values.destinationAccountId,
        amount: Number(values.amount),
        description: values.description || undefined,
      });
      setResult(transferResult);
      setStep("result");
    } catch (err) {
      const message =
        err instanceof ApiError
          ? err.message
          : "Unable to submit transfer. Please try again.";
      setError(message);
    } finally {
      setSubmitting(false);
    }
  }

  if (step === "result" && result) {
    return (
      <div className="space-y-4">
        <Alert
          tone={
            result.status === "failed"
              ? "error"
              : result.status === "uncertain"
                ? "warning"
                : "success"
          }
          title={`Transfer ${result.status}`}
        >
          <p>{result.message}</p>
          <p className="mt-2">
            Transfer ID: <span className="font-mono">{result.transferId}</span>
          </p>
          {!result.verifiedByBackend ? (
            <p className="mt-2 font-medium">
              Mock response only — this does not prove a real backend transfer occurred.
            </p>
          ) : null}
        </Alert>
        <Button
          onClick={() => {
            setStep("edit");
            setResult(null);
            setValues((current) => ({ ...current, amount: 0, description: "" }));
          }}
        >
          Start another transfer
        </Button>
      </div>
    );
  }

  if (step === "review") {
    return (
      <div className="space-y-4">
        <Alert tone="info" title="Review transfer">
          Confirm the details below. Final balances and authorization are determined by the
          backend when live API mode is enabled.
        </Alert>
        <dl className="grid gap-3 rounded-lg border border-surface-border bg-surface px-4 py-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-brand-800/60">From</dt>
            <dd className="mt-1 font-medium">{source?.name}</dd>
          </div>
          <div>
            <dt className="text-brand-800/60">To</dt>
            <dd className="mt-1 font-medium">{destination?.name}</dd>
          </div>
          <div>
            <dt className="text-brand-800/60">Amount</dt>
            <dd className="mt-1 font-medium">{formatCad(Number(values.amount))}</dd>
          </div>
          <div>
            <dt className="text-brand-800/60">Description</dt>
            <dd className="mt-1 font-medium">{values.description || "—"}</dd>
          </div>
        </dl>
        {error ? <Alert tone="error">{error}</Alert> : null}
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" onClick={() => setStep("edit")} disabled={submitting}>
            Back
          </Button>
          <Button onClick={onConfirm} disabled={submitting}>
            {submitting ? "Submitting…" : "Confirm transfer"}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onContinue} noValidate>
      <div>
        <Label htmlFor="sourceAccountId">Source account</Label>
        <Select
          id="sourceAccountId"
          value={values.sourceAccountId}
          onChange={(e) =>
            setValues((current) => ({ ...current, sourceAccountId: e.target.value }))
          }
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name} ({formatCad(account.availableBalance)} available)
            </option>
          ))}
        </Select>
        {fieldErrors.sourceAccountId ? (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.sourceAccountId}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="destinationAccountId">Destination account</Label>
        <Select
          id="destinationAccountId"
          value={values.destinationAccountId}
          onChange={(e) =>
            setValues((current) => ({
              ...current,
              destinationAccountId: e.target.value,
            }))
          }
        >
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        {fieldErrors.destinationAccountId ? (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.destinationAccountId}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="amount">Amount (CAD)</Label>
        <Input
          id="amount"
          name="amount"
          type="number"
          min="0.01"
          step="0.01"
          value={values.amount || ""}
          onChange={(e) =>
            setValues((current) => ({
              ...current,
              amount: e.target.value === "" ? 0 : Number(e.target.value),
            }))
          }
        />
        {fieldErrors.amount ? (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.amount}</p>
        ) : null}
      </div>

      <div>
        <Label htmlFor="description">Description (optional)</Label>
        <Textarea
          id="description"
          value={values.description ?? ""}
          maxLength={140}
          onChange={(e) =>
            setValues((current) => ({ ...current, description: e.target.value }))
          }
        />
        {fieldErrors.description ? (
          <p className="mt-1 text-xs text-red-700">{fieldErrors.description}</p>
        ) : null}
      </div>

      {error ? <Alert tone="error">{error}</Alert> : null}

      <Button type="submit">Review transfer</Button>
    </form>
  );
}
