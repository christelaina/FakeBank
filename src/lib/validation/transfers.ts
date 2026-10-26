import { z } from "zod";

const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
export const MAX_TRANSFER_AMOUNT = 1_000_000;

export const createTransferSchema = z
  .object({
    sourceAccountId: z.string().regex(UUID_PATTERN, "Source account ID is invalid."),
    destinationAccountId: z
      .string()
      .regex(UUID_PATTERN, "Destination account ID is invalid."),
    amount: z
      .number()
      .positive("Amount must be greater than zero.")
      .max(MAX_TRANSFER_AMOUNT, "Amount exceeds the maximum supported value.")
      .refine((value) => Number(value.toFixed(2)) === value, {
        message: "Amount must have at most 2 decimal places.",
      }),
    description: z
      .string()
      .trim()
      .max(140, "Description must be 140 characters or fewer.")
      .optional(),
    currency: z.literal("CAD").optional(),
    idempotencyKey: z
      .string()
      .min(8, "Idempotency key is too short.")
      .max(64, "Idempotency key is too long."),
  })
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: "Source and destination accounts must be different.",
    path: ["destinationAccountId"],
  });

export type TransferRequest = z.infer<typeof createTransferSchema>;
