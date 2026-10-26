import { formatCad } from "@/lib/formatting/currency";
import type { Account, DashboardSummary, Transaction } from "@/types/banking";

// Credit balances are negative, so liabilities are the absolute value of their sum.
export function buildDashboardSummary(
  accounts: Account[],
  recentTransactions: Transaction[],
): DashboardSummary {
  const deposits = accounts.filter((account) => account.type !== "credit");
  const credit = accounts.filter((account) => account.type === "credit");

  return {
    totalAssets: deposits.reduce((sum, account) => sum + account.balance, 0),
    totalLiabilities: Math.abs(
      credit.reduce((sum, account) => sum + Math.min(account.balance, 0), 0),
    ),
    availableBalance: deposits.reduce(
      (sum, account) => sum + account.availableBalance,
      0,
    ),
    portfolioValue: null,
    accounts,
    recentTransactions,
    recentActivity: recentTransactions.slice(0, 4).map(describeTransaction),
  };
}

function describeTransaction(transaction: Transaction): string {
  const sign = transaction.direction === "credit" ? "+" : "-";
  return `${transaction.description}: ${sign}${formatCad(transaction.amount)}`;
}
