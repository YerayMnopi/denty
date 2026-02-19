import { createServerFn } from '@tanstack/react-start'
import { getCookie } from '@tanstack/react-start/server'
import jwt from 'jsonwebtoken'
import { getClinicsCollection } from '@/lib/collections'
import type { AdminSession } from './auth'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

interface OnboardingStatus {
  currentStep: string
  completedSteps: string[]
  clinicData: { [x: string]: {} }
  isComplete: boolean
}

interface OnboardingMessageData {
  message: string
  currentStatus: OnboardingStatus | null
}

interface OnboardingResponse {
  success: boolean
  reply?: string
  updatedStatus?: OnboardingStatus
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

export const getOnboardingStatusFn = createServerFn({ method: 'GET' }).handler(
  async (): Promise<OnboardingStatus> => {
    const session = await getCurrentSession()
    if (!session) {
      throw new Error('Not authenticated')
    }

    try {
      const clinicsCollection = await getClinicsCollection()
      const clinic = await clinicsCollection.findOne({
        adminEmail: session.email,
      })

      if (!clinic) {
        throw new Error('Clinic not found')
      }

      // If already complete, return complete status
      if (clinic.onboardingComplete) {
        return {
          currentStep: 'complete',
          completedSteps: ['welcome', 'address', 'services', 'hours', 'doctors', 'logo'],
          clinicData: clinic,
          isComplete: true,
        }
      }

      // Determine current step based on clinic data
      const completedSteps: string[] = ['welcome'] // Welcome is always complete if we're here
      let currentStep = 'address'

      if (clinic.address?.street) {
        completedSteps.push('address')
        currentStep = 'services'
      }

      if (clinic.services && clinic.services.length > 3) {
        // More than default services
        completedSteps.push('services')
        currentStep = 'hours'
      }

      if (clinic.workingHours && clinic.workingHours.length > 0) {
        completedSteps.push('hours')
        currentStep = 'doctors'
      }

      // Check if doctors exist (we'll need to implement this)
      // For now, assume doctors step is not complete
      const doctorsComplete = false // TODO: Check doctors collection
      if (doctorsComplete) {
        completedSteps.push('doctors')
        currentStep = 'logo'
      }

      return {
        currentStep,
        completedSteps,
        clinicData: clinic,
        isComplete: false,
      }
    } catch (error) {
      console.error('Error getting onboarding status:', error)
      throw new Error('Failed to get onboarding status')
    }
  },
)

export const sendOnboardingMessageFn = createServerFn({ method: 'POST' })
  .inputValidator((input: OnboardingMessageData) => input)
  .handler(async ({ data }): Promise<OnboardingResponse> => {
    const session = await getCurrentSession()
    if (!session) {
      return { success: false }
    }

    try {
      const currentStep = data.currentStatus?.currentStep || 'welcome'

      // Parse the message to extract data
      const extractedData = parseOnboardingData(data.message, currentStep)

      // Update clinic with extracted data
      if (Object.keys(extractedData).length > 0) {
        await updateClinicFromOnboarding(session.email, extractedData)
      }

      // Generate response
      const reply = generateOnboardingResponse(currentStep, extractedData)

      // Determine next step
      const completedSteps = data.currentStatus?.completedSteps || ['welcome']
      const nextStep = getNextStep(currentStep, completedSteps)

      // Update completed steps
      if (!completedSteps.includes(currentStep)) {
        completedSteps.push(currentStep)
      }

      const updatedStatus: OnboardingStatus = {
        currentStep: nextStep,
        completedSteps,
        clinicData: data.currentStatus?.clinicData || {},
        isComplete: nextStep === 'complete' || completedSteps.length >= 5,
      }

      return {
        success: true,
        reply,
        updatedStatus,
      }
    } catch (error) {
      console.error('Error in onboarding message:', error)
      return { success: false }
    }
  })

export const updateClinicFromOnboardingFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { data: Record<string, unknown> }) => input)
  .handler(async ({ data: updateData }): Promise<{ success: boolean }> => {
    const session = await getCurrentSession()
    if (!session) {
      return { success: false }
    }

    return await updateClinicFromOnboarding(session.email, updateData.data)
  })

// Helper function to update clinic data
async function updateClinicFromOnboarding(
  adminEmail: string,
  data: Record<string, unknown>,
): Promise<{ success: boolean }> {
  try {
    const clinicsCollection = await getClinicsCollection()
    const updateFields: Record<string, unknown> = {
      updatedAt: new Date(),
    }

    // Map extracted data to clinic fields
    if (data.address) {
      updateFields.address = data.address
    }

    if (data.services) {
      updateFields.services = data.services
    }

    if (data.workingHours) {
      updateFields.workingHours = data.workingHours
    }

    if (data.doctorNames) {
      // For now, just store in a temporary field
      // TODO: Create actual doctor records
      updateFields.temporaryDoctorNames = data.doctorNames
    }

    if (data.logoDiscussed) {
      updateFields.logoDiscussed = true
    }

    await clinicsCollection.updateOne({ adminEmail }, { $set: updateFields })

    return { success: true }
  } catch (error) {
    console.error('Error updating clinic from onboarding:', error)
    return { success: false }
  }
}

export const completeOnboardingFn = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{ success: boolean }> => {
    const session = await getCurrentSession()
    if (!session) {
      return { success: false }
    }

    try {
      const clinicsCollection = await getClinicsCollection()
      await clinicsCollection.updateOne(
        { adminEmail: session.email },
        {
          $set: {
            onboardingComplete: true,
            updatedAt: new Date(),
          },
        },
      )

      return { success: true }
    } catch (error) {
      console.error('Error completing onboarding:', error)
      return { success: false }
    }
  },
)
