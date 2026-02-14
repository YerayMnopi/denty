import { describe, expect, it } from 'vitest'
import { generateToken, hashPassword, verifyPassword, verifyToken } from './auth'

describe('auth', () => {
  describe('hashPassword / verifyPassword', () => {
    it('should hash and verify a password', () => {
      const hash = hashPassword('admin123')
      expect(hash).not.toBe('admin123')
      expect(verifyPassword('admin123', hash)).toBe(true)
    })

    it('should reject wrong password', () => {
      const hash = hashPassword('admin123')
      expect(verifyPassword('wrong', hash)).toBe(false)
    })
  })

  describe('generateToken / verifyToken', () => {
    it('should generate and verify a JWT', () => {
      const payload = { email: 'admin@sonrisa.com', clinicSlug: 'clinica-dental-sonrisa' }
      const token = generateToken(payload)
      const decoded = verifyToken(token)
      expect(decoded).not.toBeNull()
      expect(decoded?.email).toBe(payload.email)
      expect(decoded?.clinicSlug).toBe(payload.clinicSlug)
    })

    it('should return null for invalid token', () => {
      expect(verifyToken('invalid.token.here')).toBeNull()
    })

    it('should return null for empty string', () => {
      expect(verifyToken('')).toBeNull()
    })
  })
})
