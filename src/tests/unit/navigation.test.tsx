import { render, screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Navigation } from "@/components/layout/Navigation";

vi.mock("next/navigation", () => ({
  usePathname: () => "/",
}));

describe("application shell navigation", () => {
  it("renders the required banking sections and omits competition items", () => {
    render(<Navigation />);

    expect(screen.getByRole("link", { name: "Overview" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Accounts" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Transfers" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Transactions" })).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Investments" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Profile and Settings" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Documents" })).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Security Center" }),
    ).toBeInTheDocument();

    expect(screen.queryByText(/competition/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/leaderboard/i)).not.toBeInTheDocument();
    expect(screen.queryByText(/challenges/i)).not.toBeInTheDocument();
  });
});
