import { describe, expect, it } from 'vitest'

interface OnboardingStatus {
  currentStep: string
  completedSteps: string[]
  clinicData: Record<string, unknown>
  isComplete: boolean
}

// Parse onboarding message and extract data
function parseOnboardingData(message: string, currentStep: string): Record<string, unknown> {
  const data: Record<string, unknown> = {}

  switch (currentStep) {
    case 'address':
      // Extract address information
      if (message.includes(',')) {
        const parts = message.split(',')
        data.address = {
          street: parts[0]?.trim() || '',
          city: parts[1]?.trim() || '',
          zip: parts[2]?.trim() || '',
        }
      } else {
        data.address = { street: message.trim(), city: '', zip: '' }
      }
      break

    case 'services': {
      // Extract services (comma-separated)
      const serviceNames = message
        .split(',')
        .map((s) => s.trim())
        .filter((s) => s)
      data.services = serviceNames.map((name) => ({
        name: { es: name, en: name },
        duration: 45,
        price: 60,
      }))
      break
    }

    case 'hours':
      // Extract working hours
      data.workingHours = parseWorkingHours(message)
      break

    case 'doctors': {
      // Extract doctor names
      const doctorNames = message
        .split(',')
        .map((d) => d.trim())
        .filter((d) => d)
      data.doctorNames = doctorNames
      break
    }

    case 'logo':
      // For now, just note that logo was discussed
      data.logoDiscussed = true
      break
  }

  return data
}

// Parse working hours from natural language
function parseWorkingHours(message: string): Array<{ day: number; open: string; close: string }> {
  // Default working hours if parsing fails
  const defaultHours = [
    { day: 1, open: '09:00', close: '18:00' },
    { day: 2, open: '09:00', close: '18:00' },
    { day: 3, open: '09:00', close: '18:00' },
    { day: 4, open: '09:00', close: '18:00' },
    { day: 5, open: '09:00', close: '18:00' },
  ]

  // Simple parsing for common patterns
  if (message.toLowerCase().includes('9') && message.toLowerCase().includes('18')) {
    return defaultHours
  }

  if (message.toLowerCase().includes('8') && message.toLowerCase().includes('17')) {
    return [
      { day: 1, open: '08:00', close: '17:00' },
      { day: 2, open: '08:00', close: '17:00' },
      { day: 3, open: '08:00', close: '17:00' },
      { day: 4, open: '08:00', close: '17:00' },
      { day: 5, open: '08:00', close: '17:00' },
    ]
  }

  return defaultHours
}

// Generate response based on current step
function generateOnboardingResponse(
  currentStep: string,
  extractedData: Record<string, unknown>,
): string {
  switch (currentStep) {
    case 'welcome':
      return '¡Perfecto! Vamos a configurar tu clínica paso a paso. Primero, ¿cuál es la dirección completa de tu clínica? Por ejemplo: "Calle Gran Vía 42, Madrid, 28013"'

    case 'address': {
      const address = extractedData.address as { street?: string } | undefined
      return `¡Genial! Tu clínica está en ${address?.street || 'la dirección indicada'}. Ahora, ¿qué servicios principales ofrecéis? Puedes listar los más importantes separados por comas, como: "Limpiezas, Empastes, Ortodoncia, Blanqueamiento"`
    }

    case 'services': {
      const services = (extractedData.services as unknown[]) || []
      return `Perfecto, he añadido ${services.length} servicios a tu clínica. Ahora, ¿cuál es vuestro horario de atención? Por ejemplo: "De 9:00 a 18:00 de lunes a viernes"`
    }

    case 'hours':
      return '¡Excelente! Ya tengo el horario. Ahora, ¿qué doctores trabajan en la clínica? Dame sus nombres separados por comas, como: "Dr. García, Dra. Martínez, Dr. López"'

    case 'doctors': {
      const doctors = (extractedData.doctorNames as string[]) || []
      return `Perfecto, he añadido ${doctors.length} doctores al equipo. Por último, ¿tenéis un logo de la clínica que queráis usar en vuestra web? Si lo tienes, podrás subirlo desde el panel de administración más tarde. Si no, no te preocupes, crearemos algo bonito.`
    }

    case 'logo':
      return '¡Fantástico! 🎉 Ya hemos terminado la configuración inicial de tu clínica. Tu web ya está activa y lista para recibir pacientes. Te voy a redirigir al panel de administración donde podrás gestionar todo. ¡Bienvenido a Denty!'

    default:
      return 'No estoy seguro de cómo ayudarte con eso. ¿Podrías reformular tu respuesta?'
  }
}

