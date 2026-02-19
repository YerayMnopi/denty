import { expect, test } from '@playwright/test'
import { gotoAndWaitForHydration } from './helpers'

test.describe('Onboarding Flow', () => {
  // Note: These tests assume authentication middleware redirects unauthenticated users
  
  test('onboarding page requires authentication', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/onboarding')
    
    // Should redirect to login or show error
    // The exact behavior depends on the authentication setup
    // We'll check that we're not on the onboarding page anymore
    expect(page.url()).not.toContain('/onboarding')
  })

  // For testing authenticated flows, we would need to set up proper authentication
  // or mock the session. Here are the test cases we would implement:

  test.describe('Authenticated Onboarding', () => {
    test.skip('onboarding page loads with progress indicator', async ({ page }) => {
      // This test would need proper authentication setup
      // await authenticateUser(page) // Helper function to set up auth
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      // Check page elements
      await expect(page.locator('h1')).toContainText('Configuración de tu clínica')
      await expect(page.getByText('Progreso')).toBeVisible()
      await expect(page.getByText('pasos completados')).toBeVisible()
      
      // Check progress bar
      await expect(page.locator('[role="progressbar"]')).toBeVisible()
      
      // Check chat interface elements
      await expect(page.getByPlaceholder('Escribe tu respuesta aquí...')).toBeVisible()
      await expect(page.getByRole('button', { name: 'Enviar' })).toBeVisible()
    })

    test.skip('welcome message is displayed', async ({ page }) => {
      // await authenticateUser(page)
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      // Check welcome message
      await expect(page.getByText(/¡Hola! Soy Denty/)).toBeVisible()
    })

    test.skip('chat interface works correctly', async ({ page }) => {
      // await authenticateUser(page)
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      const messageInput = page.getByPlaceholder('Escribe tu respuesta aquí...')
      const sendButton = page.getByRole('button', { name: 'Enviar' })
      
      // Type a message
      await messageInput.fill('Calle Gran Vía 42, Madrid, 28013')
      
      // Send button should be enabled
      await expect(sendButton).toBeEnabled()
      
      // Send message
      await sendButton.click()
      
      // Message should appear in chat
      await expect(page.getByText('Calle Gran Vía 42, Madrid, 28013')).toBeVisible()
      
      // Loading indicator should appear
      await expect(page.locator('.animate-pulse')).toBeVisible()
    })

    test.skip('progress updates correctly', async ({ page }) => {
      // await authenticateUser(page)
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      // Initial progress should be 1/5
      await expect(page.getByText('1 / 5 pasos completados')).toBeVisible()
      
      // After completing address step, should be 2/5
      await page.getByPlaceholder('Escribe tu respuesta aquí...').fill('Calle Gran Vía 42, Madrid, 28013')
      await page.getByRole('button', { name: 'Enviar' }).click()
      
      // Wait for response and progress update
      await expect(page.getByText('2 / 5 pasos completados')).toBeVisible()
    })

    test.skip('enter key sends message', async ({ page }) => {
      // await authenticateUser(page)
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      const messageInput = page.getByPlaceholder('Escribe tu respuesta aquí...')
      
      // Type message and press Enter
      await messageInput.fill('Test message')
      await messageInput.press('Enter')
      
      // Message should be sent
      await expect(page.getByText('Test message')).toBeVisible()
    })

    test.skip('shift+enter creates new line', async ({ page }) => {
      // await authenticateUser(page)
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      const messageInput = page.getByPlaceholder('Escribe tu respuesta aquí...')
      
      // Type message and press Shift+Enter
      await messageInput.fill('Line 1')
      await messageInput.press('Shift+Enter')
      await messageInput.type('Line 2')
      
      // Should have multiline content
      expect(await messageInput.inputValue()).toContain('\n')
    })

    test.skip('send button is disabled when input is empty', async ({ page }) => {
      // await authenticateUser(page)
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      const messageInput = page.getByPlaceholder('Escribe tu respuesta aquí...')
      const sendButton = page.getByRole('button', { name: 'Enviar' })
      
      // Initially should be disabled (empty)
      await expect(sendButton).toBeDisabled()
      
      // Type something
      await messageInput.fill('Test')
      await expect(sendButton).toBeEnabled()
      
      // Clear input
      await messageInput.fill('')
      await expect(sendButton).toBeDisabled()
      
      // Only whitespace
      await messageInput.fill('   ')
      await expect(sendButton).toBeDisabled()
    })

    test.skip('completed onboarding redirects to dashboard', async ({ page }) => {
      // await authenticateUser(page)
      // await setupCompletedOnboarding(page) // Helper to set up completed state
      
      await gotoAndWaitForHydration(page, '/onboarding')
      
      // Should redirect to dashboard
      await page.waitForURL('/admin/dashboard')
      await expect(page.locator('h1')).toContainText('Dashboard') // or whatever dashboard title is
    })
  })

  test('onboarding can handle direct navigation', async ({ page }) => {
    // Even without auth, the page should handle the request gracefully
    const response = await page.goto('/onboarding')
    
    // Should either redirect (3xx) or show error page (4xx), not crash (5xx)
    expect(response?.status()).toBeLessThan(500)
  })

  test('onboarding page is mobile responsive', async ({ page }) => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 })
    
    // Try to load the page (will likely redirect due to auth)
    await page.goto('/onboarding')
    
    // Page should load without horizontal scroll
    const bodyWidth = await page.evaluate(() => document.body.scrollWidth)
    const viewportWidth = await page.evaluate(() => window.innerWidth)
    
    expect(bodyWidth).toBeLessThanOrEqual(viewportWidth + 1) // Allow 1px tolerance
  })
})

// Mock helper functions (would be implemented in a real test setup)
/* 
async function authenticateUser(page: Page) {
  // Set up authentication cookie or session
  await page.context().addCookies([{
    name: 'admin_token',
    value: 'mock-jwt-token',
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false
  }])
}

async function setupCompletedOnboarding(page: Page) {
  // Mock or set up a clinic with completed onboarding
  // This would involve database setup in a real test environment
}
*/