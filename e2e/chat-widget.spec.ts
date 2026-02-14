import { expect, test } from "@playwright/test";
import { gotoAndWaitForHydration } from "./helpers";

test.describe("Chat Widget", () => {
	test("shows floating chat button on landing page", async ({ page }) => {
		await gotoAndWaitForHydration(page, "/");
		await expect(page.getByTestId("chat-toggle")).toBeVisible({
			timeout: 15000,
		});
	});
});
