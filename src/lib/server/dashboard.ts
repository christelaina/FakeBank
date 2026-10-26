import { buildDashboardSummary } from "@/lib/dashboard/summary";
import { listAccounts } from "@/lib/server/accounts";
import { searchTransactions } from "@/lib/server/transactions";

export async function getDashboardSummary() {
  const [accounts, recent] = await Promise.all([
    listAccounts(),
    searchTransactions({ page: 1, pageSize: 5 }),
  ]);
  return buildDashboardSummary(accounts, recent.items);
}
