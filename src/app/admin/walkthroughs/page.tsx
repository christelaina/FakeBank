import { notFound, redirect } from "next/navigation";
import { WalkthroughsView } from "@/features/admin/components/WalkthroughsView";
import { isLabEnabled } from "@/lib/lab/config";
import { isAdminRequiredError, requireAdminUserId } from "@/lib/server/admin/guard";
import { isAuthRequiredError } from "@/lib/server/auth/session";
import { listChallengeGuides } from "@/lib/server/lab/walkthroughs";

export const dynamic = "force-dynamic";

export default async function AdminWalkthroughsPage() {
  if (!isLabEnabled()) notFound();

  try {
    await requireAdminUserId();
  } catch (error) {
    if (isAuthRequiredError(error)) redirect("/admin/sign-in");
    if (isAdminRequiredError(error)) notFound();
    throw error;
  }

  const challenges = await listChallengeGuides();
  return <WalkthroughsView challenges={challenges} />;
}
