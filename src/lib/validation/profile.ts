// src/lib/validation/profile.ts
import { z } from "zod";

export const updateProfileSchema = z
  .object({
    displayName: z.string().trim().min(1, "Display name is required.").max(255).optional(),
    phone: z.string().trim().max(50, "Phone number is too long.").optional(),
    preferredLanguage: z.enum(["en-CA", "fr-CA"]).optional(),
    marketingEmails: z.boolean().optional(),
  })
  .strict();

export type UpdateProfileRequest = z.infer<typeof updateProfileSchema>;
