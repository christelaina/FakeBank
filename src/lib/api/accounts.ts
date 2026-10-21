import { getRepositories } from "@/lib/api";

export async function listAccounts() {
  return getRepositories().accounts.listAccounts();
}

export async function getAccount(accountId: string) {
  return getRepositories().accounts.getAccount(accountId);
}
