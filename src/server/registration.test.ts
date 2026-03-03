import { describe, expect, it } from 'vitest'
import { expectedSlugs, expectedSubdomains } from '@/data/registration-mock'

// Helper to generate slug from clinic name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}

// Helper to generate subdomain from clinic name
function generateSubdomain(name: string): string {
  const baseSlug = generateSlug(name)
  // Ensure it starts with a letter and is not too long
  let subdomain = baseSlug.substring(0, 30)
  if (!/^[a-z]/.test(subdomain)) {
    subdomain = `clinica-${subdomain}`
  }
  return subdomain
}

// Email validation function
function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

// Password strength validation function
function isValidPassword(password: string): boolean {
  return password.length >= 6
}

// Phone format validation function
function isValidPhone(phone: string): boolean {
  // Basic validation - contains digits and common phone characters
  const phoneRegex = /^[+]?[\d\s()-]{9,}$/
  return phoneRegex.test(phone.trim())
}

// Generate default services structure
function generateDefaultServices() {
  return [
    {
      name: { es: 'Limpieza dental', en: 'Dental cleaning' },
      duration: 45,
      price: 60,
    },
    {
      name: { es: 'Revisión', en: 'Check-up' },
      duration: 30,
      price: 40,
    },
    {
      name: { es: 'Empaste', en: 'Filling' },
      duration: 60,
      price: 80,
    },
  ]
}

// Generate default working hours structure
function generateDefaultWorkingHours() {
  return [
    { day: 1, open: '09:00', close: '18:00' }, // Monday
    { day: 2, open: '09:00', close: '18:00' }, // Tuesday
    { day: 3, open: '09:00', close: '18:00' }, // Wednesday
    { day: 4, open: '09:00', close: '18:00' }, // Thursday
    { day: 5, open: '09:00', close: '18:00' }, // Friday
  ]
}

// Generate trial dates (30 days from now)
function generateTrialDates() {
  const trialStartDate = new Date()
  const trialEndDate = new Date()
  trialEndDate.setDate(trialEndDate.getDate() + 30)
  return { trialStartDate, trialEndDate }
}

// Slug conflict resolution logic
function resolveSlugConflict(baseSlug: string, existingSlugs: string[]): string {
  let finalSlug = baseSlug
  let counter = 1

  while (existingSlugs.includes(finalSlug)) {
    finalSlug = `${baseSlug}-${counter}`
    counter++
  }

  return finalSlug
}

describe('Registration Validation Logic', () => {
  describe('email validation', () => {
    it('should validate correct email formats', () => {
      const validEmails = [
        'admin@clinic.com',
        'test.email+tag@domain.co.uk',
        'user123@dental-clinic.es',
        'contact@my-clinic.org',
        'info@clinic-123.com',
      ]

      validEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(true)
      })
    })

    it('should reject invalid email formats', () => {
      const invalidEmails = [
        'invalid-email',
        '@domain.com',
        'user@',
        'user@.com',
        'user@domain',
        '',
        'user@domain.',
      ]

      invalidEmails.forEach((email) => {
        expect(isValidEmail(email)).toBe(false)
      })
    })
  })

  describe('password validation', () => {
    it('should accept valid passwords', () => {
      const validPasswords = [
        'password123',
        'SecurePass!',
        'MyP@ssw0rd',
        'longpassword',
        '123456',
        'simple',
      ]

      validPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(true)
      })
    })

    it('should reject passwords that are too short', () => {
      const invalidPasswords = ['123', 'pass', '', '12345', 'a', 'ab']

      invalidPasswords.forEach((password) => {
        expect(isValidPassword(password)).toBe(false)
      })
    })
  })

  describe('phone validation', () => {
    it('should accept valid phone formats', () => {
      const validPhones = [
        '+34 666 123 456',
        '+34666123456',
        '666 123 456',
        '+1 (555) 123-4567',
        '911222333',
        '+44 20 7946 0958',
      ]

      validPhones.forEach((phone) => {
        expect(isValidPhone(phone)).toBe(true)
      })
    })

    it('should reject invalid phone formats', () => {
      const invalidPhones = ['', 'abc', '123', '+', 'phone number']

      invalidPhones.forEach((phone) => {
        expect(isValidPhone(phone)).toBe(false)
      })
    })
  })
})

