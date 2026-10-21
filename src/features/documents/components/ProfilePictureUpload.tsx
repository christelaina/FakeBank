"use client";

import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { uploadProfilePicture } from "@/lib/api/documents";
import { formatFileSize } from "@/lib/formatting/currency";
import {
  createSafeImagePreviewUrl,
  validateProfilePictureFile,
} from "@/lib/validation/upload";
import { ApiError } from "@/types/api";
import { ChangeEvent, useEffect, useState } from "react";

export function ProfilePictureUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [verifiedByBackend, setVerifiedByBackend] = useState<boolean | null>(null);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setStatusMessage(null);
    setVerifiedByBackend(null);

    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
      setPreviewUrl(null);
    }

    if (!selected) {
      setFile(null);
      setErrors([]);
      return;
    }

    const validation = validateProfilePictureFile(selected);
    setErrors(validation.errors);
    setFile(validation.ok ? selected : null);
    setPreviewUrl(validation.ok ? createSafeImagePreviewUrl(selected) : null);
  }

  async function onUpload() {
    if (!file) return;
    setUploading(true);
    setStatusMessage(null);
    try {
      const result = await uploadProfilePicture({
        fileName: file.name,
        mimeType: file.type,
        sizeBytes: file.size,
      });
      setStatusMessage(result.message);
      setVerifiedByBackend(result.verifiedByBackend);
    } catch (err) {
      setStatusMessage(
        err instanceof ApiError ? err.message : "Upload failed.",
      );
      setVerifiedByBackend(false);
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <label htmlFor="profile-picture" className="mb-1.5 block text-sm font-medium">
          Profile picture
        </label>
        <input
          id="profile-picture"
          type="file"
          accept="image/jpeg,image/png,image/webp,image/gif"
          onChange={onFileChange}
          className="block w-full text-sm text-brand-800 file:mr-3 file:rounded-md file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white"
        />
        <p className="mt-2 text-xs text-brand-800/60">
          JPEG, PNG, WebP, or GIF up to 2 MB. SVG/HTML uploads are rejected and never rendered
          as active markup.
        </p>
      </div>

      {errors.length > 0 ? (
        <Alert tone="error" title="Unsupported file">
          <ul className="list-disc pl-4">
            {errors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </Alert>
      ) : null}

      {file && previewUrl ? (
        <div className="flex flex-col gap-4 rounded-lg border border-surface-border bg-surface p-4 sm:flex-row sm:items-center">
          <div className="relative h-24 w-24 overflow-hidden rounded-full border border-surface-border bg-white">
            {/* Intentionally an <img> for local object-URL preview only; never SVG/HTML markup. */}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={previewUrl}
              alt="Selected profile preview"
              className="h-full w-full object-cover"
            />
          </div>
          <div className="text-sm">
            <p className="font-medium text-brand-950">{file.name}</p>
            <p className="mt-1 text-brand-800/70">
              {formatFileSize(file.size)} · {file.type || "unknown type"}
            </p>
            <p className="mt-1 text-brand-800/70">Preview status: local only</p>
            <Button className="mt-3" onClick={onUpload} disabled={uploading}>
              {uploading ? "Uploading…" : "Submit upload metadata"}
            </Button>
          </div>
        </div>
      ) : null}

      {statusMessage ? (
        <Alert tone={verifiedByBackend ? "success" : "info"}>
          <p>{statusMessage}</p>
          {verifiedByBackend === false ? (
            <p className="mt-2 font-medium">
              Selecting or mock-uploading a file is not evidence of a successful security exploit.
            </p>
          ) : null}
        </Alert>
      ) : null}
    </div>
  );
}
