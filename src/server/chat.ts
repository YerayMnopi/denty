import { createServerFn } from '@tanstack/react-start'
import OpenAI from 'openai'
import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from 'openai/resources/chat/completions'
import type { MockClinic, MockDoctor } from '../data/mock'
import { mockClinics, mockDoctors } from '../data/mock'

// ── Types ──────────────────────────────────────────────────────────────────

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

export interface ChatSession {
  sessionId: string
  clinicSlug?: string
  messages: ChatMessage[]
  createdAt: Date
  updatedAt: Date
}

export interface ChatResponse {
  message: string
  navigationAction?: {
    type: 'navigate_to_booking'
    clinicSlug: string
  }
}

// ── In-memory session store (will be replaced by MongoDB) ──────────────────

const sessionStore = new Map<string, ChatSession>()

export function getSession(sessionId: string): ChatSession | undefined {
  return sessionStore.get(sessionId)
}

export function createOrGetSession(sessionId: string, clinicSlug?: string): ChatSession {
  const existing = sessionStore.get(sessionId)
  if (existing) {
    if (clinicSlug && existing.clinicSlug !== clinicSlug) {
      existing.clinicSlug = clinicSlug
      existing.updatedAt = new Date()
    }
    return existing
  }
  const session: ChatSession = {
    sessionId,
    clinicSlug,
    messages: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  }
  sessionStore.set(sessionId, session)
  return session
}

export function addMessageToSession(
  sessionId: string,
  role: 'user' | 'assistant',
  content: string,
): void {
  const session = sessionStore.get(sessionId)
  if (session) {
    session.messages.push({ role, content, timestamp: new Date() })
    session.updatedAt = new Date()
  }
}

export function clearSessions(): void {
  sessionStore.clear()
}

// ── System prompt builder ──────────────────────────────────────────────────

const DAY_NAMES: Record<string, string[]> = {
  es: ['Domingo', 'Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado'],
  en: ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
}

export function buildSystemPrompt(clinic: MockClinic, doctors: MockDoctor[], lang: string): string {
  const l = lang.startsWith('en') ? 'en' : 'es'
  const dayNames = DAY_NAMES[l] || DAY_NAMES.es

  const hoursStr = clinic.workingHours
    .map((h) => `  ${dayNames[h.day]}: ${h.open} - ${h.close}`)
    .join('\n')

  const servicesStr = clinic.serviceDetails
    .map((s) => `  - ${s.name[l] || s.name.es}: ${s.duration} min, ${s.price}`)
    .join('\n')

  const doctorsStr = doctors
    .map((d) => `  - ${d.name} — ${d.specialization[l] || d.specialization.es}`)
    .join('\n')

  const bookingInstruction =
    l === 'es'
      ? 'Cuando el usuario quiera reservar una cita, usa la función navigate_to_booking para redirigirlo a la página de reservas.'
      : 'When the user wants to book an appointment, use the navigate_to_booking function to redirect them to the booking page.'

  const roleInstruction =
    l === 'es'
      ? `Eres el asistente virtual de ${clinic.name}. Ayudas a los pacientes respondiendo preguntas sobre la clínica, servicios, doctores y horarios. Responde siempre en el idioma del usuario.`
      : `You are the virtual assistant for ${clinic.name}. You help patients by answering questions about the clinic, services, doctors, and schedules. Always respond in the user's language.`

  return `${roleInstruction}

${l === 'es' ? 'Información de la clínica' : 'Clinic information'}:
- ${l === 'es' ? 'Nombre' : 'Name'}: ${clinic.name}
- ${l === 'es' ? 'Dirección' : 'Address'}: ${clinic.address}
- ${l === 'es' ? 'Teléfono' : 'Phone'}: ${clinic.phone}

${l === 'es' ? 'Horario' : 'Working Hours'}:
${hoursStr}

${l === 'es' ? 'Servicios' : 'Services'}:
${servicesStr}

${l === 'es' ? 'Doctores' : 'Doctors'}:
${doctorsStr}

${bookingInstruction}`
}

// ── Function calling tools definition ──────────────────────────────────────

export const chatTools: ChatCompletionTool[] = [
  {
    type: 'function',
    function: {
      name: 'navigate_to_booking',
      description: 'Navigate the user to the booking page when they want to make an appointment.',
      parameters: {
        type: 'object',
        properties: {
          clinic_slug: {
            type: 'string',
            description: 'The slug of the clinic to book at.',
          },
        },
        required: ['clinic_slug'],
      },
    },
  },
]

// ── Parse function call from response ──────────────────────────────────────

export function parseNavigationAction(message: {
  tool_calls?: Array<{ type: string; function?: { name: string; arguments: string } }> | null
}): ChatResponse['navigationAction'] | undefined {
  if (!message.tool_calls || message.tool_calls.length === 0) {
    return undefined
  }

  const toolCall = message.tool_calls[0]
  if (toolCall.type === 'function' && toolCall.function?.name === 'navigate_to_booking') {
    try {
      const args = JSON.parse(toolCall.function.arguments)
      return {
        type: 'navigate_to_booking',
        clinicSlug: args.clinic_slug,
      }
    } catch {
      return undefined
    }
  }

  return undefined
}

// ── Server function ────────────────────────────────────────────────────────

export const sendChatMessage = createServerFn({ method: 'POST' })
  .inputValidator(
    (data: { sessionId: string; message: string; clinicSlug?: string; lang?: string }) => data,
  )
  .handler(async ({ data }): Promise<ChatResponse> => {
    const { sessionId, message, clinicSlug, lang = 'es' } = data

    const session = createOrGetSession(sessionId, clinicSlug)
    addMessageToSession(sessionId, 'user', message)

    // Find clinic context
    const clinic = clinicSlug ? mockClinics.find((c) => c.slug === clinicSlug) : mockClinics[0]

    const doctors = clinic ? mockDoctors.filter((d) => d.clinicSlug === clinic.slug) : []

    const systemPrompt = clinic
      ? buildSystemPrompt(clinic, doctors, lang)
      : lang.startsWith('en')
        ? "You are a helpful dental assistant for Denty. Help users find clinics and book appointments. Respond in the user's language."
        : 'Eres un asistente dental de Denty. Ayuda a los usuarios a encontrar clínicas y reservar citas. Responde en el idioma del usuario.'

    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

    const messages: ChatCompletionMessageParam[] = [
      { role: 'system', content: systemPrompt },
      ...session.messages.map((m) => ({
        role: m.role as 'user' | 'assistant',
        content: m.content,
      })),
    ]

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages,
      tools: clinic ? chatTools : undefined,
    })

    const responseMessage = completion.choices[0].message
    const navigationAction = parseNavigationAction(responseMessage)

    let assistantContent = responseMessage.content || ''

    // If there's a tool call but no content, provide a default message
    if (navigationAction && !assistantContent) {
      assistantContent = lang.startsWith('en')
        ? "I'll take you to the booking page right away!"
        : '¡Te llevo a la página de reservas ahora mismo!'
    }

    addMessageToSession(sessionId, 'assistant', assistantContent)

    return {
      message: assistantContent,
      navigationAction: navigationAction || undefined,
    }
  })
