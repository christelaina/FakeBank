const ALLOWED_IMAGE_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/gif",
]);

const MAX_BYTES = 2 * 1024 * 1024;

export interface UploadValidationResult {
  ok: boolean;
  errors: string[];
}

export function validateProfilePictureFile(file: File): UploadValidationResult {
  const errors: string[] = [];
  const lowerName = file.name.toLowerCase();

  if (lowerName.endsWith(".svg") || lowerName.endsWith(".html") || lowerName.endsWith(".htm")) {
    errors.push("SVG and HTML uploads are not allowed.");
  }

  if (!ALLOWED_IMAGE_TYPES.has(file.type)) {
    errors.push("Only JPEG, PNG, WebP, or GIF images are accepted.");
  }

  if (file.size <= 0) {
    errors.push("The selected file is empty.");
  }

  if (file.size > MAX_BYTES) {
    errors.push("File must be 2 MB or smaller.");
  }

  return { ok: errors.length === 0, errors };
}

/**
 * Creates an object URL for safe <img> preview only.
 * Never render uploaded content as HTML/SVG markup.
 */
export function createSafeImagePreviewUrl(file: File): string | null {
  const validation = validateProfilePictureFile(file);
  if (!validation.ok) return null;
  return URL.createObjectURL(file);
}
