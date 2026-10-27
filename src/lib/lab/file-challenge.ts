import { z } from "zod";

export const LAB_FILE_TYPES = {
  "image/png": [".png"],
  "image/jpeg": [".jpg", ".jpeg"],
  "application/pdf": [".pdf"],
} as const;

export type LabFileMimeType = keyof typeof LAB_FILE_TYPES;

export const LAB_FILE_CONTENT_MAX = 2000;

// The name check is the only type check. Contents are stored as text and never sniffed.
export function nameMatchesType(fileName: string, mimeType: LabFileMimeType): boolean {
  const lower = fileName.toLowerCase();
  return LAB_FILE_TYPES[mimeType].some((extension) => lower.endsWith(extension));
}

export function containsScript(content: string): boolean {
  return /<script[\s>]|\son[a-z]+\s*=|javascript:/i.test(content);
}

export const LAB_FILE_PURPOSES = ["document", "profile_picture"] as const;

export type LabFilePurpose = (typeof LAB_FILE_PURPOSES)[number];

export const LAB_FILE_PURPOSE_LABELS: Record<LabFilePurpose, string> = {
  document: "Document",
  profile_picture: "Profile picture",
};

export const labFileSchema = z.object({
  fileName: z.string().trim().min(1).max(120),
  mimeType: z.enum(["image/png", "image/jpeg", "application/pdf"]),
  purpose: z.enum(LAB_FILE_PURPOSES),
  content: z.string().min(1).max(LAB_FILE_CONTENT_MAX),
});
