// src/app/api/documents/route.ts
import { NextResponse } from "next/server";
import { authRequiredResponse, isAuthRequiredError } from "@/lib/server/auth/session";
import { listDocuments, saveDocument } from "@/lib/server/documents";
import {
  DOCUMENT_MAX_BYTES,
  documentUploadSchema,
  sniffDocumentMime,
} from "@/lib/validation/document";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ data: await listDocuments() });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to load documents:", error);
    return NextResponse.json(
      { code: "DOCUMENTS_FAILED", message: "Failed to load documents" },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { code: "INVALID_JSON", message: "Request body must be valid JSON." },
      { status: 400 },
    );
  }

  const parsed = documentUploadSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { code: "INVALID_DOCUMENT", message: parsed.error.issues[0]?.message ?? "Invalid document." },
      { status: 400 },
    );
  }

  const bytes = new Uint8Array(Buffer.from(parsed.data.contentBase64, "base64"));
  if (bytes.length !== parsed.data.sizeBytes || bytes.length > DOCUMENT_MAX_BYTES) {
    return NextResponse.json(
      { code: "SIZE_MISMATCH", message: "File size does not match the uploaded content." },
      { status: 400 },
    );
  }
  if (sniffDocumentMime(bytes) !== parsed.data.mimeType) {
    return NextResponse.json(
      { code: "TYPE_MISMATCH", message: "File contents do not match the declared file type." },
      { status: 400 },
    );
  }

  try {
    const document = await saveDocument({
      name: parsed.data.name,
      category: parsed.data.category,
      mimeType: parsed.data.mimeType,
      bytes,
    });
    return NextResponse.json({ data: document }, { status: 201 });
  } catch (error) {
    if (isAuthRequiredError(error)) return authRequiredResponse();
    console.error("Failed to save document:", error);
    return NextResponse.json(
      { code: "DOCUMENT_UPLOAD_FAILED", message: "Document could not be saved." },
      { status: 500 },
    );
  }
}
