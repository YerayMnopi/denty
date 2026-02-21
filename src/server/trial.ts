export interface TrialInfo {
  startDate: Date
  endDate: Date
  isActive: boolean
  daysRemaining: number
}

export function createTrial(durationDays: number = 30): {
  startDate: Date
  endDate: Date
} {
  const startDate = new Date()
  const endDate = new Date()
  endDate.setDate(startDate.getDate() + durationDays)

  return {
    startDate,
    endDate,
  }
}

export function getTrialDaysRemaining(trialEnd: Date): number {
  const now = new Date()
  const diffTime = trialEnd.getTime() - now.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  return Math.max(0, diffDays)
}

export function isTrialExpired(trialEnd: Date): boolean {
  return getTrialDaysRemaining(trialEnd) === 0
}

export function getTrialInfo(trialStart?: Date, trialEnd?: Date): TrialInfo | null {
  if (!trialStart || !trialEnd) {
    return null
  }

  const daysRemaining = getTrialDaysRemaining(trialEnd)
  const isActive = daysRemaining > 0

  return {
    startDate: trialStart,
    endDate: trialEnd,
    isActive,
    daysRemaining,
  }
}

export type PlanType = 'starter' | 'professional' | 'enterprise'

export interface PlanFeatures {
  maxAppointments: number | 'unlimited'
  maxDoctors: number | 'unlimited'
  maxLocations: number | 'unlimited'
  hasWebsite: boolean
  hasAdvancedCRM: boolean
  hasSocialMedia: boolean
  hasAnalytics: boolean
  hasAPI: boolean
  hasCustomBranding: boolean
  support: 'email' | 'priority' | '24/7'
}

export function getFeaturesByPlan(plan: PlanType): PlanFeatures {
  switch (plan) {
    case 'starter':
      return {
        maxAppointments: 'unlimited',
        maxDoctors: 5,
        maxLocations: 1,
        hasWebsite: true,
        hasAdvancedCRM: false,
        hasSocialMedia: false,
        hasAnalytics: false,
        hasAPI: false,
        hasCustomBranding: false,
        support: 'email',
      }

    case 'professional':
      return {
        maxAppointments: 'unlimited',
        maxDoctors: 15,
        maxLocations: 3,
        hasWebsite: true,
        hasAdvancedCRM: true,
        hasSocialMedia: true,
        hasAnalytics: true,
        hasAPI: false,
        hasCustomBranding: false,
        support: 'priority',
      }

    case 'enterprise':
      return {
        maxAppointments: 'unlimited',
        maxDoctors: 'unlimited',
        maxLocations: 'unlimited',
        hasWebsite: true,
        hasAdvancedCRM: true,
        hasSocialMedia: true,
        hasAnalytics: true,
        hasAPI: true,
        hasCustomBranding: true,
        support: '24/7',
      }

    default:
      return getFeaturesByPlan('starter')
  }
}

export function getPlanPrice(plan: PlanType): {
  monthly: number
  currency: string
} {
  const prices = {
    starter: 199,
    professional: 349,
    enterprise: 499,
  }

  return {
    monthly: prices[plan],
    currency: 'EUR',
  }
}

export function canAccessFeature(
  plan: PlanType,
  feature: keyof PlanFeatures,
  currentValue?: number,
): boolean {
  const features = getFeaturesByPlan(plan)
  const featureLimit = features[feature]

  // Handle boolean features
  if (typeof featureLimit === 'boolean') {
    return featureLimit
  }

  // Handle unlimited features
  if (featureLimit === 'unlimited') {
    return true
  }

  // Handle numeric limits
  if (typeof featureLimit === 'number' && currentValue !== undefined) {
    return currentValue < featureLimit
  }

  // Handle string features (like support level)
  return true
}
