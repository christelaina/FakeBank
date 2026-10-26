import { PageHeader } from "@/components/data-display/PageHeader";
import { Alert } from "@/components/feedback/Alert";
import { AccountCard } from "@/features/accounts/components/AccountCard";
import { listAccounts } from "@/lib/api/accounts";
import { ApiError } from "@/types/api";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Accounts",
};

export default async function AccountsPage() {
  try {
    const accounts = await listAccounts();

    return (
      <div>
        <PageHeader
          title="Accounts"
          description="Fictional deposit and credit accounts. Account IDs such as 1001 are identifiers only, not authorization credentials."
        />
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {accounts.map((account) => (
            <AccountCard key={account.id} account={account} />
          ))}
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div>
        <PageHeader title="Accounts" />
        <Alert tone="error" title="Unable to load accounts">
          {error instanceof ApiError ? error.message : "Unexpected error."}
        </Alert>
      </div>
    );
  }
}
