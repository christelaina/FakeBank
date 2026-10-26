"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { apiRequest } from "@/lib/api/client";
import { ApiError } from "@/types/api";
import { useState, type FormEvent } from "react";

type ClaimResult = {
  challengeId: string;
  points: number;
  alreadySolved: boolean;
};

export function ClaimFlagForm({ challengeId }: { challengeId: string }) {
  const [flag, setFlag] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [solved, setSolved] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const result = await apiRequest<ClaimResult>("/api/lab/claims", {
        method: "POST",
        body: { challengeId, flag: flag.trim() },
        sameOrigin: true,
      });
      setSolved(true);
      setMessage(
        result.alreadySolved
          ? "You already claimed this flag."
          : `Flag accepted. You earned ${result.points} points.`,
      );
    } catch (caught: unknown) {
      setMessage(caught instanceof ApiError ? caught.message : "The flag could not be submitted.");
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-3">
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Input
          value={flag}
          onChange={(event) => setFlag(event.target.value)}
          placeholder="BC2{...}"
          aria-label="Flag"
          disabled={solved || pending}
          required
          className="flex-1"
        />
        <Button type="submit" className="shrink-0" disabled={solved || pending || flag.trim().length === 0}>
          {pending ? "Submitting..." : "Submit flag"}
        </Button>
      </form>
      {message ? (
        <p role="status" className="mt-2 text-sm">
          {message}
        </p>
      ) : null}
    </div>
  );
}
