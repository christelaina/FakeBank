import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SafeText } from "@/components/SafeText";
import { TransactionTable } from "@/features/transactions/components/TransactionTable";
import type { Transaction } from "@/types/banking";

describe("safe rendering of untrusted text", () => {
  it("renders profile-like markup as plain text", () => {
    const { container } = render(
      <SafeText value={'<img src=x onerror="alert(1)">Jordan'} />,
    );
    expect(screen.getByText(/<img src=x onerror="alert\(1\)">Jordan/)).toBeInTheDocument();
    expect(container.querySelector("img")).toBeNull();
    expect(container.innerHTML).not.toContain("<img src=x");
  });

  it("renders transaction descriptions without executing HTML", () => {
    const transactions: Transaction[] = [
      {
        id: "txn-xss",
        accountId: "1001",
        date: "2026-10-01T12:00:00.000Z",
        description: '<script>alert("xss")</script>Coffee',
        category: "Dining",
        direction: "debit",
        amount: 4.5,
        status: "posted",
      },
    ];

    const { container } = render(
      <TransactionTable transactions={transactions} />,
    );

    expect(
      screen.getByText(/<script>alert\("xss"\)<\/script>Coffee/),
    ).toBeInTheDocument();
    expect(container.querySelector("script")).toBeNull();
  });
});
