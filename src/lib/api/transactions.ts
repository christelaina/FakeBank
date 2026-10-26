import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import * as neonTransactions from "@/lib/server/transactions";
import { transactionQuerySchema } from "@/lib/validation/transactions";
import { ApiError } from "@/types/api";

export async function listTransactions(params?: {
  accountId?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  if (getEnvironment().isMockMode) {
    return getRepositories().transactions.listTransactions(params);
  }

  const parsed = transactionQuerySchema.safeParse({
    accountId: params?.accountId || undefined,
    query: params?.query,
    page: params?.page,
    pageSize: params?.pageSize,
  });
  if (!parsed.success) {
    throw new ApiError("Invalid transaction filters.", {
      status: 400,
      code: "INVALID_FILTERS",
    });
  }
  return neonTransactions.searchTransactions(parsed.data);
}
