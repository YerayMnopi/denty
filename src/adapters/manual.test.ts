import { describe, expect, it, vi } from 'vitest'
import { ManualAdapter } from './manual'

// Mock the mock data module so we control doctor schedules
vi.mock('@/data/mock', () => ({
  mockDoctors: [
    {
      slug: 'dr-test',
      name: 'Dr. Test',
      clinicSlug: 'test-clinic',
      clinicName: 'Test Clinic',
      specialization: { es: 'General', en: 'General' },
      schedule: [
        { day: 1, startTime: '09:00', endTime: '13:00' }, // Monday morning
        { day: 1, startTime: '15:00', endTime: '17:00' }, // Monday afternoon
      ],
      services: ['Limpieza dental'],
    },
    {
      slug: 'dr-empty',
      name: 'Dr. Empty',
      clinicSlug: 'test-clinic',
      clinicName: 'Test Clinic',
      specialization: { es: 'General', en: 'General' },
      schedule: [], // No schedule at all
      services: ['Limpieza dental'],
    },
  ],
}))

describe('ManualAdapter', () => {
  // Use a fresh adapter per test to avoid shared in-memory appointments
  // Note: the in-memory store is module-level, so we create a new adapter but
  // appointments persist across tests within the same module. We work around
  // this by using unique dates per test.

  describe('getAvailableSlots', () => {
    it('generates correct 30-min slots for a morning schedule', async () => {
      const adapter = new ManualAdapter()
      // 2026-02-16 is a Monday (day 1)
      const slots = await adapter.getAvailableSlots('dr-test', '2026-02-16', 30)

      expect(slots.length).toBeGreaterThan(0)
      expect(slots[0]).toEqual({ start: '09:00', end: '09:30' })
      expect(slots[slots.length - 1].end).toBe('17:00')

      // Morning: 09:00-13:00 = 8 slots of 30 min
      // Afternoon: 15:00-17:00 = 4 slots of 30 min
      expect(slots).toHaveLength(12)
    })

    it('generates correct 60-min slots', async () => {
      const adapter = new ManualAdapter()
      const slots = await adapter.getAvailableSlots('dr-test', '2026-02-16', 60)

      // Morning: 09:00-13:00 = 4 slots of 60 min
      // Afternoon: 15:00-17:00 = 2 slots of 60 min
      expect(slots).toHaveLength(6)
      expect(slots[0]).toEqual({ start: '09:00', end: '10:00' })
    })

    it('returns empty array for unknown doctor', async () => {
      const adapter = new ManualAdapter()
      const slots = await adapter.getAvailableSlots('dr-nonexistent', '2026-02-16', 30)
      expect(slots).toEqual([])
    })

    it('returns empty array for day with no schedule', async () => {
      const adapter = new ManualAdapter()
      // 2026-02-15 is a Sunday (day 0) — dr-test has no Sunday schedule
      const slots = await adapter.getAvailableSlots('dr-test', '2026-02-15', 30)
      expect(slots).toEqual([])
    })

    it('returns empty array for doctor with empty schedule', async () => {
      const adapter = new ManualAdapter()
      const slots = await adapter.getAvailableSlots('dr-empty', '2026-02-16', 30)
      expect(slots).toEqual([])
    })

    it('excludes slots that conflict with existing appointments', async () => {
      const adapter = new ManualAdapter()
      const date = '2026-02-23' // Monday

      // Book 09:00 slot
      await adapter.createAppointment({
        clinicSlug: 'test-clinic',
        doctorSlug: 'dr-test',
        patientName: 'Test Patient',
        patientPhone: '+34600000000',
        service: 'Limpieza dental',
        date,
        time: '09:00',
        duration: 30,
      })

      const slots = await adapter.getAvailableSlots('dr-test', date, 30)
      const starts = slots.map((s) => s.start)

      expect(starts).not.toContain('09:00')
      expect(starts).toContain('09:30')
    })
  })

  describe('createAppointment', () => {
    it('creates an appointment and returns confirmed status', async () => {
      const adapter = new ManualAdapter()
      const result = await adapter.createAppointment({
        clinicSlug: 'test-clinic',
        doctorSlug: 'dr-test',
        patientName: 'Jane Doe',
        patientPhone: '+34600111222',
        service: 'Limpieza dental',
        date: '2026-03-02', // Monday
        time: '10:00',
        duration: 30,
      })

      expect(result.status).toBe('confirmed')
      expect(result.patientName).toBe('Jane Doe')
      expect(result.id).toBeTruthy()
      expect(result.createdAt).toBeTruthy()
    })

    it('throws when time slot is not available', async () => {
      const adapter = new ManualAdapter()
      const date = '2026-03-09' // Monday

      // Book a slot first
      await adapter.createAppointment({
        clinicSlug: 'test-clinic',
        doctorSlug: 'dr-test',
        patientName: 'First',
        patientPhone: '+34600000000',
        service: 'Limpieza dental',
        date,
        time: '11:00',
        duration: 30,
      })

      // Try to double-book
      await expect(
        adapter.createAppointment({
          clinicSlug: 'test-clinic',
          doctorSlug: 'dr-test',
          patientName: 'Second',
          patientPhone: '+34600000001',
          service: 'Limpieza dental',
          date,
          time: '11:00',
          duration: 30,
        }),
      ).rejects.toThrow('Selected time slot is no longer available')
    })
  })

  describe('cancelAppointment', () => {
    it('cancels an existing appointment', async () => {
      const adapter = new ManualAdapter()
      const appt = await adapter.createAppointment({
        clinicSlug: 'test-clinic',
        doctorSlug: 'dr-test',
        patientName: 'Cancel Me',
        patientPhone: '+34600000000',
        service: 'Limpieza dental',
        date: '2026-03-16', // Monday
        time: '09:00',
        duration: 30,
      })

      await expect(adapter.cancelAppointment(appt.id)).resolves.toBeUndefined()

      // Slot should be available again after cancellation
      const slots = await adapter.getAvailableSlots('dr-test', '2026-03-16', 30)
      expect(slots.map((s) => s.start)).toContain('09:00')
    })

    it('throws for non-existent appointment', async () => {
      const adapter = new ManualAdapter()
      await expect(adapter.cancelAppointment('non-existent-id')).rejects.toThrow(
        'Appointment not found',
      )
    })
  })
})
