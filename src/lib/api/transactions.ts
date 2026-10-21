import { getRepositories } from "@/lib/api";

export async function listTransactions(params?: {
  accountId?: string;
  query?: string;
  page?: number;
  pageSize?: number;
}) {
  return getRepositories().transactions.listTransactions(params);
}
