import { expect, test } from "@playwright/test";

test.describe("Admin Panel", () => {
	test("login page loads", async ({ page }) => {
		await page.goto("/admin/login");
		await page.waitForLoadState("networkidle");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
		// Verify we're on the login page by checking URL
		await expect(page).toHaveURL(/\/admin\/login/);
	});

	test("dashboard page loads", async ({ page }) => {
		await page.goto("/admin/dashboard");
		await page.waitForLoadState("networkidle");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("appointments page loads", async ({ page }) => {
		await page.goto("/admin/appointments");
		await page.waitForLoadState("networkidle");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("doctors page loads", async ({ page }) => {
		await page.goto("/admin/doctors");
		await page.waitForLoadState("networkidle");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});

	test("settings page loads", async ({ page }) => {
		await page.goto("/admin/settings");
		await page.waitForLoadState("networkidle");
		await expect(page.locator("body")).toBeVisible({ timeout: 15000 });
	});
});
