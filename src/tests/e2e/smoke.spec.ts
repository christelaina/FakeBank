import { expect, test } from "./fixtures";

test("dashboard and accounts navigation smoke", async ({ page, e2eUser }) => {
  // e2eUser registers a fresh user and sets the session cookie before the page loads.
  expect(e2eUser.email).toMatch(/@fakebank\.com$/);

  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Total assets")).toBeVisible();

  await page.getByRole("link", { name: "Accounts" }).first().click();
  await expect(page).toHaveURL(/\/accounts/);
  await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
  await expect(page.getByText("Everyday Chequing")).toBeVisible();
});
