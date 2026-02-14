import { test, expect } from '@playwright/test'

test.describe('Chat Widget', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('shows floating chat button', async ({ page }) => {
    const toggle = page.getByTestId('chat-toggle')
    await expect(toggle).toBeVisible()
  })

  test('opens chat panel when clicking the button', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    const panel = page.getByTestId('chat-panel')
    await expect(panel).toBeVisible()
  })

  test('shows welcome message when opened', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    const messages = page.getByTestId('chat-messages')
    await expect(messages).toBeVisible()
  })

  test('closes chat panel with close button', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    await expect(page.getByTestId('chat-panel')).toBeVisible()
    await page.getByTestId('chat-close').click()
    await expect(page.getByTestId('chat-panel')).not.toBeVisible()
    await expect(page.getByTestId('chat-toggle')).toBeVisible()
  })

  test('minimizes chat panel', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    await expect(page.getByTestId('chat-panel')).toBeVisible()
    await page.getByTestId('chat-minimize').click()
    await expect(page.getByTestId('chat-panel')).not.toBeVisible()
    await expect(page.getByTestId('chat-toggle')).toBeVisible()
  })

  test('can type a message in the input', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    const input = page.getByTestId('chat-input')
    await input.fill('Hola, ¿qué servicios ofrecen?')
    await expect(input).toHaveValue('Hola, ¿qué servicios ofrecen?')
  })

  test('send button is disabled when input is empty', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    const sendBtn = page.getByTestId('chat-send')
    await expect(sendBtn).toBeDisabled()
  })

  test('send button is enabled when input has text', async ({ page }) => {
    await page.getByTestId('chat-toggle').click()
    await page.getByTestId('chat-input').fill('Hola')
    const sendBtn = page.getByTestId('chat-send')
    await expect(sendBtn).toBeEnabled()
  })

  test('sends a message and shows it in the chat', async ({ page }) => {
    // Mock the server function response
    await page.route('**/_server', async (route) => {
      const postData = route.request().postData()
      if (postData?.includes('sendChatMessage')) {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            message: '¡Hola! ¿En qué puedo ayudarte?',
          }),
        })
      } else {
        await route.continue()
      }
    })

    await page.getByTestId('chat-toggle').click()
    await page.getByTestId('chat-input').fill('Hola')
    await page.getByTestId('chat-send').click()

    // User message should appear
    const messages = page.getByTestId('chat-messages')
    await expect(messages.locator('text=Hola')).toBeVisible()
  })
})
