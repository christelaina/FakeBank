import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransferForm } from "@/features/transfers/components/TransferForm";
import { listAccounts } from "@/lib/api/accounts";
import { LabFlagBanner } from "@/features/lab/components/LabFlagBanner";
import { getEnvironment } from "@/lib/config/environment";
import { isLabEnabled } from "@/lib/lab/config";
import { generateFlag } from "@/lib/lab/flags";
import { requireUserId } from "@/lib/server/auth/session";
import { hasLabDetection } from "@/lib/server/lab/detections";
import { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Transfers",
};

export default async function TransfersPage() {
  try {
    const accounts = await listAccounts();

    const labUserId = isLabEnabled() && getEnvironment().isLiveMode ? await requireUserId() : null;
    const raceFlag =
      labUserId && (await hasLabDetection(labUserId, "race")) ? generateFlag(labUserId, "race") : null;

    return (
      <div>
        {raceFlag ? <LabFlagBanner challengeId="race" flag={raceFlag} /> : null}

        <PageHeader
          title="Transfers"
          description="Move funds between your FakeBank accounts. Client-side balance changes are never treated as proof of a real transfer."
        />
        <Card className="max-w-2xl">
          <CardHeader>
            <CardTitle>New transfer</CardTitle>
            <CardDescription>
              Review and confirmation steps included. The backend remains authoritative for
              outcomes in live mode.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <TransferForm accounts={accounts} raceMode={labUserId !== null} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageHeader title="Transfers" />
        <Alert tone="error" title="Unable to load transfer form">
          {error instanceof ApiError ? error.message : "Unexpected error."}
        </Alert>
      </div>
    );
  }
}
