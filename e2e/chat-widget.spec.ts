import { test, expect } from "@playwright/test";

test.describe("Chat Widget", () => {
	test("shows floating chat button on landing page", async ({ page }) => {
		await page.goto("/");
		await page.waitForLoadState("networkidle");
		await expect(page.getByTestId("chat-toggle")).toBeVisible({
			timeout: 15000,
		});
	});
});
