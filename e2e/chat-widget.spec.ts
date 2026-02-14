import { test, expect } from "@playwright/test";
import { gotoAndWaitForHydration } from "./helpers";

test.describe("Chat Widget", () => {
	test("shows floating chat button on landing page", async ({ page }) => {
		await gotoAndWaitForHydration(page, "/");
		await expect(page.getByTestId("chat-toggle")).toBeVisible({
			timeout: 15000,
		});
	});

	test("opens and closes chat panel", async ({ page }) => {
		await gotoAndWaitForHydration(page, "/");
		const toggle = page.getByTestId("chat-toggle");
		await expect(toggle).toBeVisible({ timeout: 15000 });
		await toggle.click();

		// Chat panel should open
		const chatPanel = page.getByTestId("chat-panel");
		await expect(chatPanel).toBeVisible({ timeout: 5000 });

		// Close it
		await toggle.click();
		await expect(chatPanel).not.toBeVisible({ timeout: 5000 });
	});

	test("chat input accepts text", async ({ page }) => {
		await gotoAndWaitForHydration(page, "/");
		await page.getByTestId("chat-toggle").click();
		await expect(page.getByTestId("chat-panel")).toBeVisible({ timeout: 5000 });

		const input = page.getByTestId("chat-panel").getByRole("textbox");
		await expect(input).toBeVisible({ timeout: 5000 });
		await input.fill("Hola, necesito una cita");
		await expect(input).toHaveValue("Hola, necesito una cita");
	});
});
