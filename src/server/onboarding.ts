import { createServerFn } from '@tanstack/react-start'
import { ObjectId } from 'mongodb'
import OpenAI from 'openai'
import type { OnboardingSession } from '@/lib/collections'
import { getOnboardingSessionsCollection } from '@/lib/collections'
import { autoLoginAfterOnboarding } from './auth'
import { createClinicFromOnboarding, type OnboardingData } from './registration'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

interface OnboardingProgress {
  currentStep:
    | 'name'
    | 'email'
    | 'password'
    | 'phone'
    | 'address'
    | 'services'
    | 'working_hours'
    | 'doctors'
    | 'complete'
  completedSteps: string[]
  data: {
    clinicName?: string
    email?: string
    password?: string
    phone?: string
    address?: string
    services?: string[]
    workingHours?: { day: number; open: string; close: string }[]
    doctors?: { name: string; specialization: string }[]
  }
}

const systemPrompt = `Eres Denty, un asistente inteligente especializado en configurar clínicas dentales. Tu trabajo es guiar a los dueños de clínicas a través de un proceso de onboarding conversacional.

REGLAS IMPORTANTES:
1. Solo haces UNA pregunta por vez
2. Eres amigable, profesional y eficiente
3. NUNCA pidas confirmación de los datos — acéptalos y pasa directamente a la siguiente pregunta
4. Usas emojis ocasionalmente (🦷, 😊, ✅, 📍)
5. Respuestas MUY concisas: confirma brevemente lo recibido y haz la siguiente pregunta
6. NO repitas la información que el usuario te dio

FLUJO DE ONBOARDING (los pasos de email y password se manejan por separado, NO los preguntes):
1. name: Preguntar nombre de la clínica
2. phone: Número de teléfono principal
3. address: Dirección completa de la clínica
4. services: Servicios que ofrece la clínica (pueden dar varios a la vez)
5. working_hours: Horario de atención
6. doctors: Información del equipo médico (nombre y especialización)

FORMATO DE RESPUESTA:
- Línea 1: Breve confirmación (ej: "✅ Perfecto!")
- Línea 2: Siguiente pregunta
- Nada más. Sin confirmaciones, sin repetir datos.`