// Determine next step based on current state
function getNextStep(currentStep: string, _completedSteps: string[]): string {
  const steps = ['welcome', 'address', 'services', 'hours', 'doctors', 'logo']
  const currentIndex = steps.indexOf(currentStep)

  if (currentIndex === -1 || currentIndex >= steps.length - 1) {
    return 'complete'
  }

  return steps[currentIndex + 1]
}

// Calculate onboarding progress
function calculateOnboardingProgress(completedSteps: string[]): number {
  const totalSteps = 6 // welcome, address, services, hours, doctors, logo
  return Math.round((completedSteps.length / totalSteps) * 100)
}

// Validate onboarding step completion
function isStepComplete(step: string, clinicData: Record<string, unknown>): boolean {
  switch (step) {
    case 'welcome':
      return true // Always complete if we're in onboarding

    case 'address': {
      const address = clinicData.address as { street?: string } | undefined
      return !!address?.street
    }

    case 'services': {
      const services = clinicData.services as unknown[]
      return !!(services && services.length > 3) // More than default services
    }

    case 'hours': {
      const workingHours = clinicData.workingHours as unknown[]
      return !!(workingHours && workingHours.length > 0)
    }

    case 'doctors': {
      const doctorNames = clinicData.temporaryDoctorNames as string[]
      return !!(doctorNames && doctorNames.length > 0)
    }

    case 'logo':
      return !!clinicData.logoDiscussed

    default:
      return false
  }
}

// Determine current step based on clinic data
function determineCurrentStep(clinicData: Record<string, unknown>): OnboardingStatus {
  const allSteps = ['welcome', 'address', 'services', 'hours', 'doctors', 'logo']
  const completedSteps: string[] = []
  let currentStep = 'welcome'

  for (const step of allSteps) {
    if (isStepComplete(step, clinicData)) {
      completedSteps.push(step)
    } else {
      currentStep = step
      break
    }
  }

  const isComplete = completedSteps.length === allSteps.length

  return {
    currentStep: isComplete ? 'complete' : currentStep,
    completedSteps,
    clinicData,
    isComplete,
  }
}

// Message processing logic
function processOnboardingMessage(
  message: string,
  currentStatus: OnboardingStatus | null,
): {
  extractedData: Record<string, unknown>
  reply: string
  nextStep: string
  updatedCompletedSteps: string[]
} {
  const currentStep = currentStatus?.currentStep || 'welcome'
  const completedSteps = [...(currentStatus?.completedSteps || ['welcome'])]

  // Parse the message to extract data
  const extractedData = parseOnboardingData(message, currentStep)

  // Generate response
  const reply = generateOnboardingResponse(currentStep, extractedData)

  // Determine next step
  const nextStep = getNextStep(currentStep, completedSteps)

  // Update completed steps
  if (!completedSteps.includes(currentStep)) {
    completedSteps.push(currentStep)
  }

  return {
    extractedData,
    reply,
    nextStep,
    updatedCompletedSteps: completedSteps,
  }
}

