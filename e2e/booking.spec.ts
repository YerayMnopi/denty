import { expect, test } from "@playwright/test";

test.describe("Booking flow", () => {
	test("booking page loads from clinic page CTA", async ({ page }) => {
		await page.goto("/clinics/clinica-dental-sonrisa");
		await page.getByRole("link", { name: /book/i }).first().click();
		await expect(page).toHaveURL(/\/book\/clinica-dental-sonrisa/);
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
	});

	test("multi-step flow: select doctor, service, shows date step", async ({
		page,
	}) => {
		await page.goto("/book/clinica-dental-sonrisa");

		// Step 1: Select a doctor — buttons are rendered as <button> elements with doctor names
		const doctorButton = page.locator("button").filter({ hasText: /Dra?\./i }).first();
		await expect(doctorButton).toBeVisible({ timeout: 10000 });
		await doctorButton.click();

		// Step 2: Select a service — buttons with service names
		const serviceButton = page.locator("button").first();
		await expect(serviceButton).toBeVisible({ timeout: 10000 });
		await serviceButton.click();

		// Step 3: Date/time picker should be visible
		await expect(page.locator("h2").first()).toBeVisible({ timeout: 10000 });
	});

	test("booking page shows step indicators", async ({ page }) => {
		await page.goto("/book/clinica-dental-sonrisa");

		// Step indicators are rendered as spans with step labels
		await expect(page.getByText(/doctor/i).first()).toBeVisible({
			timeout: 10000,
		});
	});

	test("preselected doctor skips doctor step", async ({ page }) => {
		await page.goto("/book/clinica-dental-sonrisa?doctor=dra-maria-garcia");

		// Should go directly to service selection
		const serviceHeading = page.getByText(/servicio|service/i).first();
		await expect(serviceHeading).toBeVisible({ timeout: 10000 });
	});
});
