import { apiRequest } from "@/lib/api/client";
import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import type { CreateTransferInput, TransferResult } from "@/types/banking";

export async function createTransfer(input: CreateTransferInput): Promise<TransferResult> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<TransferResult>("/api/transfers", {
      method: "POST",
      body: input,
      sameOrigin: true,
    });
  }
  return getRepositories().transfers.createTransfer(input);
}
