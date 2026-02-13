// Server function to create an appointment

import { createServerFn } from '@tanstack/react-start'
import { getAdapter } from '@/adapters/factory'
import type { AppointmentData, CreatedAppointment } from '@/adapters/types'
import { mockClinics } from '@/data/mock'

export const createAppointment = createServerFn({ method: 'POST' })
  .inputValidator((input: AppointmentData) => input)
  .handler(async ({ data }): Promise<CreatedAppointment> => {
    const { clinicSlug } = data

    // Get clinic to determine which adapter to use
    const clinic = mockClinics.find((c) => c.slug === clinicSlug)
    if (!clinic) {
      throw new Error('Clinic not found')
    }

    // Validate required fields
    if (!data.patientName?.trim()) {
      throw new Error('Patient name is required')
    }
    if (!data.patientPhone?.trim()) {
      throw new Error('Patient phone is required')
    }
    if (!data.doctorSlug) {
      throw new Error('Doctor selection is required')
    }
    if (!data.service) {
      throw new Error('Service selection is required')
    }
    if (!data.date || !data.time) {
      throw new Error('Date and time selection is required')
    }

    // All mock clinics use 'manual' adapter for now
    const managementSystem = 'manual'
    const adapter = getAdapter(managementSystem)

    return adapter.createAppointment(data)
  })
