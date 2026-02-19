import { describe, expect, it } from 'vitest'

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

// Calculate days between two dates
function daysBetween(date1: Date, date2: Date): number {
  const diffTime = date2.getTime() - date1.getTime()
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

// Calculate trial days remaining from end date
function calculateTrialDaysRemaining(trialEndDate: Date): number {
  const now = new Date()
  return Math.max(0, daysBetween(now, trialEndDate))
}

// Check if trial is currently active
function isTrialActive(trialStartDate: Date, trialEndDate: Date): boolean {
  const now = new Date()
  return now >= trialStartDate && now <= trialEndDate
}

// Generate trial dates (30-day trial from now)
function generateTrialDates(): { startDate: Date; endDate: Date } {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(endDate.getDate() + 30) // 30-day trial
  return { startDate, endDate }
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

// Calculate trial status from clinic data
function calculateTrialStatus(clinicData: {
  trialStartDate?: Date | null
  trialEndDate?: Date | null
  plan?: string
}): TrialStatus {
  const now = new Date()
  const trialStartDate = clinicData.trialStartDate || null
  const trialEndDate = clinicData.trialEndDate || null

  let isActive = false
  let daysRemaining = 0

  if (trialStartDate && trialEndDate) {
    isActive = now >= trialStartDate && now <= trialEndDate
    daysRemaining = isActive ? Math.max(0, daysBetween(now, trialEndDate)) : 0
  }

  const featuresAvailable = getPlanFeatures(clinicData.plan || 'starter')

  return {
    isActive,
    daysRemaining,
    startDate: trialStartDate,
    endDate: trialEndDate,
    featuresAvailable,
  }
}

// Check if trial has expired
function isTrialExpired(trialEndDate: Date | null): boolean {
  if (!trialEndDate) return true
  const now = new Date()
  return now > trialEndDate
}

// Determine trial status category
function getTrialStatusCategory(daysRemaining: number): 'active' | 'expiring-soon' | 'expired' {
  if (daysRemaining <= 0) return 'expired'
  if (daysRemaining <= 7) return 'expiring-soon'
  return 'active'
}

// Calculate trial usage percentage
function calculateTrialUsage(startDate: Date | null, endDate: Date | null): number {
  if (!startDate || !endDate) return 0

  const now = new Date()
  const totalDuration = daysBetween(startDate, endDate)
  const elapsedDuration = daysBetween(startDate, now)

  if (elapsedDuration <= 0) return 0
  if (elapsedDuration >= totalDuration) return 100

  return Math.round((elapsedDuration / totalDuration) * 100)
}

// Validate trial dates
function validateTrialDates(
  startDate: Date,
  endDate: Date,
): {
  valid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (startDate >= endDate) {
    errors.push('Start date must be before end date')
  }

  const daysDifference = daysBetween(startDate, endDate)
  if (daysDifference !== 30) {
    errors.push('Trial period must be exactly 30 days')
  }

  const oneDayFromNow = Date.now() + 24 * 60 * 60 * 1000
  if (startDate.getTime() > oneDayFromNow) {
    errors.push('Start date cannot be more than 1 day in the future')
  }

  return {
    valid: errors.length === 0,
    errors,
  }
}

describe('Trial Days Calculation Logic', () => {
  describe('calculateTrialDaysRemaining', () => {
    it('should calculate correct days remaining for future dates', () => {
      const today = new Date()

      // 5 days remaining
      const futureDate = new Date()
      futureDate.setDate(today.getDate() + 5)
      expect(calculateTrialDaysRemaining(futureDate)).toBe(5)

      // 30 days remaining
      const thirtyDaysFromNow = new Date()
      thirtyDaysFromNow.setDate(today.getDate() + 30)
      expect(calculateTrialDaysRemaining(thirtyDaysFromNow)).toBe(30)

      // 1 day remaining
      const tomorrow = new Date()
      tomorrow.setDate(today.getDate() + 1)
      expect(calculateTrialDaysRemaining(tomorrow)).toBe(1)
    })

    it('should return 0 for expired dates', () => {
      const today = new Date()

      // 1 day expired
      const yesterday = new Date()
      yesterday.setDate(today.getDate() - 1)
      expect(calculateTrialDaysRemaining(yesterday)).toBe(0)

      // Long expired
      const longAgo = new Date()
      longAgo.setDate(today.getDate() - 30)
      expect(calculateTrialDaysRemaining(longAgo)).toBe(0)
    })

    it('should handle same day expiry correctly', () => {
      const today = new Date()
      const sameDay = new Date(today.getTime())
      sameDay.setHours(23, 59, 59, 999) // End of today

      const result = calculateTrialDaysRemaining(sameDay)
      expect(result).toBeGreaterThanOrEqual(0)
      expect(result).toBeLessThanOrEqual(1)
    })
  })

  describe('daysBetween calculation', () => {
    it('should calculate correct days between dates', () => {
      const date1 = new Date('2024-01-01')
      const date2 = new Date('2024-01-11')
      expect(daysBetween(date1, date2)).toBe(10)

      const date3 = new Date('2024-01-01')
      const date4 = new Date('2024-02-01')
      expect(daysBetween(date3, date4)).toBe(31)
    })

    it('should handle negative differences correctly', () => {
      const future = new Date('2024-01-10')
      const past = new Date('2024-01-01')
      expect(daysBetween(future, past)).toBe(-9)
    })

    it('should handle same date correctly', () => {
      const date = new Date('2024-01-01')
      expect(daysBetween(date, date)).toBe(0)
    })
  })
})

describe('Trial Status Logic', () => {
  describe('isTrialActive', () => {
    it('should determine if trial is active correctly', () => {
      const today = new Date()

      // Active trial (started yesterday, ends tomorrow)
      const startDate = new Date()
      startDate.setDate(today.getDate() - 1)
      const endDate = new Date()
      endDate.setDate(today.getDate() + 1)
      expect(isTrialActive(startDate, endDate)).toBe(true)

      // Expired trial (ended yesterday)
      const expiredStart = new Date()
      expiredStart.setDate(today.getDate() - 31)
      const expiredEnd = new Date()
      expiredEnd.setDate(today.getDate() - 1)
      expect(isTrialActive(expiredStart, expiredEnd)).toBe(false)

      // Future trial (starts tomorrow)
      const futureStart = new Date()
      futureStart.setDate(today.getDate() + 1)
      const futureEnd = new Date()
      futureEnd.setDate(today.getDate() + 31)
      expect(isTrialActive(futureStart, futureEnd)).toBe(false)
    })

    it('should handle edge cases correctly', () => {
      const now = new Date()

      // Trial starting exactly now
      const startNow = new Date(now.getTime())
      const endFuture = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)
      expect(isTrialActive(startNow, endFuture)).toBe(true)

      // Trial ending exactly now
      const startPast = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      const endNow = new Date(now.getTime())
      expect(isTrialActive(startPast, endNow)).toBe(true)
    })
  })

  describe('isTrialExpired', () => {
    it('should correctly identify expired trials', () => {
      const yesterday = new Date()
      yesterday.setDate(yesterday.getDate() - 1)
      expect(isTrialExpired(yesterday)).toBe(true)

      const tomorrow = new Date()
      tomorrow.setDate(tomorrow.getDate() + 1)
      expect(isTrialExpired(tomorrow)).toBe(false)

      expect(isTrialExpired(null)).toBe(true)
    })
  })

  describe('getTrialStatusCategory', () => {
    it('should categorize trial status correctly', () => {
      expect(getTrialStatusCategory(0)).toBe('expired')
      expect(getTrialStatusCategory(-1)).toBe('expired')
      expect(getTrialStatusCategory(1)).toBe('expiring-soon')
      expect(getTrialStatusCategory(7)).toBe('expiring-soon')
      expect(getTrialStatusCategory(8)).toBe('active')
      expect(getTrialStatusCategory(30)).toBe('active')
    })
  })
})

describe('Trial Date Generation Logic', () => {
  describe('generateTrialDates', () => {
    it('should generate trial dates correctly', () => {
      const before = new Date()
      const { startDate, endDate } = generateTrialDates()
      const after = new Date()

      // Start date should be around now
      expect(startDate.getTime()).toBeGreaterThanOrEqual(before.getTime())
      expect(startDate.getTime()).toBeLessThanOrEqual(after.getTime())

      // End date should be 30 days after start
      const expectedEnd = new Date(startDate)
      expectedEnd.setDate(expectedEnd.getDate() + 30)
      expect(endDate.getTime()).toBe(expectedEnd.getTime())
    })

    it('should handle month boundaries correctly', () => {
      // Test with specific date calculation
      const startDate = new Date(2024, 1, 29) // Feb 29, 2024
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 30)

      expect(startDate.getMonth()).toBe(1) // February
      expect(endDate.getMonth()).toBe(2) // March
    })

    it('should handle year boundaries correctly', () => {
      const startDate = new Date(2024, 11, 15) // Dec 15, 2024
      const endDate = new Date(startDate)
      endDate.setDate(startDate.getDate() + 30)

      expect(startDate.getFullYear()).toBe(2024)
      expect(endDate.getFullYear()).toBe(2025)
    })
  })

  describe('validateTrialDates', () => {
    it('should validate correct trial dates', () => {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 30)

      const result = validateTrialDates(startDate, endDate)
      expect(result.valid).toBe(true)
      expect(result.errors).toHaveLength(0)
    })

    it('should detect invalid date order', () => {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() - 1) // End before start

      const result = validateTrialDates(startDate, endDate)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Start date must be before end date')
    })

    it('should detect incorrect trial duration', () => {
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(startDate.getDate() + 20) // Only 20 days

      const result = validateTrialDates(startDate, endDate)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Trial period must be exactly 30 days')
    })

    it('should detect future start dates', () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 3) // 3 days in future
      const endDate = new Date(startDate)
      endDate.setDate(endDate.getDate() + 30)

      const result = validateTrialDates(startDate, endDate)
      expect(result.valid).toBe(false)
      expect(result.errors).toContain('Start date cannot be more than 1 day in the future')
    })
  })
})

