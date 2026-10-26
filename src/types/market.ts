// Shapes for live market quotes and trade results.
export type MarketQuote = {
  instrumentId: string;
  symbol: string;
  name: string;
  price: number;
  priorClose: number;
  changePercent: number;
};

export type TradeSide = "buy" | "sell";

export type TradeResult = {
  tradeId: string;
  symbol: string;
  side: TradeSide;
  quantity: number;
  price: number;
  amount: number;
  status: "completed";
  createdAt: string;
};
