import { expect, test } from '@playwright/test'

test.describe('Patients Page', () => {
  test('unauthenticated access to patients redirects to login', async ({ page }) => {
    await page.goto('/admin/patients')
    await page.waitForLoadState('networkidle')
    await expect(page).toHaveURL(/\/admin\/login/, { timeout: 15000 })
  })
})
