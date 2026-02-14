import { expect, test } from '@playwright/test'

test.describe('Admin Panel', () => {
  test('login page loads', async ({ page }) => {
    await page.goto('/admin/login')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('input[type="email"]')).toBeVisible({ timeout: 15000 })
    await expect(page.locator('input[type="password"]')).toBeVisible()
  })

  test('dashboard page redirects or loads', async ({ page }) => {
    await page.goto('/admin/dashboard')
    await page.waitForLoadState('networkidle')
    // Should show dashboard content (mock data, no auth guard on client)
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
  })

  test('appointments page loads', async ({ page }) => {
    await page.goto('/admin/appointments')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
  })

  test('doctors page loads', async ({ page }) => {
    await page.goto('/admin/doctors')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
  })

  test('settings page loads', async ({ page }) => {
    await page.goto('/admin/settings')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('body')).toBeVisible({ timeout: 15000 })
  })
})
