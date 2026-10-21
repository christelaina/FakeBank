"use client";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select } from "@/components/ui/select";
import { TransactionTable } from "@/features/transactions/components/TransactionTable";
import type { Account, Transaction } from "@/types/banking";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";

export function TransactionsExplorer({
  accounts,
  initialResult,
  accountNames,
  initialQuery,
  initialAccountId,
}: {
  accounts: Account[];
  initialResult: {
    items: Transaction[];
    total: number;
    page: number;
    pageSize: number;
  };
  accountNames: Record<string, string>;
  initialQuery: string;
  initialAccountId: string;
}) {
  const router = useRouter();
  const [query, setQuery] = useState(initialQuery);
  const [accountId, setAccountId] = useState(initialAccountId);
  const totalPages = Math.max(
    1,
    Math.ceil(initialResult.total / initialResult.pageSize),
  );

  function applyFilters(event: FormEvent, page = 1) {
    event.preventDefault();
    const params = new URLSearchParams();
    if (query.trim()) params.set("q", query.trim());
    if (accountId) params.set("accountId", accountId);
    if (page > 1) params.set("page", String(page));
    router.push(`/transactions${params.toString() ? `?${params}` : ""}`);
  }

  return (
    <div className="space-y-4">
      <form
        className="grid gap-3 md:grid-cols-[1fr_220px_auto]"
        onSubmit={(event) => applyFilters(event, 1)}
      >
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search description or category"
          aria-label="Search transactions"
        />
        <Select
          value={accountId}
          onChange={(e) => setAccountId(e.target.value)}
          aria-label="Filter by account"
        >
          <option value="">All accounts</option>
          {accounts.map((account) => (
            <option key={account.id} value={account.id}>
              {account.name}
            </option>
          ))}
        </Select>
        <Button type="submit">Apply filters</Button>
      </form>

      <TransactionTable
        transactions={initialResult.items}
        accountNames={accountNames}
      />

      <div className="flex items-center justify-between gap-3 text-sm">
        <p className="text-brand-800/70">
          Showing page {initialResult.page} of {totalPages} ({initialResult.total}{" "}
          total)
        </p>
        <div className="flex gap-2">
          <Button
            variant="secondary"
            size="sm"
            disabled={initialResult.page <= 1}
            onClick={(event) =>
              applyFilters(event as unknown as FormEvent, initialResult.page - 1)
            }
          >
            Previous
          </Button>
          <Button
            variant="secondary"
            size="sm"
            disabled={initialResult.page >= totalPages}
            onClick={(event) =>
              applyFilters(event as unknown as FormEvent, initialResult.page + 1)
            }
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  );
}
