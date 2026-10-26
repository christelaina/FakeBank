// src/tests/e2e/fixtures.ts
// Registers a fresh user through the browser context so the session cookie is shared with `page`.
import { test as base, expect } from "@playwright/test";

export type E2EUser = { email: string; password: string; displayName: string };

export const SESSION_COOKIE = "fakebank_session";

export const test = base.extend<{ e2eUser: E2EUser }>({
  e2eUser: async ({ context }, use) => {
    const unique = `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
    const user: E2EUser = {
      // Registration only accepts STARTER_ACCOUNT_DOMAIN (see src/lib/config/starter-accounts.ts).
      email: `e2e-${unique}@fakebank.com`,
      password: "e2e-password-123",
      displayName: "E2E User",
    };

    const response = await context.request.post("/api/auth/register", {
      data: {
        displayName: user.displayName,
        email: user.email,
        password: user.password,
        savingsNickname: null,
        creditNickname: null,
      },
    });
    expect(response.ok(), await response.text()).toBeTruthy();

    await use(user);
  },
});

export { expect };
