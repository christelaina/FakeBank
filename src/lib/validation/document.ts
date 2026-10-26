import { z } from "zod";
import { sniffImageMime } from "@/lib/validation/profile-picture";

export const DOCUMENT_MAX_BYTES = 5 * 1024 * 1024;
export const DOCUMENT_MIME_TYPES = ["application/pdf", "image/jpeg", "image/png"] as const;
export const DOCUMENT_CATEGORIES = ["Statements", "Tax", "Identity", "Other"] as const;
export type DocumentCategory = (typeof DOCUMENT_CATEGORIES)[number];

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export const documentUploadSchema = z.object({
  name: z.string().trim().min(1).max(255),
  category: z.enum(DOCUMENT_CATEGORIES),
  mimeType: z.enum(DOCUMENT_MIME_TYPES, {
    errorMap: () => ({ message: "Only PDF, JPEG, or PNG documents are accepted." }),
  }),
  sizeBytes: z.number().int().positive().max(DOCUMENT_MAX_BYTES, "File must be 5 MB or smaller."),
  contentBase64: z
    .string()
    .min(1, "Document content is required.")
    .max(Math.ceil(DOCUMENT_MAX_BYTES / 3) * 4, "File must be 5 MB or smaller.")
    .regex(BASE64_PATTERN, "Document content is not valid base64."),
});

export type DocumentUploadRequest = z.infer<typeof documentUploadSchema>;

// Identifies the real format from file bytes, so a renamed file is rejected.
export function sniffDocumentMime(bytes: Uint8Array): string | null {
  const isPdf =
    bytes.length >= 5 &&
    bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46 && bytes[4] === 0x2d;
  if (isPdf) return "application/pdf";
  const image = sniffImageMime(bytes);
  return image === "image/jpeg" || image === "image/png" ? image : null;
}

// Client-side pre-check; the server repeats these rules.
export function validateDocumentFile(file: File): string[] {
  const errors: string[] = [];
  if (!(DOCUMENT_MIME_TYPES as readonly string[]).includes(file.type)) {
    errors.push("Only PDF, JPEG, or PNG documents are accepted.");
  }
  if (file.size <= 0) errors.push("The selected file is empty.");
  if (file.size > DOCUMENT_MAX_BYTES) errors.push("File must be 5 MB or smaller.");
  return errors;
}
