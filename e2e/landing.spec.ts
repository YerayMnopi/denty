import { test, expect } from "@playwright/test";

test("landing page loads", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("h1")).toBeVisible();
});

test("search bar is visible", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("combobox")).toBeVisible();
});

test("navigation links work", async ({ page }) => {
  await page.goto("/");
  await page.click('a[href="/clinics"]');
  await expect(page).toHaveURL(/\/clinics/);
});
