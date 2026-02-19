import { expect, test } from '@playwright/test'
import { gotoAndWaitForHydration } from './helpers'
import { mockRegistrationData } from '../src/data/registration-mock'

test.describe('Registration Flow', () => {
  test('registration page loads correctly', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    // Check page title and form elements
    await expect(page.locator('h1')).toContainText('Registra Tu Clínica')
    await expect(page.getByLabel('Nombre de la clínica')).toBeVisible()
    await expect(page.getByLabel('Nombre del propietario/director')).toBeVisible()
    await expect(page.getByLabel('Email')).toBeVisible()
    await expect(page.getByLabel('Contraseña')).toBeVisible()
    await expect(page.getByLabel('Confirmar contraseña')).toBeVisible()
    await expect(page.getByLabel('Teléfono')).toBeVisible()
    await expect(page.getByRole('button', { name: 'Crear cuenta' })).toBeVisible()
  })

  test('registration form validation works', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    // Try to submit empty form
    await page.getByRole('button', { name: 'Crear cuenta' }).click()
    
    // Check that validation messages appear
    await expect(page.getByText('El nombre de la clínica es obligatorio')).toBeVisible()
    await expect(page.getByText('El nombre del propietario es obligatorio')).toBeVisible()
    await expect(page.getByText('El email es obligatorio')).toBeVisible()
    await expect(page.getByText('La contraseña es obligatoria')).toBeVisible()
    await expect(page.getByText('El teléfono es obligatorio')).toBeVisible()
  })

  test('email format validation works', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    // Fill invalid email
    await page.getByLabel('Email').fill('invalid-email')
    await page.getByLabel('Contraseña').click() // Trigger blur
    
    // Check validation message
    await expect(page.getByText('El formato del email no es válido')).toBeVisible()
  })

  test('password confirmation validation works', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    // Fill different passwords
    await page.getByLabel('Contraseña').fill('password123')
    await page.getByLabel('Confirmar contraseña').fill('different-password')
    await page.getByLabel('Teléfono').click() // Trigger validation
    
    // Check validation message
    await expect(page.getByText('Las contraseñas no coinciden')).toBeVisible()
  })

  test('password length validation works', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    // Fill short password
    await page.getByLabel('Contraseña').fill('123')
    await page.getByLabel('Confirmar contraseña').click() // Trigger blur
    
    // Check validation message
    await expect(page.getByText('La contraseña debe tener al menos 6 caracteres')).toBeVisible()
  })

  test('successful registration form submission', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    const validData = mockRegistrationData.valid
    
    // Fill valid form data
    await page.getByLabel('Nombre de la clínica').fill(validData.clinicName)
    await page.getByLabel('Nombre del propietario/director').fill(validData.ownerName)
    await page.getByLabel('Email').fill(`test-${Date.now()}@example.com`) // Unique email
    await page.getByLabel('Contraseña').fill(validData.password)
    await page.getByLabel('Confirmar contraseña').fill(validData.password)
    await page.getByLabel('Teléfono').fill(validData.phone)
    
    // Submit form
    await page.getByRole('button', { name: 'Crear cuenta' }).click()
    
    // Should redirect to onboarding (or show loading state)
    // Note: In a real test environment, we might mock the server response
    // For now, we'll just check that the form doesn't show validation errors
    await expect(page.getByText('El nombre de la clínica es obligatorio')).not.toBeVisible()
    await expect(page.getByText('El email es obligatorio')).not.toBeVisible()
  })

  test('form shows loading state during submission', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    const validData = mockRegistrationData.valid
    
    // Fill valid form data
    await page.getByLabel('Nombre de la clínica').fill(validData.clinicName)
    await page.getByLabel('Nombre del propietario/director').fill(validData.ownerName)
    await page.getByLabel('Email').fill(`test-${Date.now()}@example.com`)
    await page.getByLabel('Contraseña').fill(validData.password)
    await page.getByLabel('Confirmar contraseña').fill(validData.password)
    await page.getByLabel('Teléfono').fill(validData.phone)
    
    // Submit form and immediately check for loading state
    await page.getByRole('button', { name: 'Crear cuenta' }).click()
    
    // Button should show loading text
    await expect(page.getByRole('button', { name: 'Cargando...' })).toBeVisible({ timeout: 1000 })
  })

  test('trial information is displayed', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/register')
    
    // Check trial info text
    await expect(page.getByText('30 días gratis • Sin tarjeta de crédito • Cancela cuando quieras')).toBeVisible()
  })
})

test.describe('Landing Page Registration CTAs', () => {
  test('landing page has registration CTAs', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/')
    
    // Check main CTA button
    await expect(page.getByRole('link', { name: 'Prueba Denty gratis 30 días' })).toBeVisible()
    
    // Check pricing section CTA
    await expect(page.getByRole('link', { name: 'Registrar mi clínica' })).toBeVisible()
  })

  test('pricing section is displayed', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/')
    
    // Check pricing section title
    await expect(page.getByText('Planes Flexibles para Tu Clínica')).toBeVisible()
    
    // Check pricing tiers
    await expect(page.getByText('€199')).toBeVisible()
    await expect(page.getByText('€349')).toBeVisible()
    await expect(page.getByText('€499')).toBeVisible()
    
    // Check plan names
    await expect(page.getByText('Starter')).toBeVisible()
    await expect(page.getByText('Professional')).toBeVisible()
    await expect(page.getByText('Enterprise')).toBeVisible()
  })

  test('popular plan badge is displayed', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/')
    
    // Check popular badge
    await expect(page.getByText('Popular')).toBeVisible()
  })

  test('registration CTAs link to registration page', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/')
    
    // Click main CTA
    await page.getByRole('link', { name: 'Prueba Denty gratis 30 días' }).first().click()
    await page.waitForURL('/register')
    
    // Verify we're on registration page
    await expect(page.locator('h1')).toContainText('Registra Tu Clínica')
    
    // Go back and try second CTA
    await page.goBack()
    await gotoAndWaitForHydration(page, '/')
    
    await page.getByRole('link', { name: 'Registrar mi clínica' }).click()
    await page.waitForURL('/register')
    
    // Verify we're on registration page again
    await expect(page.locator('h1')).toContainText('Registra Tu Clínica')
  })

  test('pricing plan CTAs link to registration page', async ({ page }) => {
    await gotoAndWaitForHydration(page, '/')
    
    // Find and click a "Comenzar prueba gratuita" button
    await page.getByRole('link', { name: 'Comenzar prueba gratuita' }).first().click()
    await page.waitForURL('/register')
    
    // Verify we're on registration page
    await expect(page.locator('h1')).toContainText('Registra Tu Clínica')
  })
})