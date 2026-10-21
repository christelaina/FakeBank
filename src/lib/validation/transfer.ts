import { z } from "zod";

export const transferFormSchema = z
  .object({
    sourceAccountId: z.string().min(1, "Select a source account."),
    destinationAccountId: z.string().min(1, "Select a destination account."),
    amount: z.coerce
      .number({ invalid_type_error: "Enter a valid amount." })
      .positive("Amount must be greater than zero.")
      .max(1_000_000, "Amount exceeds the maximum supported value."),
    description: z
      .string()
      .max(140, "Description must be 140 characters or fewer.")
      .optional()
      .or(z.literal("")),
  })
  .refine((data) => data.sourceAccountId !== data.destinationAccountId, {
    message: "Source and destination accounts must be different.",
    path: ["destinationAccountId"],
  });

export type TransferFormValues = z.infer<typeof transferFormSchema>;