export async function startOnboarding(): Promise<{
  success: boolean
  sessionId?: string
  progress?: OnboardingProgress
  error?: string
}> {
  try {
    const sessionId = new ObjectId().toString()
    const session: OnboardingSession = {
      _id: new ObjectId(),
      sessionId,
      currentStep: 'name',
      data: {},
      messages: [],
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const collection = await getOnboardingSessionsCollection()
    await collection.insertOne(session)

    const progress: OnboardingProgress = {
      currentStep: 'name',
      completedSteps: [],
      data: {},
    }

    return {
      success: true,
      sessionId,
      progress,
    }
  } catch (error) {
    console.error('Error starting onboarding:', error)
    return {
      success: false,
      error: 'Failed to start onboarding session',
    }
  }
}

export async function processOnboardingMessage(
  sessionId: string,
  message: string,
  sensitive?: boolean,
): Promise<{
  success: boolean
  message?: string
  progress?: OnboardingProgress
  error?: string
}> {
  try {
    const collection = await getOnboardingSessionsCollection()
    const session = await collection.findOne({ sessionId })

    if (!session) {
      return {
        success: false,
        error: 'Session not found',
      }
    }

    // Add user message to session
    const userMessage = {
      role: 'user' as const,
      content: sensitive ? (session.currentStep === 'password' ? '••••••••' : message) : message,
      timestamp: new Date(),
    }

    session.messages.push(userMessage)

    // Process the message based on current step
    const result = await processStepMessage(session, message, sensitive)

    if (!result.success) {
      return result
    }

    // Add assistant message
    const assistantMessage = {
      role: 'assistant' as const,
      content: result.message!,
      timestamp: new Date(),
    }

    session.messages.push(assistantMessage)
    session.updatedAt = new Date()

    // Update session in database
    await collection.updateOne(
      { sessionId },
      {
        $set: {
          currentStep: session.currentStep,
          data: session.data,
          messages: session.messages,
          updatedAt: session.updatedAt,
        },
      },
    )

    // Calculate progress
    const progress = calculateProgress(session)

    // If onboarding just completed, add a proper completion message
    let finalMessage = result.message
    if (progress.currentStep === 'complete') {
      finalMessage =
        '🎉 ¡Tu clínica está lista! Hemos configurado todo. Te estamos redirigiendo al panel de administración...'
    }

    return {
      success: true,
      message: finalMessage,
      progress,
    }
  } catch (error) {
    console.error('Error processing onboarding message:', error)
    return {
      success: false,
      error: 'Failed to process message',
    }
  }
}

async function processStepMessage(
  session: OnboardingSession,
  message: string,
  sensitive?: boolean,
): Promise<{ success: boolean; message?: string; error?: string }> {
  try {
    // Handle sensitive steps (email/password) WITHOUT sending to LLM
    if (sensitive || session.currentStep === 'email' || session.currentStep === 'password') {
      return processSensitiveStep(session, message)
    }

    // Handle name step directly to avoid LLM asking for confirmation
    if (session.currentStep === 'name') {
      session.data = { ...session.data, clinicName: message.trim() }
      session.currentStep = getNextStep(session.currentStep)
      return {
        success: true,
        message: `✅ ¡${message.trim()}! Gran nombre 🦷 Ahora necesito tu email de administrador.`,
      }
    }

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: systemPrompt },
        {
          role: 'system',
          content: `Paso actual: ${session.currentStep}. Información recopilada hasta ahora: ${JSON.stringify(session.data)}`,
        },
        ...session.messages.map((m) => ({ role: m.role, content: m.content })),
        { role: 'user', content: message },
      ],
      temperature: 0.7,
      max_tokens: 500,
    })

    const aiResponse = response.choices[0]?.message?.content
    if (!aiResponse) {
      return { success: false, error: 'No response from AI' }
    }

    // Extract structured data and update session
    const extractedData = await extractDataFromResponse(session.currentStep, message)
    if (extractedData) {
      session.data = { ...session.data, ...extractedData }
      session.currentStep = getNextStep(session.currentStep)
    }

    return { success: true, message: aiResponse }
  } catch (error) {
    console.error('Error in processStepMessage:', error)
    return { success: false, error: 'Failed to process step' }
  }
}

function processSensitiveStep(
  session: OnboardingSession,
  value: string,
): { success: boolean; message?: string; error?: string } {
  if (session.currentStep === 'email') {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(value.trim())) {
      return { success: true, message: 'Hmm, ese email no parece válido. ¿Puedes revisarlo? 📧' }
    }
    session.data = { ...session.data, email: value.trim() }
    session.currentStep = getNextStep(session.currentStep)
    return {
      success: true,
      message:
        '✅ ¡Email registrado! Ahora crea una contraseña segura para tu panel de administración.',
    }
  }

  if (session.currentStep === 'password') {
    if (value.length < 8) {
      return {
        success: true,
        message: 'La contraseña debe tener al menos 8 caracteres. Inténtalo de nuevo 🔐',
      }
    }
    if (!/[A-Z]/.test(value)) {
      return { success: true, message: 'Necesita al menos una letra mayúscula. ¡Casi! 💪' }
    }
    if (!/[a-z]/.test(value)) {
      return { success: true, message: 'Necesita al menos una letra minúscula.' }
    }
    if (!/[0-9]/.test(value)) {
      return { success: true, message: 'Añade al menos un número para mayor seguridad 🔢' }
    }
    session.data = { ...session.data, password: value }
    session.currentStep = getNextStep(session.currentStep)
    return {
      success: true,
      message:
        '🔒 ¡Contraseña guardada de forma segura! ¿Cuál es el teléfono principal de la clínica?',
    }
  }

  return { success: false, error: 'Unknown sensitive step' }
}

