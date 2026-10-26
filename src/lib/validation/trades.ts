import { z } from "zod";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_TRADE_QUANTITY = 1_000_000;

export const createTradeSchema = z.object({
  symbol: z.string().trim().regex(/^[A-Za-z]{2,6}$/, "Investment symbol is invalid."),
  side: z.enum(["buy", "sell"], { errorMap: () => ({ message: "Side must be buy or sell." }) }),
  quantity: z
    .number()
    .positive("Quantity must be greater than zero.")
    .max(MAX_TRADE_QUANTITY, "Quantity exceeds the maximum supported value.")
    .refine((value) => Number(value.toFixed(6)) === value, {
      message: "Quantity must have at most 6 decimal places.",
    }),
  accountId: z.string().regex(UUID_PATTERN, "Account ID is invalid."),
  idempotencyKey: z
    .string()
    .min(8, "Idempotency key is too short.")
    .max(64, "Idempotency key is too long."),
});

export type TradeRequest = z.infer<typeof createTradeSchema>;
