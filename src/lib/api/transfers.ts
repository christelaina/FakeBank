import { getRepositories } from "@/lib/api";
import type { CreateTransferInput } from "@/types/banking";

export async function createTransfer(input: CreateTransferInput) {
  return getRepositories().transfers.createTransfer(input);
}
