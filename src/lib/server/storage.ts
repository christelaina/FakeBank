// src/lib/server/storage.ts
import { del, get, put } from "@vercel/blob";

// Private blobs are only reachable through authenticated API routes.
export async function putPrivateObject(
  pathname: string,
  bytes: Uint8Array,
  contentType: string,
): Promise<string> {
  const blob = await put(pathname, Buffer.from(bytes), {
    access: "private",
    contentType,
    addRandomSuffix: false,
  });
  return blob.pathname;
}

export async function getPrivateObject(
  pathname: string,
): Promise<{ stream: ReadableStream<Uint8Array>; contentType: string } | null> {
  const result = await get(pathname, { access: "private", useCache: false });
  if (!result || result.statusCode !== 200) return null;
  return { stream: result.stream, contentType: result.blob.contentType };
}

export async function deletePrivateObject(pathname: string): Promise<void> {
  await del(pathname);
}
