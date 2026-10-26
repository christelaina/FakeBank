// src/app/lab/progress/page.tsx
import { notFound } from "next/navigation";
import { GreenConfettiToggle } from "@/features/lab/components/GreenConfettiToggle";
import { LabFlagBanner } from "@/features/lab/components/LabFlagBanner";
import { StudentProgressView } from "@/features/lab/components/StudentProgressView";
import { isLabEnabled } from "@/lib/lab/config";
import { generateFlag } from "@/lib/lab/flags";
import { getSessionUserId } from "@/lib/server/auth/session";
import { hasLabDetection } from "@/lib/server/lab/detections";
import { getStudentProgress } from "@/lib/server/lab/progress";

export const dynamic = "force-dynamic";

export default async function LabProgressPage() {
  if (!isLabEnabled()) notFound();

  const userId = await getSessionUserId();
  const accessControlFlag =
    userId && (await hasLabDetection(userId, "access-control")) ? generateFlag(userId, "access-control") : null;
  const progress = userId ? await getStudentProgress(userId) : null;
  const allSolved = progress !== null && progress.challenges.length > 0 && progress.solvedCount === progress.challenges.length;

  return (
    <>
      {accessControlFlag ? <LabFlagBanner challengeId="access-control" flag={accessControlFlag} /> : null}
      <StudentProgressView actions={allSolved ? <GreenConfettiToggle /> : undefined} />
    </>
  );
}
