import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import jwt from 'jsonwebtoken'
import { getClinicsCollection } from '@/lib/collections'
import type { AdminSession } from './auth'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

interface TrialStatus {
  isActive: boolean
  daysRemaining: number
  startDate: Date | null
  endDate: Date | null
  featuresAvailable: {
    booking: boolean
    crm: boolean
    website: boolean
    socialMedia: boolean
  }
}

// Get current user session
async function getCurrentSession(): Promise<AdminSession | null> {
  const token = getCookie('admin_token')
  if (!token) return null

  try {
    return jwt.verify(token, JWT_SECRET) as AdminSession
  } catch {
    return null
  }
}

// Calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Get features available for each plan
function getPlanFeatures(plan: string): TrialStatus['featuresAvailable'] {
  switch (plan) {
    case 'starter':
      return {
        booking: true,
        crm: true,
        website: true,
        socialMedia: false,
      }
    case 'professional':
      return {
        booking: true,
        crm: true,
        website: true,
        socialMedia: true,
      }
    case 'enterprise':
      return {
        booking: true,
        crm: true,
        website: true,
        socialMedia: true,
      }
    default:
      return {
        booking: true,
        crm: false,
        website: false,
        socialMedia: false,
      }
  }
}

export const getTrialStatusFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<TrialStatus | null> => {
    const session = await getCurrentSession()
    if (!session) {
      return null
    }

    try {
      const clinicsCollection = await getClinicsCollection()
      const clinic = await clinicsCollection.findOne({
        adminEmail: session.email,
      })

      if (!clinic) {
        return null
      }

      const now = new Date()
      const trialStartDate = clinic.trialStartDate || null
      const trialEndDate = clinic.trialEndDate || null

      let isActive = false
      let daysRemaining = 0

      if (trialStartDate && trialEndDate) {
        isActive = now <= trialEndDate
        daysRemaining = isActive ? daysBetween(now, trialEndDate) : 0
      }

      const featuresAvailable = getPlanFeatures(clinic.plan || 'starter')

      return {
        isActive,
        daysRemaining,
        startDate: trialStartDate,
        endDate: trialEndDate,
        featuresAvailable,
      }
    } catch (error) {
      console.error('Error getting trial status:', error)
      return null
    }
  },
)

export const isTrialExpiredFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ expired: boolean; daysRemaining: number }> => {
    const session = await getCurrentSession()
    if (!session) {
      return { expired: true, daysRemaining: 0 }
    }

    try {
      const clinicsCollection = await getClinicsCollection()
      const clinic = await clinicsCollection.findOne({
        adminEmail: session.email,
      })

      if (!clinic || !clinic.trialEndDate) {
        return { expired: true, daysRemaining: 0 }
      }

      const now = new Date()
      const expired = now > clinic.trialEndDate
      const daysRemaining = expired ? 0 : daysBetween(now, clinic.trialEndDate)

      return { expired, daysRemaining }
    } catch (error) {
      console.error('Error checking trial expiry:', error)
      return { expired: true, daysRemaining: 0 }
    }
  },
)

export const getTrialDaysRemainingFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<{ daysRemaining: number }> => {
    const session = await getCurrentSession()
    if (!session) {
      return { daysRemaining: 0 }
    }

    try {
      const clinicsCollection = await getClinicsCollection()
      const clinic = await clinicsCollection.findOne({
        adminEmail: session.email,
      })

      if (!clinic || !clinic.trialEndDate) {
        return { daysRemaining: 0 }
      }

      const now = new Date()
      const daysRemaining = Math.max(0, daysBetween(now, clinic.trialEndDate))

      return { daysRemaining }
    } catch (error) {
      console.error('Error getting trial days remaining:', error)
      return { daysRemaining: 0 }
    }
  },
)

// Utility functions for testing and internal use
export function calculateTrialDaysRemaining(trialEndDate: Date): number {
  const now = new Date()
  return Math.max(0, daysBetween(now, trialEndDate))
}

export function isTrialActive(trialStartDate: Date, trialEndDate: Date): boolean {
  const now = new Date()
  return now >= trialStartDate && now <= trialEndDate
}

export function generateTrialDates(): { startDate: Date; endDate: Date } {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30) // 30-day trial

  return { startDate, endDate }
}
