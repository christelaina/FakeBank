"use client";

import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { Alert } from "@/components/feedback/Alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { apiRequest } from "@/lib/api/client";
import { LAB_FILE_CONTENT_MAX, LAB_FILE_PURPOSE_LABELS, LAB_FILE_PURPOSES, type LabFileMimeType, type LabFilePurpose } from "@/lib/lab/file-challenge";
import { ApiError } from "@/types/api";

const TYPE_OPTIONS: { value: LabFileMimeType; label: string }[] = [
  { value: "image/png", label: "PNG image" },
  { value: "image/jpeg", label: "JPEG image" },
  { value: "application/pdf", label: "PDF document" },
];

export function LabFileForm({ defaultPurpose }: { defaultPurpose: LabFilePurpose }) {
  const router = useRouter();
  const [fileName, setFileName] = useState("");
  const [mimeType, setMimeType] = useState<LabFileMimeType>("image/png");
  const [purpose, setPurpose] = useState<LabFilePurpose>(defaultPurpose);
  const [content, setContent] = useState("");
  const [pending, setPending] = useState(false);
  const [message, setMessage] = useState<{ tone: "success" | "error"; text: string } | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);
    setMessage(null);
    try {
      const saved = await apiRequest<{ fileName: string }>("/api/lab/challenges/file/files", {
        method: "POST",
        body: { fileName: fileName.trim(), mimeType, purpose, content },
        sameOrigin: true,
      });
      setMessage({ tone: "success", text: `${saved.fileName} saved. Open it from the list below.` });
      setContent("");
      router.refresh();
    } catch (caught: unknown) {
      setMessage({
        tone: "error",
        text: caught instanceof ApiError ? caught.message : "The file could not be saved.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <Label htmlFor="lab-file-name">File name</Label>
        <Input
          id="lab-file-name"
          value={fileName}
          maxLength={120}
          onChange={(event) => setFileName(event.target.value)}
          placeholder="statement.png"
          required
        />
      </div>
      <div>
        <Label htmlFor="lab-file-type">File type</Label>
        <Select
          id="lab-file-type"
          value={mimeType}
          onChange={(event) => setMimeType(event.target.value as LabFileMimeType)}
        >
          {TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="lab-file-purpose">Purpose</Label>
        <Select
          id="lab-file-purpose"
          value={purpose}
          onChange={(event) => setPurpose(event.target.value as LabFilePurpose)}
        >
          {LAB_FILE_PURPOSES.map((option) => (
            <option key={option} value={option}>
              {LAB_FILE_PURPOSE_LABELS[option]}
            </option>
          ))}
        </Select>
      </div>
      <div>
        <Label htmlFor="lab-file-content">Raw file data</Label>
        <Textarea
          id="lab-file-content"
          value={content}
          maxLength={LAB_FILE_CONTENT_MAX}
          onChange={(event) => setContent(event.target.value)}
          placeholder="Describe the contents of your file"
          required
        />
        <p className="mt-1 text-xs text-brand-800/60">
          Up to {LAB_FILE_CONTENT_MAX} characters. Only you can open the saved file.
        </p>
      </div>
      <Button type="submit" disabled={pending || content.trim().length === 0}>
        {pending ? "Saving..." : "Save file"}
      </Button>
      {message ? (
        <Alert tone={message.tone === "success" ? "success" : "error"}>
          <p>{message.text}</p>
        </Alert>
      ) : null}
    </form>
  );
}
