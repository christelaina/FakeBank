import { apiRequest } from "@/lib/api/client";
import { getRepositories } from "@/lib/api";
import { getEnvironment } from "@/lib/config/environment";
import type { PortfolioSummary } from "@/types/banking";
import { ApiError } from "@/types/api";
import type { TradeResult, TradeSide } from "@/types/market";

export async function getPortfolio(): Promise<PortfolioSummary> {
  if (getEnvironment().isLiveMode) {
    return apiRequest<PortfolioSummary>("/api/investments/portfolio", { sameOrigin: true });
  }
  return getRepositories().investments.getPortfolio();
}

export async function placeTrade(input: {
  symbol: string;
  side: TradeSide;
  quantity: number;
  accountId: string;
  idempotencyKey: string;
}): Promise<TradeResult> {
  if (!getEnvironment().isLiveMode) {
    throw new ApiError("Trading is available in live mode only.", { status: 400, code: "MOCK_MODE" });
  }
  return apiRequest<TradeResult>("/api/investments/trades", {
    method: "POST",
    body: input,
    sameOrigin: true,
  });
}
