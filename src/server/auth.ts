import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const COOKIE_NAME = 'admin_token'
const TOKEN_EXPIRY = '24h'

export interface AdminSession {
  email: string
  clinicSlug: string
}

// Mock admin users — will be replaced by MongoDB
const MOCK_ADMINS = [
  {
    email: 'admin@sonrisa.com',
    passwordHash: bcrypt.hashSync('admin123', 10),
    clinicSlug: 'clinica-dental-sonrisa',
  },
]

export function hashPassword(password: string): string {
  return bcrypt.hashSync(password, 10)
}

export function verifyPassword(password: string, hash: string): boolean {
  return bcrypt.compareSync(password, hash)
}

export function generateToken(payload: AdminSession): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: TOKEN_EXPIRY })
}

export function verifyToken(token: string): AdminSession | null {
  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const admin = MOCK_ADMINS.find((a) => a.email === data.email)
    if (!admin || !verifyPassword(data.password, admin.passwordHash)) {
      return { success: false, error: 'invalid_credentials' }
    }

    const token = generateToken({ email: admin.email, clinicSlug: admin.clinicSlug })
    setCookie(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 60 * 60 * 24,
      path: '/',
    })

    return { success: true }
  })

export const logoutFn = createServerFn({ method: 'POST' }).handler(async () => {
  setCookie(COOKIE_NAME, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  })
  return { success: true }
})

export const getSessionFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<AdminSession | null> => {
    const token = getCookie(COOKIE_NAME)
    if (!token) return null
    return verifyToken(token)
  },
)
