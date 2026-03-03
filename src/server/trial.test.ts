import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import {
  canAccessFeature,
  createTrial,
  getFeaturesByPlan,
  getPlanPrice,
  getTrialDaysRemaining,
  getTrialInfo,
  isTrialExpired,
  type PlanType,
} from './trial'

describe('createTrial', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T00:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should create a 30-day trial by default', () => {
    const trial = createTrial()

    expect(trial.startDate).toEqual(new Date('2024-01-15T00:00:00Z'))
    expect(trial.endDate).toEqual(new Date('2024-02-14T00:00:00Z'))
  })

  it('should create custom duration trial', () => {
    const trial = createTrial(7)

    expect(trial.startDate).toEqual(new Date('2024-01-15T00:00:00Z'))
    expect(trial.endDate).toEqual(new Date('2024-01-22T00:00:00Z'))
  })

  it('should handle zero duration', () => {
    const trial = createTrial(0)

    expect(trial.startDate).toEqual(new Date('2024-01-15T00:00:00Z'))
    expect(trial.endDate).toEqual(new Date('2024-01-15T00:00:00Z'))
  })
})

describe('getTrialDaysRemaining', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should calculate remaining days correctly', () => {
    const endDate = new Date('2024-01-20T12:00:00Z')
    expect(getTrialDaysRemaining(endDate)).toBe(5)
  })

  it('should return 0 for expired trials', () => {
    const endDate = new Date('2024-01-10T12:00:00Z')
    expect(getTrialDaysRemaining(endDate)).toBe(0)
  })

  it('should round up partial days', () => {
    const endDate = new Date('2024-01-16T06:00:00Z') // 18 hours from now
    expect(getTrialDaysRemaining(endDate)).toBe(1)
  })

  it('should handle same day expiry', () => {
    const endDate = new Date('2024-01-15T18:00:00Z') // 6 hours from now
    expect(getTrialDaysRemaining(endDate)).toBe(1)
  })

  it('should handle exact expiry time', () => {
    const endDate = new Date('2024-01-15T12:00:00Z') // Exactly now
    expect(getTrialDaysRemaining(endDate)).toBe(0)
  })
})

describe('isTrialExpired', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return false for active trials', () => {
    const endDate = new Date('2024-01-20T12:00:00Z')
    expect(isTrialExpired(endDate)).toBe(false)
  })

  it('should return true for expired trials', () => {
    const endDate = new Date('2024-01-10T12:00:00Z')
    expect(isTrialExpired(endDate)).toBe(true)
  })

  it('should return true for exactly expired trials', () => {
    const endDate = new Date('2024-01-15T12:00:00Z')
    expect(isTrialExpired(endDate)).toBe(true)
  })
})

describe('getTrialInfo', () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.setSystemTime(new Date('2024-01-15T12:00:00Z'))
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('should return null for missing dates', () => {
    expect(getTrialInfo()).toBe(null)
    expect(getTrialInfo(new Date())).toBe(null)
    expect(getTrialInfo(undefined, new Date())).toBe(null)
  })

  it('should return trial info for active trial', () => {
    const startDate = new Date('2024-01-10T12:00:00Z')
    const endDate = new Date('2024-01-20T12:00:00Z')

    const info = getTrialInfo(startDate, endDate)

    expect(info).toEqual({
      startDate,
      endDate,
      isActive: true,
      daysRemaining: 5,
    })
  })

  it('should return trial info for expired trial', () => {
    const startDate = new Date('2024-01-01T12:00:00Z')
    const endDate = new Date('2024-01-10T12:00:00Z')

    const info = getTrialInfo(startDate, endDate)

    expect(info).toEqual({
      startDate,
      endDate,
      isActive: false,
      daysRemaining: 0,
    })
  })
})

describe('getFeaturesByPlan', () => {
  it('should return starter plan features', () => {
    const features = getFeaturesByPlan('starter')

    expect(features.maxAppointments).toBe('unlimited')
    expect(features.maxDoctors).toBe(5)
    expect(features.maxLocations).toBe(1)
    expect(features.hasWebsite).toBe(true)
    expect(features.hasAdvancedCRM).toBe(false)
    expect(features.hasSocialMedia).toBe(false)
    expect(features.support).toBe('email')
  })

  it('should return professional plan features', () => {
    const features = getFeaturesByPlan('professional')

    expect(features.maxAppointments).toBe('unlimited')
    expect(features.maxDoctors).toBe(15)
    expect(features.maxLocations).toBe(3)
    expect(features.hasAdvancedCRM).toBe(true)
    expect(features.hasSocialMedia).toBe(true)
    expect(features.hasAnalytics).toBe(true)
    expect(features.support).toBe('priority')
  })

  it('should return enterprise plan features', () => {
    const features = getFeaturesByPlan('enterprise')

    expect(features.maxAppointments).toBe('unlimited')
    expect(features.maxDoctors).toBe('unlimited')
    expect(features.maxLocations).toBe('unlimited')
    expect(features.hasAPI).toBe(true)
    expect(features.hasCustomBranding).toBe(true)
    expect(features.support).toBe('24/7')
  })

  it('should default to starter for invalid plan', () => {
    // Test with an invalid plan type by casting through unknown
    const features = getFeaturesByPlan('invalid' as unknown as PlanType)
    expect(features.maxDoctors).toBe(5)
    expect(features.support).toBe('email')
  })
})

describe('getPlanPrice', () => {
  it('should return correct prices', () => {
    expect(getPlanPrice('starter')).toEqual({ monthly: 199, currency: 'EUR' })
    expect(getPlanPrice('professional')).toEqual({ monthly: 349, currency: 'EUR' })
    expect(getPlanPrice('enterprise')).toEqual({ monthly: 499, currency: 'EUR' })
  })
})

describe('canAccessFeature', () => {
  it('should allow boolean features when enabled', () => {
    expect(canAccessFeature('professional', 'hasAdvancedCRM')).toBe(true)
    expect(canAccessFeature('starter', 'hasAdvancedCRM')).toBe(false)
  })

  it('should allow unlimited features', () => {
    expect(canAccessFeature('starter', 'maxAppointments', 1000)).toBe(true)
    expect(canAccessFeature('enterprise', 'maxDoctors', 100)).toBe(true)
  })

  it('should check numeric limits correctly', () => {
    expect(canAccessFeature('starter', 'maxDoctors', 3)).toBe(true)
    expect(canAccessFeature('starter', 'maxDoctors', 5)).toBe(false)
    expect(canAccessFeature('starter', 'maxDoctors', 6)).toBe(false)
  })

  it('should allow string features', () => {
    expect(canAccessFeature('enterprise', 'support')).toBe(true)
    expect(canAccessFeature('starter', 'support')).toBe(true)
  })
})
