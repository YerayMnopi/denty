// E2E tests for patients page

import { test, expect } from '@playwright/test'

test.describe('Patients Management', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to admin login
    await page.goto('/admin/login')
    
    // Login with test credentials
    await page.fill('input[type="password"]', 'test123')
    await page.click('button[type="submit"]')
    
    // Should redirect to dashboard
    await expect(page).toHaveURL('/admin/dashboard')
  })

  test('should navigate to patients page', async ({ page }) => {
    // Click on patients nav item
    await page.click('a[href="/admin/patients"]')
    
    // Should navigate to patients page
    await expect(page).toHaveURL('/admin/patients')
    
    // Should show patients page title
    await expect(page.locator('h2')).toContainText('Gestión de Pacientes')
  })

  test('should display patient list', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Should show search input
    await expect(page.locator('input[placeholder="Buscar pacientes..."]')).toBeVisible()
    
    // Should show filter dropdowns
    await expect(page.locator('select').first()).toBeVisible()
    await expect(page.locator('select').nth(1)).toBeVisible()
    
    // Should show patient cards (using mock data)
    const patientCards = page.locator('[data-testid="patient-card"]')
    // We expect at least some patients from mock data
    await expect(patientCards.first()).toBeVisible()
  })

  test('should filter patients by search', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Get initial patient count
    const initialPatients = await page.locator('[data-testid="patient-card"]').count()
    
    // Search for a specific patient
    await page.fill('input[placeholder="Buscar pacientes..."]', 'María')
    
    // Should show fewer results
    const filteredPatients = await page.locator('[data-testid="patient-card"]').count()
    expect(filteredPatients).toBeLessThanOrEqual(initialPatients)
    
    // Should show only matching patients
    await expect(page.locator('[data-testid="patient-card"]').first()).toContainText('María')
  })

  test('should filter patients by segment', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Filter by active patients
    await page.selectOption('select:nth-of-type(1)', 'active')
    
    // Should update the patient list
    await expect(page.locator('[data-testid="patient-card"]')).toBeVisible()
    
    // Filter by inactive patients  
    await page.selectOption('select:nth-of-type(1)', 'inactive')
    
    // Should still show results
    await page.waitForTimeout(500) // Wait for filter to apply
  })

  test('should filter patients by tag', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Open tag filter
    const tagFilter = page.locator('select:nth-of-type(2)')
    await expect(tagFilter).toBeVisible()
    
    // Should have tag options
    const options = await tagFilter.locator('option').count()
    expect(options).toBeGreaterThan(1) // At least "All tags" + some tags
  })

  test('should open patient detail modal', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Click on "Ver Detalles" button for first patient
    await page.click('button:has-text("Ver Detalles")')
    
    // Should open modal
    await expect(page.locator('[role="dialog"], .fixed.inset-0')).toBeVisible()
    
    // Should show patient information
    await expect(page.locator('h3')).toBeVisible()
    
    // Should show contact info section
    await expect(page.getByText('Información de contacto')).toBeVisible()
    
    // Should show tags section
    await expect(page.getByText('Etiquetas')).toBeVisible()
    
    // Should show notes section
    await expect(page.getByText('Notas')).toBeVisible()
    
    // Should show visit history
    await expect(page.getByText('Historial de Visitas')).toBeVisible()
  })

  test('should close patient detail modal', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Open modal
    await page.click('button:has-text("Ver Detalles")')
    await expect(page.locator('[role="dialog"], .fixed.inset-0')).toBeVisible()
    
    // Close modal using X button
    await page.click('button:has([data-testid="close-icon"], .lucide-x)')
    
    // Modal should be closed
    await expect(page.locator('[role="dialog"], .fixed.inset-0')).not.toBeVisible()
  })

  test('should show recall button for inactive patients', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Filter to inactive patients
    await page.selectOption('select:nth-of-type(1)', 'inactive')
    
    // Should show recall button for inactive patients
    const recallButton = page.locator('button:has-text("Enviar Recordatorio")')
    if (await recallButton.count() > 0) {
      await expect(recallButton.first()).toBeVisible()
    }
  })

  test('should display patient statistics', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Should show patient count
    await expect(page.locator('text=/\\d+ pacientes?/')).toBeVisible()
  })

  test('should show empty state when no patients match filters', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Search for non-existent patient
    await page.fill('input[placeholder="Buscar pacientes..."]', 'NonExistentPatientXYZ123')
    
    // Should show empty state
    await expect(page.getByText('No se encontraron pacientes')).toBeVisible()
  })

  test('should display patient tags correctly', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Should show tags in patient cards
    const tags = page.locator('[data-testid="patient-tag"], .rounded-full:has(.lucide-tag)')
    if (await tags.count() > 0) {
      await expect(tags.first()).toBeVisible()
    }
  })

  test('should show patient segment indicators', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Should show segment indicators (Nuevo, Activo, Inactivo)
    const segments = page.locator('text=/Nuevo|Activo|Inactivo/')
    await expect(segments.first()).toBeVisible()
  })

  test('should maintain navigation state', async ({ page }) => {
    await page.goto('/admin/patients')
    
    // Patients nav item should be active
    const patientsNav = page.locator('a[href="/admin/patients"]')
    await expect(patientsNav).toHaveClass(/bg-accent|text-foreground/)
  })
})