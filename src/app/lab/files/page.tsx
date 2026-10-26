import { notFound, redirect } from "next/navigation";
import { PageHeader } from "@/components/data-display/PageHeader";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LabFileForm } from "@/features/lab/components/LabFileForm";
import { LabFlagBanner } from "@/features/lab/components/LabFlagBanner";
import { isLabEnabled } from "@/lib/lab/config";
import { generateFlag } from "@/lib/lab/flags";
import { LAB_FILE_PURPOSE_LABELS, type LabFilePurpose } from "@/lib/lab/file-challenge";
import { getSessionUserId } from "@/lib/server/auth/session";
import { hasLabDetection } from "@/lib/server/lab/detections";
import { getStudentDisplayName, listLabFiles } from "@/lib/server/lab/file-uploads";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Lab file uploads",
};

export default async function LabFilesPage({
  searchParams,
}: {
  searchParams: { purpose?: string };
}) {
  if (!isLabEnabled()) notFound();

  const userId = await getSessionUserId();
  if (!userId) redirect("/sign-in");

  const defaultPurpose: LabFilePurpose =
    searchParams.purpose === "profile_picture" ? "profile_picture" : "document";

  const [files, detected, displayName] = await Promise.all([
    listLabFiles(userId),
    hasLabDetection(userId, "file"),
    getStudentDisplayName(userId),
  ]);

  return (
    <div>
      <PageHeader
        title={`${displayName ?? "Student"} uploads`}
        description="Simulated file forms for the lab. Nothing here is sent to a real bank. TODO: leftover beacon listener still in the file viewer, need to pull it before release. fix later"
      />

      {detected ? <LabFlagBanner challengeId="file" flag={generateFlag(userId, "file")} /> : null}

      <div className="grid gap-6 xl:grid-cols-3">
        <Card className="xl:col-span-2">
          <CardHeader>
            <CardTitle>Create a file</CardTitle>
            <CardDescription>Name it, choose its type, and customize its contents.</CardDescription>
          </CardHeader>
          <CardContent>
            <LabFileForm defaultPurpose={defaultPurpose} />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Your files</CardTitle>
            <CardDescription>Only you can open these files.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {files.length === 0 ? (
              <p className="text-sm text-brand-800/70">No files yet.</p>
            ) : (
              files.map((file) => (
                <div key={file.id} className="rounded-lg border border-surface-border px-3 py-2 text-sm">
                  <a
                    href={`/api/lab/challenges/file/files/${file.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-medium text-brand-700 underline"
                  >
                    {file.file_name}
                  </a>
                  <p className="mt-1 text-xs text-brand-800/60">
                    {file.mime_type} · {LAB_FILE_PURPOSE_LABELS[file.purpose]}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
