import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

describe('auth utilities', () => {
  describe('bcrypt hashing', () => {
    it('should hash and verify a password', () => {
      const hash = bcrypt.hashSync('admin123', 10)
      expect(hash).not.toBe('admin123')
      expect(bcrypt.compareSync('admin123', hash)).toBe(true)
    })

    it('should reject wrong password', () => {
      const hash = bcrypt.hashSync('admin123', 10)
      expect(bcrypt.compareSync('wrong', hash)).toBe(false)
    })
  })

  describe('JWT tokens', () => {
    it('should generate and verify a JWT', () => {
      const payload = { email: 'admin@sonrisa.com', clinicSlug: 'clinica-dental-sonrisa' }
      const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' })
      const decoded = jwt.verify(token, JWT_SECRET) as typeof payload
      expect(decoded).not.toBeNull()
      expect(decoded.email).toBe(payload.email)
      expect(decoded.clinicSlug).toBe(payload.clinicSlug)
    })

    it('should throw for invalid token', () => {
      expect(() => jwt.verify('invalid.token.here', JWT_SECRET)).toThrow()
    })

    it('should throw for empty string', () => {
      expect(() => jwt.verify('', JWT_SECRET)).toThrow()
    })
  })
})