describe('Onboarding Step Tracking Logic', () => {
  describe('step completion detection', () => {
    it('should detect address completion', () => {
      const clinicData = {
        address: {
          street: 'Calle Gran Vía 42',
          city: 'Madrid',
          zip: '28013',
        },
      }

      expect(isStepComplete('address', clinicData)).toBe(true)
      expect(isStepComplete('address', {})).toBe(false)
      expect(isStepComplete('address', { address: { street: '' } })).toBe(false)
    })

    it('should detect services completion', () => {
      const clinicDataWithManyServices = {
        services: [
          { name: { es: 'Limpieza', en: 'Cleaning' }, duration: 45, price: 60 },
          { name: { es: 'Empaste', en: 'Filling' }, duration: 60, price: 80 },
          { name: { es: 'Revisión', en: 'Checkup' }, duration: 30, price: 40 },
          { name: { es: 'Ortodoncia', en: 'Orthodontics' }, duration: 90, price: 150 },
        ],
      }

      const clinicDataWithFewServices = {
        services: [
          { name: { es: 'Limpieza', en: 'Cleaning' }, duration: 45, price: 60 },
          { name: { es: 'Empaste', en: 'Filling' }, duration: 60, price: 80 },
        ],
      }

      expect(isStepComplete('services', clinicDataWithManyServices)).toBe(true)
      expect(isStepComplete('services', clinicDataWithFewServices)).toBe(false)
      expect(isStepComplete('services', { services: undefined })).toBe(false)
    })

    it('should detect working hours completion', () => {
      const clinicData = {
        workingHours: [
          { day: 1, open: '09:00', close: '18:00' },
          { day: 2, open: '09:00', close: '18:00' },
        ],
      }

      expect(isStepComplete('hours', clinicData)).toBe(true)
      expect(isStepComplete('hours', { workingHours: undefined })).toBe(false)
      expect(isStepComplete('hours', { workingHours: [] })).toBe(false)
    })

    it('should detect doctors completion', () => {
      const clinicData = {
        temporaryDoctorNames: ['Dr. García', 'Dra. Martínez'],
      }

      expect(isStepComplete('doctors', clinicData)).toBe(true)
      expect(isStepComplete('doctors', { temporaryDoctorNames: undefined })).toBe(false)
      expect(isStepComplete('doctors', { temporaryDoctorNames: [] })).toBe(false)
    })

    it('should detect logo completion', () => {
      const clinicData = { logoDiscussed: true }

      expect(isStepComplete('logo', clinicData)).toBe(true)
      expect(isStepComplete('logo', {})).toBe(false)
      expect(isStepComplete('logo', { logoDiscussed: false })).toBe(false)
    })
  })

  describe('current step determination', () => {
    it('should determine initial state correctly', () => {
      const status = determineCurrentStep({})

      expect(status.currentStep).toBe('address')
      expect(status.completedSteps).toEqual(['welcome'])
      expect(status.isComplete).toBe(false)
    })

    it('should progress through steps correctly', () => {
      // After address completion
      const afterAddress = determineCurrentStep({
        address: { street: 'Test Street', city: 'Test City', zip: '12345' },
      })

      expect(afterAddress.currentStep).toBe('services')
      expect(afterAddress.completedSteps).toContain('welcome')
      expect(afterAddress.completedSteps).toContain('address')

      // After services completion
      const afterServices = determineCurrentStep({
        address: { street: 'Test Street', city: 'Test City', zip: '12345' },
        services: [
          { name: { es: 'S1', en: 'S1' }, duration: 30, price: 50 },
          { name: { es: 'S2', en: 'S2' }, duration: 30, price: 50 },
          { name: { es: 'S3', en: 'S3' }, duration: 30, price: 50 },
          { name: { es: 'S4', en: 'S4' }, duration: 30, price: 50 },
        ],
      })

      expect(afterServices.currentStep).toBe('hours')
      expect(afterServices.completedSteps).toContain('services')
    })

    it('should detect complete onboarding', () => {
      const completeData = {
        address: { street: 'Street', city: 'City', zip: '12345' },
        services: [
          { name: { es: 'S1', en: 'S1' }, duration: 30, price: 50 },
          { name: { es: 'S2', en: 'S2' }, duration: 30, price: 50 },
          { name: { es: 'S3', en: 'S3' }, duration: 30, price: 50 },
          { name: { es: 'S4', en: 'S4' }, duration: 30, price: 50 },
        ],
        workingHours: [{ day: 1, open: '09:00', close: '18:00' }],
        temporaryDoctorNames: ['Dr. Test'],
        logoDiscussed: true,
      }

      const status = determineCurrentStep(completeData)

      expect(status.currentStep).toBe('complete')
      expect(status.isComplete).toBe(true)
      expect(status.completedSteps).toHaveLength(6)
    })
  })
})

describe('Progress Calculation Logic', () => {
  it('should calculate progress correctly', () => {
    expect(calculateOnboardingProgress(['welcome'])).toBe(17) // 1/6
    expect(calculateOnboardingProgress(['welcome', 'address'])).toBe(33) // 2/6
    expect(calculateOnboardingProgress(['welcome', 'address', 'services'])).toBe(50) // 3/6
    expect(calculateOnboardingProgress(['welcome', 'address', 'services', 'hours'])).toBe(67) // 4/6
    expect(
      calculateOnboardingProgress(['welcome', 'address', 'services', 'hours', 'doctors']),
    ).toBe(83) // 5/6
    expect(
      calculateOnboardingProgress(['welcome', 'address', 'services', 'hours', 'doctors', 'logo']),
    ).toBe(100) // 6/6
  })

  it('should handle edge cases', () => {
    expect(calculateOnboardingProgress([])).toBe(0)
    expect(calculateOnboardingProgress(['invalid-step'])).toBe(17)
  })
})

