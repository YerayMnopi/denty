import { expect, test } from '@playwright/test'

test.describe('Booking flow', () => {
  test('booking page loads from clinic page CTA', async ({ page }) => {
    await page.goto('/clinics/clinica-dental-sonrisa')
    await page.getByRole('link', { name: /book/i }).first().click()
    await expect(page).toHaveURL(/\/book\/clinica-dental-sonrisa/)
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible()
  })

  test('multi-step flow: select doctor, service, shows date step', async ({ page }) => {
    await page.goto('/book/clinica-dental-sonrisa')

    // Step 1: Select a doctor
    const doctorButton = page.getByRole('button').filter({ hasText: /Dr\./ }).first()
    await expect(doctorButton).toBeVisible()
    await doctorButton.click()

    // Step 2: Select a service
    const serviceButton = page.getByRole('button').filter({ hasText: /€/ }).first()
    await expect(serviceButton).toBeVisible()
    await serviceButton.click()

    // Step 3: Date/time picker should be visible
    await expect(page.getByRole('heading', { level: 2 })).toBeVisible()
  })

  test('booking page shows step indicators', async ({ page }) => {
    await page.goto('/book/clinica-dental-sonrisa')

    // The step indicator should show multiple steps
    const stepText = page.locator('text=/booking\\.select/i').first()
    await expect(stepText).toBeVisible()
  })

  test('preselected doctor skips doctor step', async ({ page }) => {
    // Get first doctor slug from the clinic page
    await page.goto('/book/clinica-dental-sonrisa?doctor=dra-maria-garcia')

    // Should go directly to service selection (no doctor selection step visible)
    const serviceHeading = page.getByText(/service/i).first()
    await expect(serviceHeading).toBeVisible({ timeout: 5000 })
  })
})
