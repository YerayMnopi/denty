import { describe, expect, it } from 'vitest'

// Helper functions for testing onboarding logic
function calculateProgressMock(session: {
  data: {
    clinicName?: string
    email?: string
    password?: string
    phone?: string
    address?: string
    services?: string[]
    workingHours?: any[]
    doctors?: any[]
  }
  currentStep: string
}) {
  const allSteps = [
    'name',
    'email',
    'password',
    'phone',
    'address',
    'services',
    'working_hours',
    'doctors',
  ]
  const completedSteps = allSteps.filter((step) => {
    switch (step) {
      case 'name':
        return !!session.data.clinicName
      case 'email':
        return !!session.data.email
      case 'password':
        return !!session.data.password
      case 'phone':
        return !!session.data.phone
      case 'address':
        return !!session.data.address
      case 'services':
        return !!session.data.services?.length
      case 'working_hours':
        return !!session.data.workingHours?.length
      case 'doctors':
        return !!session.data.doctors?.length
      default:
        return false
    }
  })

  return {
    currentStep: session.currentStep,
    completedSteps,
    data: session.data,
  }
}

function getNextStepMock(currentStep: string): string {
  const steps = [
    'name',
    'email',
    'password',
    'phone',
    'address',
    'services',
    'working_hours',
    'doctors',
    'complete',
  ]

  const currentIndex = steps.indexOf(currentStep)
  if (currentIndex === -1) {
    // If step is not found, return complete
    return 'complete'
  }

  const nextIndex = currentIndex + 1

  return nextIndex < steps.length ? steps[nextIndex] : 'complete'
}

function validateStepDataMock(step: string, data: any): boolean {
  switch (step) {
    case 'name':
      return typeof data === 'string' && data.trim().length > 0
    case 'email':
      return typeof data === 'string' && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data)
    case 'password':
      return typeof data === 'string' && data.length >= 8
    case 'phone':
      return typeof data === 'string' && data.trim().length > 0
    case 'address':
      return typeof data === 'string' && data.trim().length > 0
    case 'services':
      return Array.isArray(data) && data.length > 0
    case 'working_hours':
      return Array.isArray(data) && data.length > 0
    case 'doctors':
      return Array.isArray(data) && data.length > 0
    default:
      return false
  }
}

describe('onboarding progress calculation', () => {
  it('should calculate progress with no completed steps', () => {
    const session = {
      data: {},
      currentStep: 'name',
    }

    const progress = calculateProgressMock(session)

    expect(progress.currentStep).toBe('name')
    expect(progress.completedSteps).toEqual([])
    expect(progress.data).toEqual({})
  })

  it('should calculate progress with clinic name completed', () => {
    const session = {
      data: { clinicName: 'Clínica Dental Sonrisa' },
      currentStep: 'email',
    }

    const progress = calculateProgressMock(session)

    expect(progress.currentStep).toBe('email')
    expect(progress.completedSteps).toEqual(['name'])
    expect(progress.data.clinicName).toBe('Clínica Dental Sonrisa')
  })

  it('should calculate progress with multiple completed steps', () => {
    const session = {
      data: {
        clinicName: 'Clínica Dental Sonrisa',
        email: 'admin@sonrisa.com',
        password: 'SecurePass123',
        phone: '+34 123 456 789',
      },
      currentStep: 'address',
    }

    const progress = calculateProgressMock(session)

    expect(progress.currentStep).toBe('address')
    expect(progress.completedSteps).toEqual(['name', 'email', 'password', 'phone'])
    expect(progress.completedSteps).toHaveLength(4)
  })

  it('should calculate progress with arrays completed', () => {
    const session = {
      data: {
        clinicName: 'Clínica Test',
        email: 'test@test.com',
        password: 'Test123456',
        phone: '123456789',
        address: 'Test Address',
        services: ['Limpieza', 'Empaste', 'Ortodoncia'],
        workingHours: [{ day: 1, open: '09:00', close: '17:00' }],
        doctors: [{ name: 'Dr. Test', specialization: 'General' }],
      },
      currentStep: 'complete',
    }

    const progress = calculateProgressMock(session)

    expect(progress.currentStep).toBe('complete')
    expect(progress.completedSteps).toHaveLength(8)
    expect(progress.completedSteps).toContain('services')
    expect(progress.completedSteps).toContain('working_hours')
    expect(progress.completedSteps).toContain('doctors')
  })

  it('should not mark empty arrays as completed', () => {
    const session = {
      data: {
        clinicName: 'Test Clinic',
        services: [],
        workingHours: undefined,
        doctors: undefined,
      },
      currentStep: 'services',
    }

    const progress = calculateProgressMock(session)

    expect(progress.completedSteps).toEqual(['name'])
    expect(progress.completedSteps).not.toContain('services')
    expect(progress.completedSteps).not.toContain('working_hours')
    expect(progress.completedSteps).not.toContain('doctors')
  })
})

