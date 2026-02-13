// Server function to get available time slots for a doctor on a date

import { createServerFn } from '@tanstack/react-start'
import { getAdapter } from '@/adapters/factory'
import type { TimeSlot } from '@/adapters/types'
import { mockClinics } from '@/data/mock'

interface GetSlotsInput {
  clinicSlug: string
  doctorSlug: string
  date: string
  serviceDuration: number
}

export const getAvailableSlots = createServerFn({ method: 'GET' })
  .inputValidator((input: GetSlotsInput) => input)
  .handler(async ({ data }): Promise<TimeSlot[]> => {
    const { clinicSlug, doctorSlug, date, serviceDuration } = data

    // Get clinic to determine which adapter to use
    const clinic = mockClinics.find((c) => c.slug === clinicSlug)
    if (!clinic) {
      throw new Error('Clinic not found')
    }

    // All mock clinics use 'manual' adapter for now
    const managementSystem = 'manual'
    const adapter = getAdapter(managementSystem)

    return adapter.getAvailableSlots(doctorSlug, date, serviceDuration)
  })
