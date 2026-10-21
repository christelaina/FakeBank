"use client";

import { Alert } from "@/components/feedback/Alert";
import { SafeText } from "@/components/SafeText";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { updateProfile } from "@/lib/api/profile";
import type { UserProfile } from "@/types/banking";
import { ApiError } from "@/types/api";
import { FormEvent, useState } from "react";

export function ProfileForm({ initialProfile }: { initialProfile: UserProfile }) {
  const [profile, setProfile] = useState(initialProfile);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setSaving(true);
    setMessage(null);
    setError(null);
    try {
      const updated = await updateProfile({
        displayName: profile.displayName,
        phone: profile.phone,
        preferredLanguage: profile.preferredLanguage,
        marketingEmails: profile.marketingEmails,
      });
      setProfile(updated);
      setMessage("Preferences saved for this session (mock or live API response).");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to save profile.");
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      <div className="rounded-lg border border-surface-border bg-surface px-4 py-3">
        <p className="text-xs uppercase tracking-wide text-brand-800/60">
          Display name preview
        </p>
        <SafeText
          as="p"
          className="mt-1 text-lg font-semibold text-brand-950"
          value={profile.displayName}
        />
        <p className="mt-1 text-xs text-brand-800/60">
          User-controlled text is rendered safely and never interpreted as HTML.
        </p>
      </div>

      <div>
        <Label htmlFor="displayName">Display name</Label>
        <Input
          id="displayName"
          value={profile.displayName}
          onChange={(e) =>
            setProfile((current) => ({ ...current, displayName: e.target.value }))
          }
        />
      </div>

      <div>
        <Label htmlFor="email">Email</Label>
        <Input id="email" value={profile.email} disabled readOnly />
      </div>

      <div>
        <Label htmlFor="phone">Phone</Label>
        <Input
          id="phone"
          value={profile.phone}
          onChange={(e) =>
            setProfile((current) => ({ ...current, phone: e.target.value }))
          }
        />
      </div>

      <div>
        <Label htmlFor="language">Preferred language</Label>
        <Select
          id="language"
          value={profile.preferredLanguage}
          onChange={(e) =>
            setProfile((current) => ({
              ...current,
              preferredLanguage: e.target.value as UserProfile["preferredLanguage"],
            }))
          }
        >
          <option value="en-CA">English (Canada)</option>
          <option value="fr-CA">Français (Canada)</option>
        </Select>
      </div>

      <label className="flex items-center gap-2 text-sm">
        <input
          type="checkbox"
          checked={profile.marketingEmails}
          onChange={(e) =>
            setProfile((current) => ({
              ...current,
              marketingEmails: e.target.checked,
            }))
          }
        />
        Receive product updates by email
      </label>

      {message ? <Alert tone="success">{message}</Alert> : null}
      {error ? <Alert tone="error">{error}</Alert> : null}

      <Button type="submit" disabled={saving}>
        {saving ? "Saving…" : "Save preferences"}
      </Button>
    </form>
  );
}
