import "@testing-library/jest-dom/vitest";
import { afterEach } from "vitest";
import { cleanup } from "@testing-library/react";
import { resetRepositoryCache } from "@/lib/api";

if (typeof URL.createObjectURL !== "function") {
  URL.createObjectURL = () => "blob:mock-preview";
}

if (typeof URL.revokeObjectURL !== "function") {
  URL.revokeObjectURL = () => undefined;
}

afterEach(() => {
  cleanup();
  resetRepositoryCache();
  process.env.NEXT_PUBLIC_DATA_MODE = "mock";
  delete process.env.NEXT_PUBLIC_API_BASE_URL;
});
