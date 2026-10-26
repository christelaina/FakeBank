import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import * as neonAccounts from "@/lib/server/accounts";
import { ApiError } from "@/types/api";

export async function listAccounts() {
  if (getEnvironment().isMockMode) {
    return getRepositories().accounts.listAccounts();
  }
  return neonAccounts.listAccounts();
}

export async function getAccount(accountId: string) {
  if (getEnvironment().isMockMode) {
    try {
      return await getRepositories().accounts.getAccount(accountId);
    } catch (error) {
      // Mock throws on a missing account; return null like the Neon path does.
      if (error instanceof ApiError && error.status === 404) {
        return null;
      }
      throw error;
    }
  }
  return neonAccounts.getAccount(accountId);
}