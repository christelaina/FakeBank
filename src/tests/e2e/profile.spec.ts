import { expect, test } from "./fixtures";

function uniquePhone() {
  return `+1 (416) 555-${String(Date.now()).slice(-4)}`;
}

// The e2eUser fixture signs in a fresh user; context.request shares that session cookie.
test("profile PATCH updates the phone and records change history", async ({ context, e2eUser }) => {
  expect(e2eUser.email).toMatch(/@fakebank\.com$/);
  const request = context.request;
  const original = (await (await request.get("/api/profile")).json()).data.phone as string;
  const next = uniquePhone();

  const patch = await request.patch("/api/profile", { data: { phone: next } });
  expect(patch.ok()).toBe(true);
  expect((await patch.json()).data.phone).toBe(next);

  const history = await request.get("/api/profile/history");
  const entries = (await history.json()).data as { field: string; summary: string }[];
  expect(entries[0]).toMatchObject({ field: "phone", summary: "Updated mobile number" });

  const restore = await request.patch("/api/profile", { data: { phone: original } });
  expect(restore.ok()).toBe(true);
});

test("profile form saves and persists the phone number", async ({ page, context, e2eUser }) => {
  expect(e2eUser.email).toMatch(/@fakebank\.com$/);
  const request = context.request;
  const original = (await (await request.get("/api/profile")).json()).data.phone as string;
  const next = uniquePhone();

  await page.goto("/profile");
  await expect(page.getByRole("heading", { name: "Profile and Settings" })).toBeVisible();

  const phone = page.getByLabel("Phone");
  await phone.fill(next);
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();

  await page.reload();
  await expect(page.getByLabel("Phone")).toHaveValue(next);

  await page.getByLabel("Phone").fill(original);
  await page.getByRole("button", { name: "Save preferences" }).click();
  await expect(page.getByText("Profile saved.")).toBeVisible();
});
