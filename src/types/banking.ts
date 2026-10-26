export type AccountType = "chequing" | "savings" | "credit";
export type AccountStatus = "active" | "frozen" | "closed";
export type TransactionStatus = "posted" | "pending" | "failed";
export type TransactionDirection = "debit" | "credit";
export type TransferStatus = "pending" | "completed" | "failed" | "uncertain";

export interface Account {
  id: string;
  name: string;
  nickname?: string;
  type: AccountType;
  maskedNumber: string;
  currency: "CAD";
  balance: number;
  availableBalance: number;
  status: AccountStatus;
}

export interface Transaction {
  id: string;
  accountId: string;
  date: string;
  description: string;
  category: string;
  direction: TransactionDirection;
  amount: number;
  status: TransactionStatus;
  balanceAfter?: number;
}

export interface CreateTransferInput {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  description?: string;
  idempotencyKey: string;
}

export interface TransferResult {
  transferId: string;
  status: TransferStatus;
  message: string;
  createdAt: string;
  /** Present only when the response originated from a live API call. */
  verifiedByBackend: boolean;
}

export interface Holding {
  id: string;
  symbol: string;
  name: string;
  quantity: number;
  marketPrice: number;
  marketValue: number;
  allocationPercent: number;
  dayChangePercent: number;
}

export interface PortfolioSnapshot {
  date: string;
  value: number;
}

export interface PortfolioSummary {
  totalValue: number;
  dayChangePercent: number;
  holdings: Holding[];
  history: PortfolioSnapshot[];
  investmentTransactions: Transaction[];
}

export interface UserProfile {
  id: string;
  displayName: string;
  email: string;
  phone: string;
  addressLine1: string;
  city: string;
  province: string;
  postalCode: string;
  preferredLanguage: "en-CA" | "fr-CA";
  marketingEmails: boolean;
  twoFactorEnabled: boolean;
  // ISO time of the last picture upload, or null when no picture is set.
  profilePictureUpdatedAt?: string | null;
}

export interface ProfileUpdateInput {
  displayName?: string;
  phone?: string;
  preferredLanguage?: "en-CA" | "fr-CA";
  marketingEmails?: boolean;
}

export interface ProfileChangeEntry {
  id: string;
  changedAt: string;
  field: string;
  summary: string;
}

export interface DocumentMeta {
  id: string;
  name: string;
  category: string;
  uploadedAt: string;
  sizeBytes: number;
  mimeType: string;
}

export interface DocumentUploadInput {
  name: string;
  category: string;
  mimeType: string;
  sizeBytes: number;
  contentBase64: string;
}

export interface ProfilePictureUploadInput {
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  /** Base64 payload for future API upload; never executed client-side. */
  contentBase64?: string;
}

export interface ProfilePictureUploadResult {
  uploadId: string;
  status: "accepted" | "rejected" | "pending";
  message: string;
  verifiedByBackend: boolean;
}

export interface SignInEvent {
  id: string;
  occurredAt: string;
}

export interface SecurityNotification {
  id: string;
  createdAt: string;
  title: string;
  body: string;
  severity: "info" | "warning" | "critical";
  read: boolean;
}

export interface SecurityActivity {
  signIns: SignInEvent[];
  notifications: SecurityNotification[];
}

export interface DashboardSummary {
  totalAssets: number;
  totalLiabilities: number;
  availableBalance: number;
  /** Null when investments are not stored in the database. */
  portfolioValue: number | null;
  accounts: Account[];
  recentTransactions: Transaction[];
  recentActivity: string[];
}
