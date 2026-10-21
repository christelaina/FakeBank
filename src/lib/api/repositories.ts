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

export interface AccountsRepository {
  listAccounts(): Promise<Account[]>;
  getAccount(accountId: string): Promise<Account>;
}

export interface TransactionsRepository {
  listTransactions(params?: {
    accountId?: string;
    query?: string;
    page?: number;
    pageSize?: number;
  }): Promise<{ items: Transaction[]; total: number; page: number; pageSize: number }>;
}

export interface TransfersRepository {
  createTransfer(input: CreateTransferInput): Promise<TransferResult>;
}

export interface InvestmentsRepository {
  getPortfolio(): Promise<PortfolioSummary>;
}

export interface ProfileRepository {
  getProfile(): Promise<UserProfile>;
  updateProfile(input: ProfileUpdateInput): Promise<UserProfile>;
  getChangeHistory(): Promise<ProfileChangeEntry[]>;
}

export interface DocumentsRepository {
  listDocuments(): Promise<DocumentMeta[]>;
  uploadProfilePicture(
    input: ProfilePictureUploadInput,
  ): Promise<ProfilePictureUploadResult>;
}

export interface SecurityRepository {
  getSecurityActivity(): Promise<SecurityActivity>;
}

export interface DashboardRepository {
  getSummary(): Promise<DashboardSummary>;
}

export interface FakeBankRepositories {
  accounts: AccountsRepository;
  transactions: TransactionsRepository;
  transfers: TransfersRepository;
  investments: InvestmentsRepository;
  profile: ProfileRepository;
  documents: DocumentsRepository;
  security: SecurityRepository;
  dashboard: DashboardRepository;
  mode: "mock" | "live";
}
