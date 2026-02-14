import { expect, test } from "@playwright/test";
import { gotoAndWaitForHydration } from "./helpers";

test.describe("Booking flow", () => {
	test("booking page loads", async ({ page }) => {
		await gotoAndWaitForHydration(page, "/book/clinica-dental-sonrisa");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("booking page shows step indicators", async ({ page }) => {
		await gotoAndWaitForHydration(page, "/book/clinica-dental-sonrisa");
		await expect(page.getByText(/doctor/i).first()).toBeVisible({
			timeout: 15000,
		});
	});

	test("preselected doctor shows service step", async ({ page }) => {
		await gotoAndWaitForHydration(
			page,
			"/book/clinica-dental-sonrisa?doctor=dra-maria-garcia",
		);
		const serviceHeading = page.getByText(/servicio|service/i).first();
		await expect(serviceHeading).toBeVisible({ timeout: 15000 });
	});
});
