import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ProfileForm } from "@/features/profile/components/ProfileForm";
import { ProfilePictureUpload } from "@/features/documents/components/ProfilePictureUpload";
import { LabChooseFileLink } from "@/features/lab/components/LabChooseFileLink";
import { SignOutButton } from "@/components/layout/SignOutButton";
import {
  getProfile,
  getProfileChangeHistory,
} from "@/lib/api/profile";
import { formatCanadianDateTime } from "@/lib/formatting/currency";
import { getEnvironment } from "@/lib/config/environment";
import * as neonProfile from "@/lib/server/profile";
import { ApiError } from "@/types/api";
import { redirect } from "next/navigation";
import { isAuthRequiredError } from "@/lib/server/auth/session";
import { LabFlagBanner } from "@/features/lab/components/LabFlagBanner";
import { isLabEnabled } from "@/lib/lab/config";
import { generateFlag } from "@/lib/lab/flags";
import { hasLabDetection } from "@/lib/server/lab/detections";

export const metadata = {
  title: "Profile and Settings",
};

export default async function ProfilePage() {
  try {
    // Live mode reads Neon directly on the server; mock mode uses the repository layer.
    const [profile, history] = getEnvironment().isLiveMode
      ? await Promise.all([neonProfile.getProfile(), neonProfile.getChangeHistory()])
      : await Promise.all([getProfile(), getProfileChangeHistory()]);

    const showXssFlag =
      isLabEnabled() && getEnvironment().isLiveMode && (await hasLabDetection(profile.id, "xss"));

    return (
      <div>
        <PageHeader
          title="Profile and Settings"
          description="Fictional customer profile and preference controls."
        />

        {showXssFlag ? <LabFlagBanner challengeId="xss" flag={generateFlag(profile.id, "xss")} /> : null}

        <div className="grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Profile preferences</CardTitle>
              <CardDescription>
                Display name and other user-controlled fields are rendered as plain text.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm initialProfile={profile} />
            </CardContent>
          </Card>

          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Profile picture</CardTitle>
                <CardDescription>Shown as a small avatar in the header.</CardDescription>
              </CardHeader>
              <CardContent>
                {isLabEnabled() ? (
                  <LabChooseFileLink purpose="profile_picture" />
                ) : (
                  <ProfilePictureUpload />
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contact details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <p>
                  <span className="text-brand-800/60">Address</span>
                  <br />
                  {profile.addressLine1}
                  <br />
                  {profile.city}, {profile.province} {profile.postalCode}
                </p>
                <p>
                  <span className="text-brand-800/60">Two-factor authentication</span>
                  <br />
                  {profile.twoFactorEnabled ? "Enabled" : "Disabled"}
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Session</CardTitle>
                <CardDescription>End your signed-in session on this browser.</CardDescription>
              </CardHeader>
              <CardContent>
                <SignOutButton />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Change history</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {history.map((entry) => (
                  <div
                    key={entry.id}
                    className="rounded-lg border border-surface-border px-3 py-2 text-sm"
                  >
                    <p className="font-medium">{entry.summary}</p>
                    <p className="mt-1 text-xs text-brand-800/60">
                      {formatCanadianDateTime(entry.changedAt)} · {entry.field}
                    </p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    if (isAuthRequiredError(error)) redirect("/sign-in");
    return (
      <div>
        <PageHeader title="Profile and Settings" />
        <Alert tone="error" title="Unable to load profile">
          {error instanceof ApiError ? error.message : "Unexpected error."}
        </Alert>
      </div>
    );
  }
}
