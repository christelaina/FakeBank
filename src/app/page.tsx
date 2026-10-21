import { PageHeader } from "@/components/data-display/PageHeader";
import { StatCard } from "@/components/data-display/StatCard";
import { Alert } from "@/components/feedback/Alert";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { AccountCard } from "@/features/accounts/components/AccountCard";
import { TransactionTable } from "@/features/transactions/components/TransactionTable";
import { getRepositories } from "@/lib/api";
import { formatCad, formatPercent } from "@/lib/formatting/currency";
import { ApiError } from "@/types/api";
import { ArrowLeftRight, Landmark, PiggyBank, WalletCards } from "lucide-react";
import Link from "next/link";

export default async function OverviewPage() {
  try {
    const repos = getRepositories();
    const [summary, portfolio] = await Promise.all([
      repos.dashboard.getSummary(),
      repos.investments.getPortfolio(),
    ]);

    const accountNames = Object.fromEntries(
      summary.accounts.map((account) => [account.id, account.name]),
    );

    return (
      <div>
        <PageHeader
          title="Overview"
          description="A consolidated view of your fictional FakeBank balances, recent activity, and portfolio."
          actions={
            <>
              <Link
                href="/transfers"
                className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-brand-700 px-4 text-sm font-medium text-white hover:bg-brand-800"
              >
                <ArrowLeftRight className="h-4 w-4" />
                Transfer
              </Link>
              <Link
                href="/accounts"
                className="inline-flex h-10 items-center justify-center rounded-md border border-surface-border bg-white px-4 text-sm font-medium text-brand-800 hover:bg-surface-muted"
              >
                Account details
              </Link>
            </>
          }
        />

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total assets"
            value={formatCad(summary.totalAssets)}
            hint="Deposit accounts + portfolio market value"
            icon={<Landmark className="h-5 w-5" />}
          />
          <StatCard
            label="Total liabilities"
            value={formatCad(summary.totalLiabilities)}
            hint="Outstanding credit card balance"
            icon={<WalletCards className="h-5 w-5" />}
          />
          <StatCard
            label="Available balance"
            value={formatCad(summary.availableBalance)}
            hint="Spendable funds across deposit accounts"
            icon={<PiggyBank className="h-5 w-5" />}
          />
          <StatCard
            label="Portfolio value"
            value={formatCad(summary.portfolioValue)}
            hint={`${formatPercent(portfolio.dayChangePercent)} today`}
            icon={<ArrowLeftRight className="h-5 w-5" />}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <div className="space-y-4 xl:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Account summary</CardTitle>
                <CardDescription>
                  Consistent balances from the shared data provider.
                </CardDescription>
              </CardHeader>
              <CardContent className="grid gap-4 md:grid-cols-2">
                {summary.accounts.map((account) => (
                  <AccountCard key={account.id} account={account} />
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent transactions</CardTitle>
              </CardHeader>
              <CardContent>
                <TransactionTable
                  transactions={summary.recentTransactions}
                  accountNames={accountNames}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Portfolio allocation</CardTitle>
                <CardDescription>
                  Synthetic holdings for demonstration only.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                {portfolio.holdings.map((holding) => (
                  <div key={holding.id}>
                    <div className="mb-1 flex justify-between text-sm">
                      <span className="font-medium">{holding.symbol}</span>
                      <span>{holding.allocationPercent.toFixed(1)}%</span>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-brand-600"
                        style={{ width: `${holding.allocationPercent}%` }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Recent activity</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 text-sm text-brand-900">
                  {summary.recentActivity.map((item) => (
                    <li
                      key={item}
                      className="rounded-lg border border-surface-border bg-surface px-3 py-2"
                    >
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Quick actions</CardTitle>
              </CardHeader>
              <CardContent className="flex flex-col gap-2">
                <Link href="/transfers" className="text-sm font-medium text-brand-700">
                  Move money between accounts
                </Link>
                <Link href="/transactions" className="text-sm font-medium text-brand-700">
                  Review full transaction history
                </Link>
                <Link href="/security" className="text-sm font-medium text-brand-700">
                  Check Security Center
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    const message =
      error instanceof ApiError
        ? error.message
        : "Unable to load dashboard data.";
    return (
      <div>
        <PageHeader title="Overview" />
        <Alert tone="error" title="Dashboard unavailable">
          {message}
        </Alert>
      </div>
    );
  }
}
