import { expect, test } from "@playwright/test";

test("dashboard and accounts navigation smoke", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("heading", { name: "Overview" })).toBeVisible();
  await expect(page.getByText("Total assets")).toBeVisible();

  await page.getByRole("link", { name: "Accounts" }).first().click();
  await expect(page).toHaveURL(/\/accounts/);
  await expect(page.getByRole("heading", { name: "Accounts" })).toBeVisible();
  await expect(page.getByText("Everyday Chequing")).toBeVisible();
});
