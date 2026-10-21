import path from "path";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: ["./src/tests/setup.ts"],
    include: ["src/tests/**/*.{test,spec}.{ts,tsx}"],
    exclude: ["src/tests/e2e/**", "node_modules/**"],
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
