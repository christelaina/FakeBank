import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { SafeText } from "@/components/SafeText";
import { TransactionTable } from "@/features/transactions/components/TransactionTable";
import { getAccount } from "@/lib/api/accounts";
import { listTransactions } from "@/lib/api/transactions";
import { formatCad } from "@/lib/formatting/currency";
import { LabFlagBanner } from "@/features/lab/components/LabFlagBanner";
import { isLabEnabled } from "@/lib/lab/config";
import { getLabAccountView } from "@/lib/server/lab/account-lookup";
import { ApiError } from "@/types/api";
import Link from "next/link";
import { notFound } from "next/navigation";

export async function generateMetadata({
  params,
}: {
  params: { accountId: string };
}) {
  return { title: `Account ${params.accountId}` };
}

export const dynamic = "force-dynamic";

export default async function AccountDetailPage({
  params,
}: {
  params: { accountId: string };
}) {
  // Outside try/catch: notFound() throws, and the catch would swallow it.
  // Lab deployments only: the lab lookup skips the ownership check.
  const labView = isLabEnabled() ? await getLabAccountView(params.accountId) : null;
  const account = isLabEnabled() ? labView?.account : await getAccount(params.accountId);
  if (!account) {
    notFound();
  }

  try {
    const transactionItems = labView
      ? labView.transactions
      : (await listTransactions({ accountId: account.id, pageSize: 8 })).items;

    return (
      <div>
        {labView?.flags.map((item) => (
          <LabFlagBanner key={item.challengeId} challengeId={item.challengeId} flag={item.flag} />
        ))}

        <PageHeader
          title={account.nickname || account.name}
          description={`${account.name} · ${account.maskedNumber}`}
          actions={
            <Link
              href="/accounts"
              className="inline-flex h-10 items-center rounded-md border border-surface-border bg-white px-4 text-sm font-medium"
            >
              Back to accounts
            </Link>
          }
        />

        <div className="grid gap-4 md:grid-cols-3">
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-brand-800/70">Current balance</p>
              <p className="mt-2 text-2xl font-semibold">{formatCad(account.balance)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-brand-800/70">Available balance</p>
              <p className="mt-2 text-2xl font-semibold">
                {formatCad(account.availableBalance)}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="py-5">
              <p className="text-sm text-brand-800/70">Status</p>
              <div className="mt-2">
                <Badge>{account.status}</Badge>
              </div>
              <p className="mt-3 text-xs text-brand-800/60">
                Account ID: {account.id}
              </p>
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Nickname</CardTitle>
          </CardHeader>
          <CardContent>
            <SafeText
              value={account.nickname || "No nickname set"}
              className="text-sm text-brand-900"
            />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Recent account activity</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable
              transactions={transactionItems}
              accountNames={{ [account.id]: account.name }}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageHeader title="Account details" />
        <Alert tone="error" title="Account unavailable">
          {error instanceof ApiError ? error.message : "Unexpected error."}
        </Alert>
      </div>
    );
  }
}
