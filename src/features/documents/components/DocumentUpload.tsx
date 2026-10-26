"use client";

import { useRouter } from "next/navigation";
import { ChangeEvent, useState } from "react";
import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { uploadDocument } from "@/lib/api/documents";
import { formatFileSize } from "@/lib/formatting/currency";
import { fileToBase64 } from "@/lib/utils/base64";
import {
  DOCUMENT_CATEGORIES,
  DocumentCategory,
  validateDocumentFile,
} from "@/lib/validation/document";
import { ApiError } from "@/types/api";

export function DocumentUpload({ enabled }: { enabled: boolean }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const [name, setName] = useState("");
  const [category, setCategory] = useState<DocumentCategory>("Statements");
  const [errors, setErrors] = useState<string[]>([]);
  const [status, setStatus] = useState<{ tone: "success" | "error"; message: string } | null>(null);
  const [uploading, setUploading] = useState(false);

  function onFileChange(event: ChangeEvent<HTMLInputElement>) {
    const selected = event.target.files?.[0] ?? null;
    setStatus(null);
    if (!selected) {
      setFile(null);
      setErrors([]);
      return;
    }
    const problems = validateDocumentFile(selected);
    setErrors(problems);
    setFile(problems.length === 0 ? selected : null);
    if (problems.length === 0 && !name) setName(selected.name);
  }

  async function onUpload() {
    if (!file) return;
    setUploading(true);
    setStatus(null);
    try {
      const saved = await uploadDocument({
        name: name.trim() || file.name,
        category,
        mimeType: file.type,
        sizeBytes: file.size,
        contentBase64: await fileToBase64(file),
      });
      setStatus({ tone: "success", message: `${saved.name} uploaded.` });
      setFile(null);
      setName("");
      setInputKey((key) => key + 1);
      router.refresh();
    } catch (err) {
      setStatus({
        tone: "error",
        message: err instanceof ApiError ? err.message : "Upload failed.",
      });
    } finally {
      setUploading(false);
    }
  }

  return (
    <div className="space-y-4">
      {!enabled ? (
        <Alert tone="info">Document upload is available in live data mode.</Alert>
      ) : null}

      <div>
        <label htmlFor="document-file" className="mb-1.5 block text-sm font-medium">
          Document file
        </label>
        <input
          key={inputKey}
          id="document-file"
          type="file"
          accept="application/pdf,image/jpeg,image/png"
          disabled={!enabled || uploading}
          onChange={onFileChange}
          className="block w-full text-sm text-brand-800 file:mr-3 file:rounded-md file:border-0 file:bg-brand-700 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white disabled:opacity-50"
        />
        <p className="mt-2 text-xs text-brand-800/60">
          PDF, JPEG, or PNG up to 5 MB. Files are stored as data and never executed.
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

      {file ? (
        <div className="space-y-3 rounded-lg border border-surface-border bg-surface p-4">
          <div>
            <Label htmlFor="document-name">Display name</Label>
            <Input
              id="document-name"
              value={name}
              maxLength={255}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="document-category">Category</Label>
            <Select
              id="document-category"
              value={category}
              onChange={(event) => setCategory(event.target.value as DocumentCategory)}
            >
              {DOCUMENT_CATEGORIES.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </Select>
          </div>
          <p className="text-sm text-brand-800/70">
            {file.name} · {formatFileSize(file.size)}
          </p>
          <Button onClick={onUpload} disabled={uploading || !enabled}>
            {uploading ? "Uploading…" : "Upload document"}
          </Button>
        </div>
      ) : null}

      {status ? (
        <Alert tone={status.tone === "success" ? "success" : "error"}>
          <p>{status.message}</p>
        </Alert>
      ) : null}
    </div>
  );
}