describe('Plan Features Logic', () => {
  describe('getPlanFeatures', () => {
    it('should return correct features for starter plan', () => {
      const features = getPlanFeatures('starter')
      expect(features).toEqual({
        booking: true,
        crm: true,
        website: true,
        socialMedia: false,
      })
    })

    it('should return correct features for professional plan', () => {
      const features = getPlanFeatures('professional')
      expect(features).toEqual({
        booking: true,
        crm: true,
        website: true,
        socialMedia: true,
      })
    })

    it('should return correct features for enterprise plan', () => {
      const features = getPlanFeatures('enterprise')
      expect(features).toEqual({
        booking: true,
        crm: true,
        website: true,
        socialMedia: true,
      })
    })

    it('should return default features for unknown plans', () => {
      const features = getPlanFeatures('unknown')
      expect(features).toEqual({
        booking: true,
        crm: false,
        website: false,
        socialMedia: false,
      })
    })

    it('should handle edge cases', () => {
      expect(getPlanFeatures('')).toEqual({
        booking: true,
        crm: false,
        website: false,
        socialMedia: false,
      })

      expect(getPlanFeatures('STARTER')).toEqual({
        booking: true,
        crm: false,
        website: false,
        socialMedia: false,
      }) // Case sensitive
    })
  })

  describe('feature availability by plan tier', () => {
    it('should show progressive feature availability', () => {
      const starter = getPlanFeatures('starter')
      const professional = getPlanFeatures('professional')
      const enterprise = getPlanFeatures('enterprise')

      // Core features available in all plans
      expect(starter.booking).toBe(true)
      expect(professional.booking).toBe(true)
      expect(enterprise.booking).toBe(true)

      // Advanced features only in higher plans
      expect(starter.socialMedia).toBe(false)
      expect(professional.socialMedia).toBe(true)
      expect(enterprise.socialMedia).toBe(true)
    })
  })
})

