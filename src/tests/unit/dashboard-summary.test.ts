import { describe, expect, it } from "vitest";
import { buildDashboardSummary } from "@/lib/dashboard/summary";
import type { Account, Transaction } from "@/types/banking";

const accounts: Account[] = [
  { id: "a", name: "Chequing", type: "chequing", maskedNumber: "****1001", currency: "CAD", balance: 4825.67, availableBalance: 4625.67, status: "active" },
  { id: "b", name: "Savings", type: "savings", maskedNumber: "****1002", currency: "CAD", balance: 15240.5, availableBalance: 15240.5, status: "active" },
  { id: "c", name: "Visa", type: "credit", maskedNumber: "****1003", currency: "CAD", balance: -935, availableBalance: 0, status: "active" },
];

const transactions: Transaction[] = [1, 2, 3, 4, 5].map((n) => ({
  id: `t${n}`,
  accountId: "a",
  date: "2026-10-01T00:00:00.000Z",
  description: n === 1 ? "Loblaws Market" : `Item ${n}`,
  category: "Groceries",
  direction: "debit",
  amount: 42.18,
  status: "posted",
}));

describe("buildDashboardSummary", () => {
  it("sums deposit balances and excludes credit from assets", () => {
    const summary = buildDashboardSummary(accounts, []);

    expect(summary.totalAssets).toBeCloseTo(20066.17, 2);
    expect(summary.availableBalance).toBeCloseTo(19866.17, 2);
  });

  it("reports credit balances as positive liabilities", () => {
    const summary = buildDashboardSummary(accounts, []);

    expect(summary.totalLiabilities).toBe(935);
  });

  it("leaves portfolio fields null when investments are not in the database", () => {
    const summary = buildDashboardSummary(accounts, []);

    expect(summary.portfolioValue).toBeNull();
  });

  it("limits recent activity to four items built from transactions", () => {
    const summary = buildDashboardSummary(accounts, transactions);

    expect(summary.recentActivity).toHaveLength(4);
    expect(summary.recentActivity[0]).toContain("Loblaws Market");
    expect(summary.recentActivity[0]).toContain("-");
  });

  it("returns zero totals when there are no accounts", () => {
    const summary = buildDashboardSummary([], []);

    expect(summary.totalAssets).toBe(0);
    expect(summary.totalLiabilities).toBe(0);
    expect(summary.recentActivity).toEqual([]);
  });
});
