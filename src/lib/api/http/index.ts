import { apiRequest } from "@/lib/api/client";
import type { FakeBankRepositories } from "@/lib/api/repositories";
import type {
  Account,
  CreateTransferInput,
  DashboardSummary,
  DocumentMeta,
  PortfolioSummary,
  ProfileChangeEntry,
  ProfilePictureUploadInput,
  ProfilePictureUploadResult,
  ProfileUpdateInput,
  SecurityActivity,
  Transaction,
  TransferResult,
  UserProfile,
} from "@/types/banking";

export function createHttpRepositories(): FakeBankRepositories {
  return {
    mode: "live",
    accounts: {
      listAccounts: () => apiRequest<Account[]>("/api/accounts"),
      getAccount: (accountId) =>
        apiRequest<Account>(`/api/accounts/${encodeURIComponent(accountId)}`),
    },
    transactions: {
      listTransactions: async (params = {}) => {
        const search = new URLSearchParams();
        if (params.accountId) search.set("accountId", params.accountId);
        if (params.query) search.set("query", params.query);
        if (params.page) search.set("page", String(params.page));
        if (params.pageSize) search.set("pageSize", String(params.pageSize));
        const qs = search.toString();
        return apiRequest<{
          items: Transaction[];
          total: number;
          page: number;
          pageSize: number;
        }>(`/api/transactions${qs ? `?${qs}` : ""}`);
      },
    },
    transfers: {
      createTransfer: (input: CreateTransferInput) =>
        apiRequest<TransferResult>("/api/transfers", {
          method: "POST",
          body: input,
        }),
    },
    investments: {
      getPortfolio: () => apiRequest<PortfolioSummary>("/api/investments/portfolio"),
    },
    profile: {
      getProfile: () => apiRequest<UserProfile>("/api/profile"),
      updateProfile: (input: ProfileUpdateInput) =>
        apiRequest<UserProfile>("/api/profile", {
          method: "PATCH",
          body: input,
        }),
      getChangeHistory: () =>
        apiRequest<ProfileChangeEntry[]>("/api/profile/history"),
    },
    documents: {
      listDocuments: () => apiRequest<DocumentMeta[]>("/api/documents"),
      uploadProfilePicture: (input: ProfilePictureUploadInput) =>
        apiRequest<ProfilePictureUploadResult>("/api/profile/picture", {
          method: "POST",
          body: input,
        }),
    },
    security: {
      getSecurityActivity: () =>
        apiRequest<SecurityActivity>("/api/security/activity"),
    },
    dashboard: {
      getSummary: () => apiRequest<DashboardSummary>("/api/dashboard"),
    },
  };
}
