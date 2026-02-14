import { beforeEach, describe, expect, it } from 'vitest'
import { mockClinics, mockDoctors } from '../data/mock'
import {
  addMessageToSession,
  buildSystemPrompt,
  clearSessions,
  createOrGetSession,
  getSession,
  parseNavigationAction,
} from './chat'

describe('buildSystemPrompt', () => {
  const clinic = mockClinics[0]
  const doctors = mockDoctors.filter((d) => d.clinicSlug === clinic.slug)

  it('includes clinic name, address, and phone in Spanish', () => {
    const prompt = buildSystemPrompt(clinic, doctors, 'es')
    expect(prompt).toContain(clinic.name)
    expect(prompt).toContain(clinic.address)
    expect(prompt).toContain(clinic.phone)
  })

  it('includes clinic name, address, and phone in English', () => {
    const prompt = buildSystemPrompt(clinic, doctors, 'en')
    expect(prompt).toContain(clinic.name)
    expect(prompt).toContain(clinic.address)
    expect(prompt).toContain('Working Hours')
  })

  it('includes working hours', () => {
    const prompt = buildSystemPrompt(clinic, doctors, 'es')
    expect(prompt).toContain('09:00 - 20:00')
    expect(prompt).toContain('Lunes')
  })

  it('includes services with prices', () => {
    const prompt = buildSystemPrompt(clinic, doctors, 'es')
    expect(prompt).toContain('Limpieza dental')
    expect(prompt).toContain('60€')
  })

  it('includes doctors with specializations', () => {
    const prompt = buildSystemPrompt(clinic, doctors, 'es')
    expect(prompt).toContain('Dra. María García')
    expect(prompt).toContain('Ortodoncia')
  })

  it('uses English service names when lang is en', () => {
    const prompt = buildSystemPrompt(clinic, doctors, 'en')
    expect(prompt).toContain('Dental Cleaning')
    expect(prompt).toContain('Orthodontics')
  })

  it('includes booking instruction', () => {
    const prompt = buildSystemPrompt(clinic, doctors, 'es')
    expect(prompt).toContain('navigate_to_booking')
  })
})

describe('parseNavigationAction', () => {
  it('returns undefined when no tool calls', () => {
    expect(parseNavigationAction({})).toBeUndefined()
  })

  it('returns undefined for empty tool calls', () => {
    expect(parseNavigationAction({ tool_calls: [] })).toBeUndefined()
  })

  it('parses navigate_to_booking tool call', () => {
    const result = parseNavigationAction({
      tool_calls: [
        {
          type: 'function',
          function: {
            name: 'navigate_to_booking',
            arguments: JSON.stringify({ clinic_slug: 'clinica-dental-sonrisa' }),
          },
        },
      ],
    })
    expect(result).toEqual({
      type: 'navigate_to_booking',
      clinicSlug: 'clinica-dental-sonrisa',
    })
  })

  it('returns undefined for invalid JSON arguments', () => {
    expect(
      parseNavigationAction({
        tool_calls: [
          {
            type: 'function',
            function: {
              name: 'navigate_to_booking',
              arguments: 'invalid json',
            },
          },
        ],
      }),
    ).toBeUndefined()
  })

  it('returns undefined for unknown function name', () => {
    expect(
      parseNavigationAction({
        tool_calls: [
          {
            type: 'function',
            function: {
              name: 'unknown_function',
              arguments: '{}',
            },
          },
        ],
      }),
    ).toBeUndefined()
  })
})

describe('session management', () => {
  beforeEach(() => {
    clearSessions()
  })

  it('creates a new session', () => {
    const session = createOrGetSession('test-1', 'clinica-dental-sonrisa')
    expect(session.sessionId).toBe('test-1')
    expect(session.clinicSlug).toBe('clinica-dental-sonrisa')
    expect(session.messages).toEqual([])
  })

  it('returns existing session on subsequent calls', () => {
    createOrGetSession('test-1', 'clinica-dental-sonrisa')
    const session2 = createOrGetSession('test-1')
    expect(session2.clinicSlug).toBe('clinica-dental-sonrisa')
  })

  it('updates clinicSlug if changed', () => {
    createOrGetSession('test-1', 'clinic-a')
    const session = createOrGetSession('test-1', 'clinic-b')
    expect(session.clinicSlug).toBe('clinic-b')
  })

  it('adds messages to session', () => {
    createOrGetSession('test-1')
    addMessageToSession('test-1', 'user', 'Hello')
    addMessageToSession('test-1', 'assistant', 'Hi there!')

    const session = getSession('test-1')
    expect(session?.messages).toHaveLength(2)
    expect(session?.messages[0].role).toBe('user')
    expect(session?.messages[0].content).toBe('Hello')
    expect(session?.messages[1].role).toBe('assistant')
  })

  it('getSession returns undefined for non-existent session', () => {
    expect(getSession('nonexistent')).toBeUndefined()
  })

  it('clearSessions removes all sessions', () => {
    createOrGetSession('test-1')
    createOrGetSession('test-2')
    clearSessions()
    expect(getSession('test-1')).toBeUndefined()
    expect(getSession('test-2')).toBeUndefined()
  })
})
