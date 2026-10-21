import { describe, expect, it } from "vitest";
import {
  createSafeImagePreviewUrl,
  validateProfilePictureFile,
} from "@/lib/validation/upload";

function makeFile(name: string, type: string, size = 128) {
  const contents = new Uint8Array(size);
  return new File([contents], name, { type });
}

describe("profile picture upload validation", () => {
  it("rejects unsupported SVG/HTML uploads", () => {
    const svg = validateProfilePictureFile(
      makeFile("avatar.svg", "image/svg+xml"),
    );
    expect(svg.ok).toBe(false);
    expect(svg.errors.join(" ")).toMatch(/SVG|HTML|accepted/i);

    const html = validateProfilePictureFile(makeFile("note.html", "text/html"));
    expect(html.ok).toBe(false);
  });

  it("accepts ordinary images for local preview", () => {
    const file = makeFile("avatar.png", "image/png", 2048);
    const result = validateProfilePictureFile(file);
    expect(result.ok).toBe(true);
    const url = createSafeImagePreviewUrl(file);
    expect(url).toMatch(/^blob:/);
    if (url) URL.revokeObjectURL(url);
  });
});