describe('Trial Status Calculation Logic', () => {
  describe('calculateTrialStatus', () => {
    it('should calculate active trial status correctly', () => {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 5) // Started 5 days ago
      const endDate = new Date(today)
      endDate.setDate(today.getDate() + 25) // Ends in 25 days

      const clinicData = {
        trialStartDate: startDate,
        trialEndDate: endDate,
        plan: 'starter',
      }

      const status = calculateTrialStatus(clinicData)

      expect(status.isActive).toBe(true)
      expect(status.daysRemaining).toBe(25)
      expect(status.startDate).toBe(startDate)
      expect(status.endDate).toBe(endDate)
      expect(status.featuresAvailable.booking).toBe(true)
      expect(status.featuresAvailable.socialMedia).toBe(false)
    })

    it('should calculate expired trial status correctly', () => {
      const today = new Date()
      const startDate = new Date(today)
      startDate.setDate(today.getDate() - 35) // Started 35 days ago
      const endDate = new Date(today)
      endDate.setDate(today.getDate() - 5) // Ended 5 days ago

      const clinicData = {
        trialStartDate: startDate,
        trialEndDate: endDate,
        plan: 'professional',
      }

      const status = calculateTrialStatus(clinicData)

      expect(status.isActive).toBe(false)
      expect(status.daysRemaining).toBe(0)
      expect(status.featuresAvailable.socialMedia).toBe(true) // Professional plan
    })

    it('should handle missing trial dates', () => {
      const clinicData = {
        plan: 'starter',
      }

      const status = calculateTrialStatus(clinicData)

      expect(status.isActive).toBe(false)
      expect(status.daysRemaining).toBe(0)
      expect(status.startDate).toBeNull()
      expect(status.endDate).toBeNull()
      expect(status.featuresAvailable.booking).toBe(true)
    })

    it('should use default plan when plan is not specified', () => {
      const today = new Date()
      const startDate = new Date()
      const endDate = new Date()
      endDate.setDate(today.getDate() + 10)

      const clinicData = {
        trialStartDate: startDate,
        trialEndDate: endDate,
        // No plan specified
      }

      const status = calculateTrialStatus(clinicData)

      expect(status.featuresAvailable).toEqual(getPlanFeatures('starter'))
    })
  })
})

