import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const COOKIE_NAME = 'admin_token'
const TOKEN_EXPIRY = '24h'

export interface AdminSession {
  email: string
  clinicSlug: string
}

// Mock admin users — will be replaced by MongoDB
// Password hashes are pre-computed for 'admin123'
const MOCK_ADMINS = [
  {
    email: 'admin@sonrisa.com',
    // bcrypt hash of 'admin123'
    passwordHash: '$2b$10$QgjYsVwEBBS7fCRTPQ8Sx.S2hgiP80jedlclVZl82iphshHv0G6/u',
    clinicSlug: 'clinica-dental-sonrisa',
  },
]

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const bcrypt = await import('bcryptjs')
    const jwt = await import('jsonwebtoken')

    const admin = MOCK_ADMINS.find((a) => a.email === data.email)
    if (!admin || !bcrypt.compareSync(data.password, admin.passwordHash)) {
      return { success: false, error: 'invalid_credentials' }
    }

    const token = jwt.default.sign(
      { email: admin.email, clinicSlug: admin.clinicSlug } satisfies AdminSession,
      JWT_SECRET,
      { expiresIn: TOKEN_EXPIRY },
    )
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
    const jwt = await import('jsonwebtoken')
    const token = getCookie(COOKIE_NAME)
    if (!token) return null
    try {
      return jwt.default.verify(token, JWT_SECRET) as AdminSession
    } catch {
      return null
    }
  },
)
