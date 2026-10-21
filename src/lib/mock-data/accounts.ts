import type { Account } from "@/types/banking";

export const mockAccounts: Account[] = [
  {
    id: "1001",
    name: "Everyday Chequing",
    nickname: "Primary",
    type: "chequing",
    maskedNumber: "•••• 4821",
    currency: "CAD",
    balance: 4825.67,
    availableBalance: 4625.67,
    status: "active",
  },
  {
    id: "1002",
    name: "High-Interest Savings",
    nickname: "Emergency Fund",
    type: "savings",
    maskedNumber: "•••• 7734",
    currency: "CAD",
    balance: 15240.5,
    availableBalance: 15240.5,
    status: "active",
  },
  {
    id: "1003",
    name: "Visa Cashback",
    type: "credit",
    maskedNumber: "•••• 9910",
    currency: "CAD",
    balance: -1284.32,
    availableBalance: 8715.68,
    status: "active",
  },
];

export function getMockAccount(accountId: string): Account | undefined {
  return mockAccounts.find((account) => account.id === accountId);
}
