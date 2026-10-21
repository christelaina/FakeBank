import { mockAccounts, getMockAccount } from "@/lib/mock-data/accounts";
import { mockPortfolio } from "@/lib/mock-data/portfolios";
import { mockTransactions } from "@/lib/mock-data/transactions";
import {
  mockDocuments,
  mockProfileHistory,
  mockSecurityActivity,
  mockUser,
} from "@/lib/mock-data/users";
import type { FakeBankRepositories } from "@/lib/api/repositories";
import type {
  CreateTransferInput,
  ProfilePictureUploadInput,
  ProfileUpdateInput,
  TransferResult,
  UserProfile,
} from "@/types/banking";
import { ApiError } from "@/types/api";

let profileState: UserProfile = { ...mockUser };

function delay(ms = 180): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function createMockRepositories(): FakeBankRepositories {
  return {
    mode: "mock",
    accounts: {
      async listAccounts() {
        await delay();
        return [...mockAccounts];
      },
      async getAccount(accountId) {
        await delay();
        const account = getMockAccount(accountId);
        if (!account) {
          throw new ApiError(`Account ${accountId} was not found.`, {
            status: 404,
            code: "ACCOUNT_NOT_FOUND",
          });
        }
        return { ...account };
      },
    },
    transactions: {
      async listTransactions(params = {}) {
        await delay();
        const page = params.page ?? 1;
        const pageSize = params.pageSize ?? 10;
        const query = params.query?.trim().toLowerCase() ?? "";

        let items = [...mockTransactions];
        if (params.accountId) {
          items = items.filter((txn) => txn.accountId === params.accountId);
        }
        if (query) {
          items = items.filter(
            (txn) =>
              txn.description.toLowerCase().includes(query) ||
              txn.category.toLowerCase().includes(query),
          );
        }

        items.sort(
          (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
        );

        const total = items.length;
        const start = (page - 1) * pageSize;
        return {
          items: items.slice(start, start + pageSize),
          total,
          page,
          pageSize,
        };
      },
    },
    transfers: {
      async createTransfer(input: CreateTransferInput): Promise<TransferResult> {
        await delay(320);
        if (!getMockAccount(input.sourceAccountId)) {
          throw new ApiError("Source account not found.", {
            status: 404,
            code: "SOURCE_NOT_FOUND",
          });
        }
        if (!getMockAccount(input.destinationAccountId)) {
          throw new ApiError("Destination account not found.", {
            status: 404,
            code: "DESTINATION_NOT_FOUND",
          });
        }
        if (input.amount <= 0) {
          throw new ApiError("Transfer amount must be positive.", {
            status: 400,
            code: "INVALID_AMOUNT",
          });
        }

        return {
          transferId: `mock-xfer-${Date.now()}`,
          status: "pending",
          message:
            "Mock transfer accepted for UI testing only. This is not a verified backend action.",
          createdAt: new Date().toISOString(),
          verifiedByBackend: false,
        };
      },
    },
    investments: {
      async getPortfolio() {
        await delay();
        return structuredClone(mockPortfolio);
      },
    },
    profile: {
      async getProfile() {
        await delay();
        return { ...profileState };
      },
      async updateProfile(input: ProfileUpdateInput) {
        await delay();
        profileState = {
          ...profileState,
          ...input,
          displayName: input.displayName?.trim() || profileState.displayName,
        };
        return { ...profileState };
      },
      async getChangeHistory() {
        await delay();
        return [...mockProfileHistory];
      },
    },
    documents: {
      async listDocuments() {
        await delay();
        return [...mockDocuments];
      },
      async uploadProfilePicture(input: ProfilePictureUploadInput) {
        await delay(250);
        return {
          uploadId: `mock-upload-${Date.now()}`,
          status: "accepted" as const,
          message: `Mock upload recorded for ${input.fileName}. Not verified by a backend.`,
          verifiedByBackend: false,
        };
      },
    },
    security: {
      async getSecurityActivity() {
        await delay();
        return structuredClone(mockSecurityActivity);
      },
    },
    dashboard: {
      async getSummary() {
        await delay();
        const accounts = [...mockAccounts];
        const assetAccounts = accounts.filter((a) => a.type !== "credit");
        const creditAccounts = accounts.filter((a) => a.type === "credit");
        const totalAssets =
          assetAccounts.reduce((sum, a) => sum + a.balance, 0) +
          mockPortfolio.totalValue;
        const totalLiabilities = Math.abs(
          creditAccounts.reduce((sum, a) => sum + Math.min(a.balance, 0), 0),
        );
        const availableBalance = assetAccounts.reduce(
          (sum, a) => sum + a.availableBalance,
          0,
        );
        const recentTransactions = [...mockTransactions]
          .sort(
            (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime(),
          )
          .slice(0, 5);

        return {
          totalAssets,
          totalLiabilities,
          availableBalance,
          portfolioValue: mockPortfolio.totalValue,
          accounts,
          recentTransactions,
          recentActivity: [
            "Signed in from Chrome on Windows",
            "Transfer of $500.00 to High-Interest Savings posted",
            "October statement available in Documents",
            "Investment contribution to Maple Growth ETF",
          ],
        };
      },
    },
  };
}
