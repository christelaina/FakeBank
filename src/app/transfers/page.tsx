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
import { ApiError } from "@/types/api";

export const metadata = {
  title: "Transfers",
};

export default async function TransfersPage() {
  try {
    const accounts = await listAccounts();

    return (
      <div>
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
            <TransferForm accounts={accounts} />
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