describe('Message Parsing Logic', () => {
  describe('address parsing', () => {
    it('should parse complete address correctly', () => {
      const message = 'Calle Gran Vía 42, Madrid, 28013'
      const data = parseOnboardingData(message, 'address')

      expect(data.address).toEqual({
        street: 'Calle Gran Vía 42',
        city: 'Madrid',
        zip: '28013',
      })
    })

    it('should handle partial address', () => {
      const message = 'Calle Mayor 123'
      const data = parseOnboardingData(message, 'address')

      expect(data.address).toEqual({
        street: 'Calle Mayor 123',
        city: '',
        zip: '',
      })
    })

    it('should handle address with extra spaces', () => {
      const message = ' Calle Test , Madrid , 12345 '
      const data = parseOnboardingData(message, 'address')

      expect(data.address).toEqual({
        street: 'Calle Test',
        city: 'Madrid',
        zip: '12345',
      })
    })
  })

  describe('services parsing', () => {
    it('should parse comma-separated services', () => {
      const message = 'Limpiezas, Empastes, Ortodoncia, Blanqueamiento'
      const data = parseOnboardingData(message, 'services')

      const services = data.services as Array<{
        name: { es: string; en: string }
        duration: number
        price: number
      }>
      expect(services).toHaveLength(4)
      expect(services[0]).toEqual({
        name: { es: 'Limpiezas', en: 'Limpiezas' },
        duration: 45,
        price: 60,
      })
      expect(services[1].name.es).toBe('Empastes')
      expect(services[2].name.es).toBe('Ortodoncia')
      expect(services[3].name.es).toBe('Blanqueamiento')
    })

    it('should handle services with extra spaces', () => {
      const message = ' Service A , Service B , Service C '
      const data = parseOnboardingData(message, 'services')

      const services = data.services as Array<{ name: { es: string; en: string } }>
      expect(services).toHaveLength(3)
      expect(services[0].name.es).toBe('Service A')
      expect(services[1].name.es).toBe('Service B')
      expect(services[2].name.es).toBe('Service C')
    })

    it('should filter empty services', () => {
      const message = 'Service A, , Service B,'
      const data = parseOnboardingData(message, 'services')

      const services = data.services as Array<{ name: { es: string; en: string } }>
      expect(services).toHaveLength(2)
      expect(services.map((s) => s.name.es)).toEqual(['Service A', 'Service B'])
    })
  })

  describe('working hours parsing', () => {
    it('should parse standard hours (9-18)', () => {
      const message = 'De 9:00 a 18:00 de lunes a viernes'
      const data = parseOnboardingData(message, 'hours')

      const workingHours = data.workingHours as Array<{ day: number; open: string; close: string }>
      expect(workingHours).toHaveLength(5)
      workingHours.forEach((wh) => {
        expect(wh.open).toBe('09:00')
        expect(wh.close).toBe('18:00')
        expect(wh.day).toBeGreaterThanOrEqual(1)
        expect(wh.day).toBeLessThanOrEqual(5)
      })
    })

    it('should parse alternative hours (8-17)', () => {
      const message = 'De 8:00 a 17:00 de lunes a viernes'
      const data = parseOnboardingData(message, 'hours')

      const workingHours = data.workingHours as Array<{ day: number; open: string; close: string }>
      expect(workingHours).toHaveLength(5)
      workingHours.forEach((wh) => {
        expect(wh.open).toBe('08:00')
        expect(wh.close).toBe('17:00')
      })
    })

    it('should default to 9-18 for unrecognized patterns', () => {
      const message = 'Horario normal'
      const data = parseOnboardingData(message, 'hours')

      const workingHours = data.workingHours as Array<{ day: number; open: string; close: string }>
      expect(workingHours).toHaveLength(5)
      workingHours.forEach((wh) => {
        expect(wh.open).toBe('09:00')
        expect(wh.close).toBe('18:00')
      })
    })
  })

  describe('doctors parsing', () => {
    it('should parse comma-separated doctor names', () => {
      const message = 'Dr. García, Dra. Martínez, Dr. López'
      const data = parseOnboardingData(message, 'doctors')

      expect(data.doctorNames).toEqual(['Dr. García', 'Dra. Martínez', 'Dr. López'])
    })

    it('should handle names with extra spaces', () => {
      const message = ' Dr. Test , Dra. Example , Dr. Sample '
      const data = parseOnboardingData(message, 'doctors')

      expect(data.doctorNames).toEqual(['Dr. Test', 'Dra. Example', 'Dr. Sample'])
    })

    it('should filter empty names', () => {
      const message = 'Dr. A, , Dr. B,'
      const data = parseOnboardingData(message, 'doctors')

      expect(data.doctorNames).toEqual(['Dr. A', 'Dr. B'])
    })
  })

  describe('logo parsing', () => {
    it('should mark logo as discussed', () => {
      const message = 'Sí, tenemos logo'
      const data = parseOnboardingData(message, 'logo')

      expect(data.logoDiscussed).toBe(true)
    })
  })
})