describe('Trial Usage Logic', () => {
  describe('calculateTrialUsage', () => {
    it('should calculate usage percentage correctly', () => {
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 10) // Started 10 days ago

      const endDate = new Date(now)
      endDate.setDate(now.getDate() + 20) // Ends in 20 days (30 days total)

      const usage = calculateTrialUsage(startDate, endDate)
      expect(usage).toBe(33) // 10/30 = 0.333... ≈ 33%
    })

    it('should handle not started trials', () => {
      const startDate = new Date()
      startDate.setDate(startDate.getDate() + 5) // Starts in 5 days

      const endDate = new Date()
      endDate.setDate(endDate.getDate() + 35) // Ends in 35 days

      const usage = calculateTrialUsage(startDate, endDate)
      expect(usage).toBe(0)
    })

    it('should handle completed trials', () => {
      const now = new Date()
      const startDate = new Date(now)
      startDate.setDate(now.getDate() - 30) // Started 30 days ago

      const endDate = new Date(now)
      endDate.setDate(now.getDate() - 5) // Ended 5 days ago

      const usage = calculateTrialUsage(startDate, endDate)
      expect(usage).toBe(100)
    })

    it('should handle missing dates', () => {
      expect(calculateTrialUsage(null, new Date())).toBe(0)
      expect(calculateTrialUsage(new Date(), null)).toBe(0)
      expect(calculateTrialUsage(null, null)).toBe(0)
    })
  })
})

describe('Edge Cases and Error Handling', () => {
  it('should handle daylight saving time transitions', () => {
    // Test around DST transition dates
    const beforeDST = new Date('2024-03-09') // Day before DST in US
    const afterDST = new Date('2024-03-11') // Day after DST starts

    const days = daysBetween(beforeDST, afterDST)
    expect(days).toBe(2) // Should still be 2 days despite hour change
  })

  it('should handle leap years correctly', () => {
    const startLeapYear = new Date('2024-02-28')
    const endLeapYear = new Date('2024-03-01')
    expect(daysBetween(startLeapYear, endLeapYear)).toBe(2) // Feb 29 exists

    const startNonLeapYear = new Date('2023-02-28')
    const endNonLeapYear = new Date('2023-03-01')
    expect(daysBetween(startNonLeapYear, endNonLeapYear)).toBe(1) // No Feb 29
  })

  it('should handle very large date differences', () => {
    const oldDate = new Date('1990-01-01')
    const newDate = new Date('2024-01-01')
    const years = daysBetween(oldDate, newDate)
    expect(years).toBeGreaterThan(12000) // Roughly 34 years
  })

  it('should handle same timestamp correctly', () => {
    const now = new Date()
    const sameDate1 = new Date(now.getTime())
    const sameDate2 = new Date(now.getTime())

    expect(daysBetween(sameDate1, sameDate2)).toBe(0)

    // For isTrialActive, start and end are the same, so if current time is within that moment, it should be true
    // But since we're comparing with the actual current time, let's use a time range that includes now
    const startDate = new Date(now.getTime() - 1000) // 1 second before now
    const endDate = new Date(now.getTime() + 1000) // 1 second after now
    expect(isTrialActive(startDate, endDate)).toBe(true)
  })
})