describe('step progression', () => {
  it('should progress through all steps in order', () => {
    expect(getNextStepMock('name')).toBe('email')
    expect(getNextStepMock('email')).toBe('password')
    expect(getNextStepMock('password')).toBe('phone')
    expect(getNextStepMock('phone')).toBe('address')
    expect(getNextStepMock('address')).toBe('services')
    expect(getNextStepMock('services')).toBe('working_hours')
    expect(getNextStepMock('working_hours')).toBe('doctors')
    expect(getNextStepMock('doctors')).toBe('complete')
  })

  it('should stay at complete step', () => {
    expect(getNextStepMock('complete')).toBe('complete')
  })

  it('should handle invalid step', () => {
    expect(getNextStepMock('invalid')).toBe('complete')
  })
})

describe('step data validation', () => {
  it('should validate clinic name', () => {
    expect(validateStepDataMock('name', 'Clínica Dental Test')).toBe(true)
    expect(validateStepDataMock('name', '')).toBe(false)
    expect(validateStepDataMock('name', '   ')).toBe(false)
    expect(validateStepDataMock('name', null)).toBe(false)
  })

  it('should validate email', () => {
    expect(validateStepDataMock('email', 'admin@clinic.com')).toBe(true)
    expect(validateStepDataMock('email', 'test@test.es')).toBe(true)
    expect(validateStepDataMock('email', 'invalid-email')).toBe(false)
    expect(validateStepDataMock('email', 'missing@')).toBe(false)
    expect(validateStepDataMock('email', '@missing.com')).toBe(false)
  })

  it('should validate password', () => {
    expect(validateStepDataMock('password', 'LongPassword123')).toBe(true)
    expect(validateStepDataMock('password', '12345678')).toBe(true)
    expect(validateStepDataMock('password', 'short')).toBe(false)
    expect(validateStepDataMock('password', '')).toBe(false)
  })

  it('should validate phone', () => {
    expect(validateStepDataMock('phone', '+34 123 456 789')).toBe(true)
    expect(validateStepDataMock('phone', '123456789')).toBe(true)
    expect(validateStepDataMock('phone', '')).toBe(false)
    expect(validateStepDataMock('phone', '   ')).toBe(false)
  })

  it('should validate address', () => {
    expect(validateStepDataMock('address', 'Calle Mayor 123, Madrid')).toBe(true)
    expect(validateStepDataMock('address', 'Test Address')).toBe(true)
    expect(validateStepDataMock('address', '')).toBe(false)
    expect(validateStepDataMock('address', '   ')).toBe(false)
  })

  it('should validate services array', () => {
    expect(validateStepDataMock('services', ['Limpieza', 'Empaste'])).toBe(true)
    expect(validateStepDataMock('services', ['Single Service'])).toBe(true)
    expect(validateStepDataMock('services', [])).toBe(false)
    expect(validateStepDataMock('services', null)).toBe(false)
    expect(validateStepDataMock('services', 'not array')).toBe(false)
  })

  it('should validate working hours array', () => {
    expect(validateStepDataMock('working_hours', [{ day: 1, open: '09:00', close: '17:00' }])).toBe(
      true,
    )
    expect(validateStepDataMock('working_hours', [])).toBe(false)
    expect(validateStepDataMock('working_hours', null)).toBe(false)
  })

  it('should validate doctors array', () => {
    expect(validateStepDataMock('doctors', [{ name: 'Dr. Test', specialization: 'General' }])).toBe(
      true,
    )
    expect(validateStepDataMock('doctors', [])).toBe(false)
    expect(validateStepDataMock('doctors', null)).toBe(false)
  })

  it('should return false for unknown steps', () => {
    expect(validateStepDataMock('unknown', 'any data')).toBe(false)
  })
})
