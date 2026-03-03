import { describe, expect, it } from 'vitest'
import { generateSlug, validateEmail, validatePassword } from './registration'

describe('generateSlug', () => {
  it('should convert basic text to slug', () => {
    expect(generateSlug('Clínica Dental Sonrisa')).toBe('clinica-dental-sonrisa')
  })

  it('should handle accented characters', () => {
    expect(generateSlug('Clínica García López')).toBe('clinica-garcia-lopez')
  })

  it('should handle special characters', () => {
    expect(generateSlug('Dr. María José & Associates!')).toBe('dr-maria-jose-associates')
  })

  it('should handle multiple spaces', () => {
    expect(generateSlug('Dental    Care    Center')).toBe('dental-care-center')
  })

  it('should handle leading/trailing spaces and hyphens', () => {
    expect(generateSlug('  -Dental Center-  ')).toBe('dental-center')
  })

  it('should handle empty string', () => {
    expect(generateSlug('')).toBe('')
  })

  it('should handle numbers', () => {
    expect(generateSlug('Clínica 24 Horas')).toBe('clinica-24-horas')
  })
})

describe('validateEmail', () => {
  it('should validate correct emails', () => {
    expect(validateEmail('admin@clinica.com')).toBe(true)
    expect(validateEmail('user.name+tag@domain.co.uk')).toBe(true)
    expect(validateEmail('test123@test-domain.org')).toBe(true)
  })

  it('should reject invalid emails', () => {
    expect(validateEmail('invalid')).toBe(false)
    expect(validateEmail('invalid@')).toBe(false)
    expect(validateEmail('@domain.com')).toBe(false)
    expect(validateEmail('user@')).toBe(false)
    expect(validateEmail('user@domain')).toBe(false)
    expect(validateEmail('')).toBe(false)
    expect(validateEmail('user spaces@domain.com')).toBe(false)
  })
})

describe('validatePassword', () => {
  it('should validate strong passwords', () => {
    const result = validatePassword('MyStrong123')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should validate password with special characters', () => {
    const result = validatePassword('Complex1!')
    expect(result.isValid).toBe(true)
    expect(result.errors).toHaveLength(0)
  })

  it('should reject short passwords', () => {
    const result = validatePassword('Short1')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters long')
  })

  it('should reject passwords without uppercase', () => {
    const result = validatePassword('lowercase123')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one uppercase letter')
  })

  it('should reject passwords without lowercase', () => {
    const result = validatePassword('UPPERCASE123')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one lowercase letter')
  })

  it('should reject passwords without numbers', () => {
    const result = validatePassword('NoNumbers')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must contain at least one number')
  })

  it('should return multiple errors for weak password', () => {
    const result = validatePassword('weak')
    expect(result.isValid).toBe(false)
    expect(result.errors.length).toBeGreaterThan(1)
    expect(result.errors).toContain('Password must be at least 8 characters long')
    expect(result.errors).toContain('Password must contain at least one uppercase letter')
    expect(result.errors).toContain('Password must contain at least one number')
  })

  it('should handle empty password', () => {
    const result = validatePassword('')
    expect(result.isValid).toBe(false)
    expect(result.errors).toContain('Password must be at least 8 characters long')
  })
})
