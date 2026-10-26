import { describe, expect, it } from "vitest";
import { hasExecutableMarkup } from "@/lib/lab/xss";

describe("hasExecutableMarkup", () => {
  it("detects inline event handlers and script tags", () => {
    expect(hasExecutableMarkup('<img src=x onerror="alert(1)">')).toBe(true);
    expect(hasExecutableMarkup("<svg onload=alert(1)>")).toBe(true);
    expect(hasExecutableMarkup("<script>alert(1)</script>")).toBe(true);
  });

  it("ignores plain text and escaped markup", () => {
    expect(hasExecutableMarkup("Rent for March")).toBe(false);
    expect(hasExecutableMarkup("Coffee &lt;b&gt;bold&lt;/b&gt;")).toBe(false);
    expect(hasExecutableMarkup("<b>bold</b>")).toBe(false);
  });
});