describe('Response Generation Logic', () => {
  it('should generate welcome response', () => {
    const response = generateOnboardingResponse('welcome', {})
    expect(response).toContain('dirección completa')
    expect(response).toContain('Gran Vía')
  })

  it('should generate address response with extracted data', () => {
    const extractedData = {
      address: { street: 'Calle Test 123' },
    }
    const response = generateOnboardingResponse('address', extractedData)
    expect(response).toContain('Calle Test 123')
    expect(response).toContain('servicios principales')
  })

  it('should generate services response with count', () => {
    const extractedData = {
      services: [{ name: { es: 'S1' } }, { name: { es: 'S2' } }, { name: { es: 'S3' } }],
    }
    const response = generateOnboardingResponse('services', extractedData)
    expect(response).toContain('3 servicios')
    expect(response).toContain('horario')
  })

  it('should generate doctors response with count', () => {
    const extractedData = {
      doctorNames: ['Dr. A', 'Dr. B'],
    }
    const response = generateOnboardingResponse('doctors', extractedData)
    expect(response).toContain('2 doctores')
    expect(response).toContain('logo')
  })

  it('should generate completion response', () => {
    const response = generateOnboardingResponse('logo', {})
    expect(response).toContain('¡Fantástico!')
    expect(response).toContain('¡Bienvenido a Denty!')
  })

  it('should handle unknown steps gracefully', () => {
    const response = generateOnboardingResponse('unknown', {})
    expect(response).toContain('No estoy seguro')
  })
})

describe('Next Step Logic', () => {
  it('should progress through steps correctly', () => {
    expect(getNextStep('welcome', [])).toBe('address')
    expect(getNextStep('address', [])).toBe('services')
    expect(getNextStep('services', [])).toBe('hours')
    expect(getNextStep('hours', [])).toBe('doctors')
    expect(getNextStep('doctors', [])).toBe('logo')
    expect(getNextStep('logo', [])).toBe('complete')
  })

  it('should handle unknown steps', () => {
    expect(getNextStep('unknown', [])).toBe('complete')
  })

  it('should complete after last step', () => {
    expect(getNextStep('logo', ['welcome', 'address', 'services', 'hours', 'doctors'])).toBe(
      'complete',
    )
  })
})

describe('Message Processing Integration', () => {
  it('should process complete onboarding flow', () => {
    const currentStatus: OnboardingStatus = {
      currentStep: 'address',
      completedSteps: ['welcome'],
      clinicData: {},
      isComplete: false,
    }

    // Address step
    const addressResult = processOnboardingMessage(
      'Calle Gran Vía 42, Madrid, 28013',
      currentStatus,
    )

    expect(addressResult.extractedData.address).toBeDefined()
    expect(addressResult.reply).toContain('Gran Vía 42')
    expect(addressResult.nextStep).toBe('services')
    expect(addressResult.updatedCompletedSteps).toContain('address')

    // Services step
    currentStatus.currentStep = 'services'
    currentStatus.completedSteps = addressResult.updatedCompletedSteps

    const servicesResult = processOnboardingMessage(
      'Limpiezas, Empastes, Ortodoncia, Blanqueamiento',
      currentStatus,
    )

    expect(servicesResult.extractedData.services).toBeDefined()
    expect(servicesResult.reply).toContain('4 servicios')
    expect(servicesResult.nextStep).toBe('hours')
  })

  it('should handle empty messages gracefully', () => {
    const currentStatus: OnboardingStatus = {
      currentStep: 'address',
      completedSteps: ['welcome'],
      clinicData: {},
      isComplete: false,
    }

    const result = processOnboardingMessage('', currentStatus)

    expect(result.reply).toBeDefined()
    expect(result.nextStep).toBe('services')
    expect(result.extractedData).toBeDefined()
  })
})
