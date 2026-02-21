import { createServerFn } from '@tanstack/react-start'
import { getCookie, setCookie } from '@tanstack/react-start/server'
import { getClinicsCollection } from '@/lib/collections'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'
const COOKIE_NAME = 'admin_token'
const TOKEN_EXPIRY = '24h'

export interface AdminSession {
  email: string
  clinicSlug: string
}

// Fallback mock admin for development without MongoDB
const MOCK_ADMINS = [
  {
    email: 'admin@sonrisa.com',
    passwordHash: '$2b$10$QgjYsVwEBBS7fCRTPQ8Sx.S2hgiP80jedlclVZl82iphshHv0G6/u',
    clinicSlug: 'clinica-dental-sonrisa',
  },
]

export const loginFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string; password: string }) => input)
  .handler(async ({ data }): Promise<{ success: boolean; error?: string }> => {
    const bcrypt = await import('bcryptjs')
    const jwt = await import('jsonwebtoken')

    // Try real DB first
    try {
      const clinicsCollection = await getClinicsCollection()
      const clinic = await clinicsCollection.findOne({ adminEmail: data.email })

      if (clinic?.adminPasswordHash) {
        const valid = await bcrypt.compare(data.password, clinic.adminPasswordHash)
        if (valid) {
          const token = jwt.default.sign(
            { email: clinic.adminEmail!, clinicSlug: clinic.slug } satisfies AdminSession,
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
        }
        return { success: false, error: 'invalid_credentials' }
      }
    } catch (error) {
      console.error('DB login failed, falling back to mock:', error)
    }

    // Fallback to mock admins
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

export async function autoLoginAfterOnboarding(email: string): Promise<void> {
  const jwt = await import('jsonwebtoken')
  try {
    const clinicsCollection = await getClinicsCollection()
    const clinic = await clinicsCollection.findOne({ adminEmail: email })
    if (!clinic) return

    const token = jwt.default.sign(
      { email: clinic.adminEmail!, clinicSlug: clinic.slug } satisfies AdminSession,
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
  } catch (error) {
    console.error('Auto-login after onboarding failed:', error)
  }
}

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
