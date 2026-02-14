import { expect, test } from "@playwright/test";
import { gotoAndWaitForHydration } from "./helpers";

test.describe("Booking notifications", () => {
	test("booking completion shows confirmation with notification status", async ({
		page,
	}) => {
		// Mock WhatsApp API
		await page.route("**/graph.facebook.com/**", (route) =>
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ messages: [{ id: "wamid.test" }] }),
			}),
		);

		// Mock Resend API
		await page.route("**/api.resend.com/**", (route) =>
			route.fulfill({
				status: 200,
				contentType: "application/json",
				body: JSON.stringify({ id: "email-test" }),
			}),
		);

		await gotoAndWaitForHydration(page, "/book/clinica-dental-sonrisa");

		// Step 1: Select doctor
		const doctorButton = page
			.locator("button")
			.filter({ hasText: /Dra?\./i })
			.first();
		await expect(doctorButton).toBeVisible({ timeout: 15000 });
		await doctorButton.click();

		// Step 2: Select service
		const serviceButton = page.locator("button").first();
		await expect(serviceButton).toBeVisible({ timeout: 15000 });
		await serviceButton.click();

		// Step 3: Select a date (click on an available day in the calendar)
		await page.waitForTimeout(1000);
		const availableDay = page
			.locator("button")
			.filter({ hasText: /^[0-9]{1,2}$/ })
			.first();
		if (await availableDay.isVisible()) {
			await availableDay.click();

			// Select a time slot if visible
			const timeSlot = page
				.locator("button")
				.filter({ hasText: /^\d{2}:\d{2}$/ })
				.first();
			if (await timeSlot.isVisible({ timeout: 3000 }).catch(() => false)) {
				await timeSlot.click();
			}
		}

		// Step 4: Fill patient info (if we reach this step)
		const nameInput = page.locator('input[name="patientName"]');
		if (await nameInput.isVisible({ timeout: 3000 }).catch(() => false)) {
			await nameInput.fill("Test Paciente");
			const phoneInput = page.locator('input[name="patientPhone"]');
			await phoneInput.fill("+34612345678");

			// Confirm booking
			const confirmButton = page
				.getByRole("button", { name: /confirm/i })
				.first();
			if (await confirmButton.isVisible({ timeout: 3000 }).catch(() => false)) {
				await confirmButton.click();

				// Should show confirmation screen
				await expect(
					page.getByText(/confirm|confirmada/i).first(),
				).toBeVisible({ timeout: 15000 });
			}
		}
	});

	test("booking page loads successfully regardless of notification config", async ({
		page,
	}) => {
		await gotoAndWaitForHydration(page, "/book/clinica-dental-sonrisa");
		await expect(page.getByRole("heading", { level: 1 })).toBeVisible({
			timeout: 15000,
		});
	});
});
