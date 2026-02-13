import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import type { NotificationData } from './notifications'
import {
  sendBookingNotifications,
  sendClinicEmailNotification,
  sendPatientEmailConfirmation,
  sendWhatsAppConfirmation,
} from './notifications'

// Mock Resend
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: {
      send: vi.fn().mockResolvedValue({ data: { id: 'email-123' }, error: null }),
    },
  })),
}))

const mockNotificationData: NotificationData = {
  patientName: 'Juan García',
  patientPhone: '+34612345678',
  patientEmail: 'juan@example.com',
  notes: 'Primera visita',
  service: 'Limpieza dental',
  date: '2026-03-15',
  time: '10:00',
  clinicName: 'Clínica Dental Sonrisa',
  clinicEmail: 'info@clinicasonrisa.es',
  clinicAddress: 'Calle Gran Vía 45, Madrid',
  clinicPhone: '+34 911 234 567',
  doctorName: 'Dra. María López',
}

describe('sendWhatsAppConfirmation', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubEnv('WHATSAPP_TOKEN', 'test-token')
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', 'test-phone-id')
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.unstubAllEnvs()
  })

  it('returns false when env vars are missing', async () => {
    vi.stubEnv('WHATSAPP_TOKEN', '')
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', '')
    const result = await sendWhatsAppConfirmation(mockNotificationData)
    expect(result).toBe(false)
  })

  it('sends WhatsApp message and returns true on success', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({ messages: [{ id: 'wamid.123' }] }),
    })

    const result = await sendWhatsAppConfirmation(mockNotificationData)
    expect(result).toBe(true)
    expect(globalThis.fetch).toHaveBeenCalledWith(
      'https://graph.facebook.com/v21.0/test-phone-id/messages',
      expect.objectContaining({
        method: 'POST',
        headers: expect.objectContaining({
          Authorization: 'Bearer test-token',
        }),
      }),
    )
  })

  it('returns false on API error', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: false,
      status: 400,
      text: () => Promise.resolve('Bad request'),
    })

    const result = await sendWhatsAppConfirmation(mockNotificationData)
    expect(result).toBe(false)
  })

  it('returns false on network error', async () => {
    globalThis.fetch = vi.fn().mockRejectedValue(new Error('Network error'))

    const result = await sendWhatsAppConfirmation(mockNotificationData)
    expect(result).toBe(false)
  })

  it('strips non-numeric chars from phone number', async () => {
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })

    await sendWhatsAppConfirmation(mockNotificationData)

    const callBody = JSON.parse(
      (globalThis.fetch as ReturnType<typeof vi.fn>).mock.calls[0][1].body,
    )
    expect(callBody.to).toBe('34612345678')
  })
})

describe('sendClinicEmailNotification', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns false when RESEND_API_KEY is missing', async () => {
    vi.stubEnv('RESEND_API_KEY', '')
    const result = await sendClinicEmailNotification(mockNotificationData)
    expect(result).toBe(false)
  })

  it('returns true on successful send', async () => {
    const result = await sendClinicEmailNotification(mockNotificationData)
    expect(result).toBe(true)
  })
})

describe('sendPatientEmailConfirmation', () => {
  beforeEach(() => {
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
  })

  it('returns false when no patient email provided', async () => {
    const data = { ...mockNotificationData, patientEmail: undefined }
    const result = await sendPatientEmailConfirmation(data)
    expect(result).toBe(false)
  })

  it('returns true on successful send', async () => {
    const result = await sendPatientEmailConfirmation(mockNotificationData)
    expect(result).toBe(true)
  })
})

describe('sendBookingNotifications', () => {
  const originalFetch = globalThis.fetch

  beforeEach(() => {
    vi.stubEnv('WHATSAPP_TOKEN', 'test-token')
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', 'test-phone-id')
    vi.stubEnv('RESEND_API_KEY', 'test-resend-key')
    globalThis.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: () => Promise.resolve({}),
    })
  })

  afterEach(() => {
    globalThis.fetch = originalFetch
    vi.unstubAllEnvs()
  })

  it('sends all notifications and returns combined result', async () => {
    const result = await sendBookingNotifications(mockNotificationData)
    expect(result.whatsappSent).toBe(true)
    expect(result.emailSent).toBe(true)
  })

  it('appointment is not affected by notification failures', async () => {
    // Simulate all failures
    vi.stubEnv('WHATSAPP_TOKEN', '')
    vi.stubEnv('RESEND_API_KEY', '')

    const result = await sendBookingNotifications(mockNotificationData)
    expect(result.whatsappSent).toBe(false)
    expect(result.emailSent).toBe(false)
    // The function should not throw — that's the key point
  })
})
