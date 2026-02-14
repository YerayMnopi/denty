import { expect, test } from "@playwright/test";
import { gotoAndWaitForHydration } from "./helpers";

test("landing page loads", async ({ page }) => {
	await gotoAndWaitForHydration(page, "/");
	await expect(page.locator("h1")).toBeVisible();
});

test("search bar is visible", async ({ page }) => {
	await gotoAndWaitForHydration(page, "/");
	await expect(page.getByRole("combobox")).toBeVisible();
});
