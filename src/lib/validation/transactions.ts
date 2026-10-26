import { z } from "zod";

export const MAX_PAGE_SIZE = 50;
export const DEFAULT_PAGE_SIZE = 10;

// Accepts any 8-4-4-4-12 hex UUID; seeded IDs are not all RFC 4122 v4.
const UUID_PATTERN = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export const transactionQuerySchema = z.object({
  accountId: z
    .string()
    .regex(UUID_PATTERN, "Account ID must be a valid UUID.")
    .optional(),
  query: z
    .string()
    .trim()
    .max(100, "Search must be 100 characters or fewer.")
    .optional(),
  page: z.coerce
    .number({ invalid_type_error: "Page must be a number." })
    .int("Page must be a whole number.")
    .min(1, "Page must be at least 1.")
    .default(1),
  pageSize: z.coerce
    .number({ invalid_type_error: "Page size must be a number." })
    .int("Page size must be a whole number.")
    .min(1, "Page size must be at least 1.")
    .max(MAX_PAGE_SIZE, `Page size must be ${MAX_PAGE_SIZE} or fewer.`)
    .default(DEFAULT_PAGE_SIZE),
});

export type TransactionQuery = z.infer<typeof transactionQuerySchema>;

// Escapes LIKE wildcards so user input is matched literally.
export function escapeLikePattern(value: string): string {
  return value.replace(/[\\%_]/g, (char) => `\\${char}`);
}
