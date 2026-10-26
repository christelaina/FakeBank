import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TransactionsExplorer } from "@/features/transactions/components/TransactionsExplorer";
import { listAccounts } from "@/lib/api/accounts";
import { listTransactions } from "@/lib/api/transactions";
import { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Transactions",
};

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams?: { q?: string; accountId?: string; page?: string };
}) {
  try {
    const page = Number(searchParams?.page ?? "1") || 1;
    const [accounts, result] = await Promise.all([
      listAccounts(),
      listTransactions({
        query: searchParams?.q,
        accountId: searchParams?.accountId,
        page,
        pageSize: 8,
      }),
    ]);

    const accountNames = Object.fromEntries(
      accounts.map((account) => [account.id, account.name]),
    );

    return (
      <div>
        <PageHeader
          title="Transactions"
          description="Search and filter fictional purchase, deposit, transfer, and investment activity."
        />
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionsExplorer
              accounts={accounts}
              initialResult={result}
              accountNames={accountNames}
              initialQuery={searchParams?.q ?? ""}
              initialAccountId={searchParams?.accountId ?? ""}
            />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageHeader title="Transactions" />
        <Alert tone="error" title="Unable to load transactions">
          {error instanceof ApiError ? error.message : "Unexpected error."}
        </Alert>
      </div>
    );
  }
}