async function extractDataFromResponse(
  currentStep: string,
  message: string,
): Promise<Record<string, any> | null> {
  try {
    const extractionPrompt = `Extrae información estructurada del mensaje del usuario para el paso "${currentStep}".
    
    Mensaje del usuario: "${message}"
    
    Responde SOLO con un objeto JSON válido con los datos extraídos, o null si no hay datos válidos.
    
    Para cada paso:
    - name: { "clinicName": "string" }
    - email: { "email": "string" } (debe ser email válido)
    - password: { "password": "string" } (debe ser segura: 8+ chars, mayúscula, minúscula, número)
    - phone: { "phone": "string" }
    - address: { "address": "string" }
    - services: { "services": ["array", "de", "strings"] }
    - working_hours: { "workingHours": [{"day": 1, "open": "09:00", "close": "18:00"}] }
    - doctors: { "doctors": [{"name": "string", "specialization": "string"}] }`

    const response = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [{ role: 'system', content: extractionPrompt }],
      temperature: 0,
      max_tokens: 300,
    })

    const result = response.choices[0]?.message?.content
    if (!result || result.trim() === 'null') return null

    return JSON.parse(result)
  } catch (error) {
    console.error('Error extracting data:', error)
    return null
  }
}

function getNextStep(currentStep: string): OnboardingSession['currentStep'] {
  const steps: OnboardingSession['currentStep'][] = [
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

  const currentIndex = steps.indexOf(currentStep as any)
  const nextIndex = currentIndex + 1

  return nextIndex < steps.length ? steps[nextIndex] : 'complete'
}

function calculateProgress(session: OnboardingSession): OnboardingProgress {
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

export async function getOnboardingProgress(sessionId: string): Promise<OnboardingProgress | null> {
  try {
    const collection = await getOnboardingSessionsCollection()
    const session = await collection.findOne({ sessionId })

    if (!session) return null

    return calculateProgress(session)
  } catch (error) {
    console.error('Error getting onboarding progress:', error)
    return null
  }
}

// Server Functions for TanStack Start

export const startOnboardingFn = createServerFn({ method: 'POST' }).handler(
  async (): Promise<{
    success: boolean
    sessionId?: string
    progress?: OnboardingProgress
    error?: string
  }> => {
    return await startOnboarding()
  },
)

export const processOnboardingMessageFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { sessionId: string; message: string; sensitive?: boolean }) => input)
  .handler(
    async ({
      data,
    }): Promise<{
      success: boolean
      message?: string
      progress?: OnboardingProgress
      error?: string
    }> => {
      const result = await processOnboardingMessage(data.sessionId, data.message, data.sensitive)

      // Check if onboarding is complete and create clinic
      if (result.success && result.progress?.currentStep === 'complete') {
        const collection = await getOnboardingSessionsCollection()
        const session = await collection.findOne({ sessionId: data.sessionId })

        if (session?.data) {
          const onboardingData: OnboardingData = {
            clinicName: session.data.clinicName || '',
            email: session.data.email || '',
            password: session.data.password || '',
            phone: session.data.phone || '',
            address: session.data.address || '',
            services: session.data.services || [],
            workingHours: session.data.workingHours || [],
            doctors: session.data.doctors || [],
          }

          const clinicResult = await createClinicFromOnboarding(onboardingData)
          if (clinicResult.success) {
            // Auto-login the new admin
            await autoLoginAfterOnboarding(onboardingData.email)
            // Clean up onboarding session
            await collection.deleteOne({ sessionId: data.sessionId })
          }
        }
      }

      return result
    },
  )

export const getOnboardingProgressFn = createServerFn({ method: 'GET' })
  .inputValidator((input: { sessionId: string }) => input)
  .handler(async ({ data }): Promise<OnboardingProgress | null> => {
    return await getOnboardingProgress(data.sessionId)
  })
