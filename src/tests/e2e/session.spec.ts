// src/tests/e2e/session.spec.ts
import { expect, SESSION_COOKIE, test } from "./fixtures";

// Requesting the e2eUser fixture registers a fresh user and sets the session cookie on the context.
test("signed-in user can open the profile page", async ({ page, e2eUser }) => {
  expect(e2eUser.email).toMatch(/@fakebank\.com$/);
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/profile/);
  await expect(page.getByRole("heading", { name: "Profile and Settings" })).toBeVisible();
  await expect(page.getByText("Unexpected error.")).toHaveCount(0);
});

test("invalid session cookie on a server page redirects to sign-in", async ({ page, context, baseURL }) => {
  // A cookie that passes the middleware's presence check but fails server-side validation.
  await context.addCookies([
    { name: SESSION_COOKIE, value: "not-a-real-token", url: baseURL ?? "http://127.0.0.1:3000" },
  ]);

  await page.goto("/profile");
  await expect(page).toHaveURL(/\/sign-in/);
  await expect(page.getByText("Unexpected error.")).toHaveCount(0);
});

test("signed-out visit to a server page redirects to sign-in", async ({ page }) => {
  await page.goto("/documents");
  await expect(page).toHaveURL(/\/sign-in/);
});