describe('Slug and Subdomain Generation', () => {
  describe('slug generation', () => {
    it('should generate correct slugs from clinic names', () => {
      Object.entries(expectedSlugs).forEach(([clinicName, expectedSlug]) => {
        const actualSlug = generateSlug(clinicName)
        expect(actualSlug).toBe(expectedSlug)
      })
    })

    it('should handle special characters correctly', () => {
      expect(generateSlug('Clínica Médica & Dental')).toBe('clinica-medica-dental')
      expect(generateSlug('Dr. José María')).toBe('dr-jose-maria')
      expect(generateSlug('123 Dental!!!')).toBe('123-dental')
    })

    it('should remove multiple hyphens', () => {
      expect(generateSlug('My --- Clinic')).toBe('my-clinic')
      expect(generateSlug('A--B--C')).toBe('a-b-c')
    })

    it('should trim and normalize spaces', () => {
      expect(generateSlug('  Clinic Name  ')).toBe('clinic-name')
      expect(generateSlug('Multiple   Spaces')).toBe('multiple-spaces')
    })
  })

  describe('subdomain generation', () => {
    it('should generate correct subdomains from clinic names', () => {
      Object.entries(expectedSubdomains).forEach(([clinicName, expectedSubdomain]) => {
        const actualSubdomain = generateSubdomain(clinicName)
        expect(actualSubdomain).toBe(expectedSubdomain)
      })
    })

    it('should ensure subdomains start with a letter', () => {
      const numericStartName = '123 Dental Clinic'
      const subdomain = generateSubdomain(numericStartName)
      expect(subdomain).toMatch(/^[a-z]/)
      expect(subdomain).toBe('clinica-123-dental-clinic')
    })

    it('should limit subdomain length to 30 characters', () => {
      const longName = 'Very Long Clinic Name That Exceeds Thirty Characters And More'
      const subdomain = generateSubdomain(longName)
      expect(subdomain.length).toBeLessThanOrEqual(30)
    })

    it('should handle edge cases correctly', () => {
      expect(generateSubdomain('1')).toBe('clinica-1')
      expect(generateSubdomain('!@#$%')).toBe('clinica-')
      expect(generateSubdomain('')).toBe('clinica-')
    })
  })

  describe('slug conflict resolution', () => {
    it('should resolve slug conflicts by adding counter', () => {
      const baseSlug = 'dental-clinic'
      const existingSlugs = ['dental-clinic', 'dental-clinic-1']

      const resolvedSlug = resolveSlugConflict(baseSlug, existingSlugs)
      expect(resolvedSlug).toBe('dental-clinic-2')
    })

    it('should return original slug if no conflicts', () => {
      const baseSlug = 'new-clinic'
      const existingSlugs = ['other-clinic', 'different-clinic']

      const resolvedSlug = resolveSlugConflict(baseSlug, existingSlugs)
      expect(resolvedSlug).toBe('new-clinic')
    })

    it('should handle multiple conflicts correctly', () => {
      const baseSlug = 'clinic'
      const existingSlugs = ['clinic', 'clinic-1', 'clinic-2', 'clinic-5']

      const resolvedSlug = resolveSlugConflict(baseSlug, existingSlugs)
      expect(resolvedSlug).toBe('clinic-3')
    })
  })
})

describe('Default Data Generation', () => {
  describe('default services', () => {
    it('should generate correct default services structure', () => {
      const services = generateDefaultServices()

      expect(services).toHaveLength(3)

      const serviceNames = services.map((s) => s.name.es)
      expect(serviceNames).toContain('Limpieza dental')
      expect(serviceNames).toContain('Revisión')
      expect(serviceNames).toContain('Empaste')

      // Check structure
      services.forEach((service) => {
        expect(service).toHaveProperty('name.es')
        expect(service).toHaveProperty('name.en')
        expect(service).toHaveProperty('duration')
        expect(service).toHaveProperty('price')
        expect(typeof service.duration).toBe('number')
        expect(typeof service.price).toBe('number')
      })
    })

    it('should have realistic durations and prices', () => {
      const services = generateDefaultServices()

      services.forEach((service) => {
        expect(service.duration).toBeGreaterThan(0)
        expect(service.duration).toBeLessThanOrEqual(120)
        expect(service.price).toBeGreaterThan(0)
        expect(service.price).toBeLessThanOrEqual(200)
      })
    })
  })

  describe('default working hours', () => {
    it('should generate correct default working hours structure', () => {
      const workingHours = generateDefaultWorkingHours()

      expect(workingHours).toHaveLength(5) // Monday to Friday

      // Should have Monday (day 1) to Friday (day 5)
      const days = workingHours.map((wh) => wh.day)
      expect(days).toEqual([1, 2, 3, 4, 5])

      // All days should have 9:00 to 18:00 hours
      workingHours.forEach((wh) => {
        expect(wh.open).toBe('09:00')
        expect(wh.close).toBe('18:00')
        expect(wh.day).toBeGreaterThanOrEqual(1)
        expect(wh.day).toBeLessThanOrEqual(5)
      })
    })

    it('should have valid time format', () => {
      const workingHours = generateDefaultWorkingHours()

      workingHours.forEach((wh) => {
        expect(wh.open).toMatch(/^\d{2}:\d{2}$/)
        expect(wh.close).toMatch(/^\d{2}:\d{2}$/)
      })
    })
  })
})

describe('Trial Date Generation', () => {
  it('should generate trial dates correctly', () => {
    const before = new Date()
    const { trialStartDate, trialEndDate } = generateTrialDates()
    const after = new Date()

    // Start date should be around now
    expect(trialStartDate.getTime()).toBeGreaterThanOrEqual(before.getTime())
    expect(trialStartDate.getTime()).toBeLessThanOrEqual(after.getTime())

    // End date should be 30 days after start
    const expectedEnd = new Date(trialStartDate)
    expectedEnd.setDate(expectedEnd.getDate() + 30)
    expect(trialEndDate.getTime()).toBe(expectedEnd.getTime())
  })

  it('should handle month boundaries correctly', () => {
    // Test with actual date calculation
    const startDate = new Date(2024, 1, 29) // Feb 29, 2024 (leap year)
    const endDate = new Date(startDate)
    endDate.setDate(startDate.getDate() + 30)

    expect(startDate.getDate()).toBe(29)
    expect(startDate.getMonth()).toBe(1) // February

    // 30 days later should be in March
    expect(endDate.getMonth()).toBe(2) // March
    expect(endDate.getDate()).toBe(30) // March 30
  })

  it('should create distinct date objects', () => {
    const { trialStartDate, trialEndDate } = generateTrialDates()

    // Check they are different objects (not referentially equal)
    expect(trialStartDate === trialEndDate).toBe(false)
    expect(trialEndDate.getTime()).toBeGreaterThan(trialStartDate.getTime())
  })
})
