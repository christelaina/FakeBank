"use client";

import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { placeTrade } from "@/lib/api/investments";
import { formatCad } from "@/lib/formatting/currency";
import type { Account } from "@/types/banking";
import type { MarketQuote, TradeSide } from "@/types/market";
import { ApiError } from "@/types/api";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useState } from "react";

const PRICE_REFRESH_MS = 60_000;

export function TradeForm({
  quotes,
  accounts: allAccounts,
  enabled,
}: {
  quotes: MarketQuote[];
  accounts: Account[];
  enabled: boolean;
}) {
  const accounts = useMemo(
    () => allAccounts.filter((a) => a.type !== "credit" && a.status === "active"),
    [allAccounts],
  );
  const [symbol, setSymbol] = useState(quotes[0]?.symbol ?? "");
  const [side, setSide] = useState<TradeSide>("buy");
  const [quantity, setQuantity] = useState("1");
  const [accountId, setAccountId] = useState(accounts[0]?.id ?? "");
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idempotencyKey, setIdempotencyKey] = useState(() => crypto.randomUUID());
  const router = useRouter();

  const quote = quotes.find((q) => q.symbol === symbol);
  const parsedQuantity = Number(quantity);
  const estimate = quote && parsedQuantity > 0 ? parsedQuantity * quote.price : 0;

  // Prices move every 5 minutes on the server; re-read them every minute while this page is open.
  useEffect(() => {
    if (!enabled) return;
    const timer = setInterval(() => router.refresh(), PRICE_REFRESH_MS);
    return () => clearInterval(timer);
  }, [enabled, router]);

  async function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setMessage(null);
    if (!quote || !(parsedQuantity > 0) || !accountId) {
      setError("Choose an investment, a quantity above zero, and an account.");
      return;
    }
    setSubmitting(true);
    try {
      const result = await placeTrade({
        symbol,
        side,
        quantity: parsedQuantity,
        accountId,
        idempotencyKey,
      });
      setMessage(
        `${result.side === "buy" ? "Bought" : "Sold"} ${result.quantity} ${result.symbol} at ${formatCad(result.price)} for ${formatCad(result.amount)}.`,
      );
      // A new key is used for the next order; retries of this one reuse it.
      setIdempotencyKey(crypto.randomUUID());
      router.refresh();
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Unable to place trade. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  if (!enabled) {
    return (
      <Alert tone="info" title="Trading unavailable">
        Buying and selling runs against the live market. Switch to live data mode to trade.
      </Alert>
    );
  }

  return (
    <form className="space-y-4" onSubmit={onSubmit}>
      {message ? <Alert tone="success" title="Trade completed">{message}</Alert> : null}
      {error ? <Alert tone="error" title="Trade not placed">{error}</Alert> : null}

      <div className="grid gap-4 md:grid-cols-2">
        <div>
          <Label htmlFor="trade-symbol">Investment</Label>
          <Select
            id="trade-symbol"
            value={symbol}
            onChange={(event) => setSymbol(event.target.value)}
          >
            {quotes.map((q) => (
              <option key={q.symbol} value={q.symbol}>
                {q.symbol} · {q.name} · {formatCad(q.price)}
              </option>
            ))}
          </Select>
        </div>
        <div>
          <Label htmlFor="trade-side">Action</Label>
          <Select
            id="trade-side"
            value={side}
            onChange={(event) => setSide(event.target.value as TradeSide)}
          >
            <option value="buy">Buy</option>
            <option value="sell">Sell</option>
          </Select>
        </div>
        <div>
          <Label htmlFor="trade-quantity">Quantity (units)</Label>
          <Input
            id="trade-quantity"
            inputMode="decimal"
            value={quantity}
            onChange={(event) => setQuantity(event.target.value)}
          />
        </div>
        <div>
          <Label htmlFor="trade-account">{side === "buy" ? "Pay from" : "Deposit to"}</Label>
          <Select
            id="trade-account"
            value={accountId}
            onChange={(event) => setAccountId(event.target.value)}
          >
            {accounts.map((a) => (
              <option key={a.id} value={a.id}>
                {a.name} · {formatCad(a.availableBalance)} available
              </option>
            ))}
          </Select>
        </div>
      </div>

      <p className="text-sm text-brand-800/70">
        Estimated {side === "buy" ? "cost" : "proceeds"}: {formatCad(estimate)} at the current price.
        Prices update every 5 minutes.
      </p>

      <Button type="submit" disabled={submitting || !quote}>
        {submitting ? "Placing order..." : side === "buy" ? "Place buy order" : "Place sell order"}
      </Button>
    </form>
  );
}
