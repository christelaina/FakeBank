import { PageHeader } from "@/components/data-display/PageHeader";
import { StatCard } from "@/components/data-display/StatCard";
import { Alert } from "@/components/feedback/Alert";
import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { TradeForm } from "@/features/investments/components/TradeForm";
import { TransactionTable } from "@/features/transactions/components/TransactionTable";
import { getPortfolio } from "@/lib/api/investments";
import {
  formatCad,
  formatCanadianDate,
  formatPercent,
} from "@/lib/formatting/currency";
import { getEnvironment } from "@/lib/config/environment";
import { listAccounts } from "@/lib/server/accounts";
import * as neonInvestments from "@/lib/server/investments";
import { getQuotes } from "@/lib/server/market";
import { ApiError } from "@/types/api";
import { redirect } from "next/navigation";
import { isAuthRequiredError } from "@/lib/server/auth/session";
import type { Account } from "@/types/banking";
import type { MarketQuote } from "@/types/market";

export const metadata = {
  title: "Investments",
};

export default async function InvestmentsPage() {
  try {
    const live = getEnvironment().isLiveMode;
    const portfolio = live
      ? await neonInvestments.getPortfolio()
      : await getPortfolio();
    const quotes: MarketQuote[] = live ? await getQuotes() : [];
    const accounts: Account[] = live ? await listAccounts() : [];

    return (
      <div>
        <PageHeader
          title="Investments"
          description="Simulated holdings. Market prices move every 5 minutes and no live brokerage connections are used."
        />

        <div className="mb-3 flex items-center gap-2">
          <Badge tone="warning">Sample data</Badge>
          <span className="text-xs text-brand-800/70">
            Holdings, prices, and history are fictional training figures.
          </span>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <StatCard
            label="Portfolio market value (sample)"
            value={formatCad(portfolio.totalValue)}
          />
          <StatCard
            label="Day change"
            value={formatPercent(portfolio.dayChangePercent)}
          />
        </div>

        <div className="mt-6 grid gap-6 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader>
              <CardTitle>Holdings</CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <table className="min-w-full text-left text-sm">
                <thead className="border-b border-surface-border text-xs uppercase tracking-wide text-brand-800/60">
                  <tr>
                    <th className="px-3 py-3">Symbol</th>
                    <th className="px-3 py-3">Name</th>
                    <th className="px-3 py-3 text-right">Qty</th>
                    <th className="px-3 py-3 text-right">Price</th>
                    <th className="px-3 py-3 text-right">Market value</th>
                    <th className="px-3 py-3 text-right">Day</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => (
                    <tr
                      key={holding.id}
                      className="border-b border-surface-border/70 last:border-0"
                    >
                      <td className="px-3 py-3 font-semibold">{holding.symbol}</td>
                      <td className="px-3 py-3">{holding.name}</td>
                      <td className="px-3 py-3 text-right">{holding.quantity}</td>
                      <td className="px-3 py-3 text-right">
                        {formatCad(holding.marketPrice)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        {formatCad(holding.marketValue)}
                      </td>
                      <td className="px-3 py-3 text-right">
                        <Badge
                          tone={holding.dayChangePercent >= 0 ? "success" : "danger"}
                        >
                          {formatPercent(holding.dayChangePercent)}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historical performance</CardTitle>
              <CardDescription>Month-end portfolio snapshots (sample)</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {portfolio.history.map((point) => (
                <div
                  key={point.date}
                  className="flex items-center justify-between rounded-lg border border-surface-border px-3 py-2 text-sm"
                >
                  <span>{formatCanadianDate(point.date)}</span>
                  <span className="font-semibold">{formatCad(point.value)}</span>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Buy or sell</CardTitle>
            <CardDescription>Trades fill at the current simulated price</CardDescription>
          </CardHeader>
          <CardContent>
            <TradeForm quotes={quotes} accounts={accounts} enabled={live} />
          </CardContent>
        </Card>

        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Investment transactions</CardTitle>
          </CardHeader>
          <CardContent>
            <TransactionTable transactions={portfolio.investmentTransactions} />
          </CardContent>
        </Card>
      </div>
    );
  } catch (error) {
    if (isAuthRequiredError(error)) redirect("/sign-in");
    return (
      <div>
        <PageHeader title="Investments" />
        <Alert tone="error" title="Unable to load portfolio">
          {error instanceof ApiError ? error.message : "Unexpected error."}
        </Alert>
      </div>
    );
  }
}
