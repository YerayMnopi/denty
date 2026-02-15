// Tests for reminder server functions

import { beforeEach, describe, expect, it, vi } from 'vitest'
import { sendAppointmentReminder, sendPostVisitFollowUp, sendRecallCampaign } from './reminders'

// Mock fetch globally
global.fetch = vi.fn()

// Mock environment variables
const mockEnv = {
  WHATSAPP_TOKEN: 'test-token',
  WHATSAPP_PHONE_NUMBER_ID: 'test-phone-id',
}

describe('Reminder Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.stubEnv('WHATSAPP_TOKEN', mockEnv.WHATSAPP_TOKEN)
    vi.stubEnv('WHATSAPP_PHONE_NUMBER_ID', mockEnv.WHATSAPP_PHONE_NUMBER_ID)
  })

  const mockReminderData = {
    patientName: 'Test Patient',
    patientPhone: '+34 666 123 456',
    patientEmail: 'test@example.com',
    service: 'Limpieza dental',
    date: '2024-03-15',
    time: '10:30',
    clinicName: 'Test Clinic',
    clinicAddress: 'Test Address',
    doctorName: 'Dr. Test',
  }

  describe('sendAppointmentReminder', () => {
    it('should send 24h reminder successfully', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await sendAppointmentReminder(mockReminderData, '24h')

      expect(result).toBe(true)
      expect(fetch).toHaveBeenCalledWith(
        `https://graph.facebook.com/v21.0/${mockEnv.WHATSAPP_PHONE_NUMBER_ID}/messages`,
        expect.objectContaining({
          method: 'POST',
          headers: {
            Authorization: `Bearer ${mockEnv.WHATSAPP_TOKEN}`,
            'Content-Type': 'application/json',
          },
          body: expect.stringContaining('"messaging_product":"whatsapp"'),
        }),
      )
    })

    it('should send 1h reminder successfully', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await sendAppointmentReminder(mockReminderData, '1h')

      expect(result).toBe(true)

      // Check that the message contains the correct time reference
      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      expect(body.text.body).toContain('en 1 hora')
    })

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 400,
        text: vi.fn().mockResolvedValue('Bad Request'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await sendAppointmentReminder(mockReminderData, '24h')

      expect(result).toBe(false)
    })

    it('should handle missing environment variables', async () => {
      vi.stubEnv('WHATSAPP_TOKEN', '')

      const result = await sendAppointmentReminder(mockReminderData, '24h')

      expect(result).toBe(false)
      expect(fetch).not.toHaveBeenCalled()
    })

    it('should format phone number correctly', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const dataWithFormattedPhone = {
        ...mockReminderData,
        patientPhone: '+34 666 123 456', // With spaces and +
      }

      await sendAppointmentReminder(dataWithFormattedPhone, '24h')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      expect(body.to).toBe('34666123456') // Should strip non-numeric characters
    })
  })

  describe('sendPostVisitFollowUp', () => {
    it('should send follow-up message successfully', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await sendPostVisitFollowUp(mockReminderData)

      expect(result).toBe(true)

      // Check that the message contains follow-up content
      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      expect(body.text.body).toContain('visita de ayer')
      expect(body.text.body).toContain(mockReminderData.service)
    })

    it('should handle network errors', async () => {
      vi.mocked(fetch).mockRejectedValue(new Error('Network error'))

      const result = await sendPostVisitFollowUp(mockReminderData)

      expect(result).toBe(false)
    })
  })

  describe('sendRecallCampaign', () => {
    const mockRecallData = {
      patientName: 'Test Patient',
      patientPhone: '+34 666 123 456',
      clinicName: 'Test Clinic',
      clinicAddress: 'Test Address',
      clinicPhone: '+34 911 222 333',
    }

    it('should send recall message successfully', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      const result = await sendRecallCampaign(mockRecallData)

      expect(result).toBe(true)

      // Check that the message contains recall content
      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      expect(body.text.body).toContain('Te echamos de menos')
      expect(body.text.body).toContain(mockRecallData.clinicName)
      expect(body.text.body).toContain(mockRecallData.clinicPhone)
    })

    it('should include clinic contact information', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await sendRecallCampaign(mockRecallData)

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      expect(body.text.body).toContain(mockRecallData.clinicAddress)
      expect(body.text.body).toContain(mockRecallData.clinicPhone)
    })
  })

  describe('message formatting', () => {
    it('should format 24h reminder message correctly', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await sendAppointmentReminder(mockReminderData, '24h')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      const message = body.text.body

      expect(message).toContain('mañana') // 24h indicator
      expect(message).toContain(mockReminderData.patientName)
      expect(message).toContain(mockReminderData.clinicName)
      expect(message).toContain(mockReminderData.date)
      expect(message).toContain(mockReminderData.time)
      expect(message).toContain(mockReminderData.service)
      expect(message).toContain(mockReminderData.doctorName)
      expect(message).toContain(mockReminderData.clinicAddress)
    })

    it('should format 1h reminder message correctly', async () => {
      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await sendAppointmentReminder(mockReminderData, '1h')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      const message = body.text.body

      expect(message).toContain('en 1 hora') // 1h indicator
      expect(message).not.toContain('mañana') // Should not contain 24h indicator
    })
  })

  describe('error handling', () => {
    it('should log errors appropriately', async () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      vi.mocked(fetch).mockRejectedValue(new Error('Test error'))

      await sendAppointmentReminder(mockReminderData, '24h')

      expect(consoleSpy).toHaveBeenCalledWith(
        '[WhatsApp Reminder] Failed to send:',
        expect.any(Error),
      )

      consoleSpy.mockRestore()
    })

    it('should handle missing phone number gracefully', async () => {
      const dataWithoutPhone = {
        ...mockReminderData,
        patientPhone: '',
      }

      const mockResponse = {
        ok: true,
        text: vi.fn().mockResolvedValue('{"success": true}'),
      }
      vi.mocked(fetch).mockResolvedValue(mockResponse as any)

      await sendAppointmentReminder(dataWithoutPhone, '24h')

      const callArgs = vi.mocked(fetch).mock.calls[0]
      const body = JSON.parse(callArgs[1].body as string)
      expect(body.to).toBe('') // Empty string after stripping non-numeric
    })
  })
})
