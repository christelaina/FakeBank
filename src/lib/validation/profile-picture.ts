import { z } from "zod";

export const PROFILE_PICTURE_MAX_BYTES = 2 * 1024 * 1024;
export const PROFILE_PICTURE_MIME_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"] as const;

const BASE64_PATTERN = /^[A-Za-z0-9+/]+={0,2}$/;

export const profilePictureUploadSchema = z.object({
  fileName: z.string().trim().min(1).max(255),
  mimeType: z.enum(PROFILE_PICTURE_MIME_TYPES, {
    errorMap: () => ({ message: "Only JPEG, PNG, WebP, or GIF images are accepted." }),
  }),
  sizeBytes: z
    .number()
    .int()
    .positive()
    .max(PROFILE_PICTURE_MAX_BYTES, "File must be 2 MB or smaller."),
  contentBase64: z
    .string()
    .min(1, "Image content is required.")
    .max(Math.ceil(PROFILE_PICTURE_MAX_BYTES / 3) * 4, "File must be 2 MB or smaller.")
    .regex(BASE64_PATTERN, "Image content is not valid base64."),
});

export type ProfilePictureUploadRequest = z.infer<typeof profilePictureUploadSchema>;

// Identifies the real format from file bytes, so a renamed or spoofed file is rejected.
export function sniffImageMime(bytes: Uint8Array): string | null {
  const ascii = (start: number, length: number) =>
    String.fromCharCode(...bytes.slice(start, start + length));

  if (bytes.length >= 3 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) {
    return "image/jpeg";
  }
  if (bytes.length >= 4 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) {
    return "image/png";
  }
  if (bytes.length >= 6 && (ascii(0, 6) === "GIF87a" || ascii(0, 6) === "GIF89a")) {
    return "image/gif";
  }
  if (bytes.length >= 12 && ascii(0, 4) === "RIFF" && ascii(8, 4) === "WEBP") {
    return "image/webp";
  }
  return null;
}
