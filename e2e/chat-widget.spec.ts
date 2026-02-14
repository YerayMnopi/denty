import { test, expect } from '@playwright/test'

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
  })

  test('shows floating chat button', async ({ page }) => {
    await expect(page.getByTestId('chat-toggle')).toBeVisible({ timeout: 10000 })
  })

  test('opens and closes chat panel', async ({ page }) => {
    const toggle = page.getByTestId('chat-toggle')
    await expect(toggle).toBeVisible({ timeout: 10000 })
    await toggle.click()

    const panel = page.getByTestId('chat-panel')
    await expect(panel).toBeVisible({ timeout: 10000 })

    // Close it
    await page.getByTestId('chat-close').click()
    await expect(panel).not.toBeVisible()
    await expect(toggle).toBeVisible()
  })

  test('shows messages area when opened', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    await expect(page.getByTestId('chat-messages')).toBeVisible({ timeout: 10000 })
  })

  test('has input and send button', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    await expect(page.getByTestId('chat-panel')).toBeVisible({ timeout: 10000 })
    await expect(page.getByTestId('chat-input')).toBeVisible({ timeout: 5000 })
    await expect(page.getByTestId('chat-send')).toBeVisible({ timeout: 5000 })
  })
})
