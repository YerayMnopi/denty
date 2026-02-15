// Server function to create an appointment

import { createServerFn } from '@tanstack/react-start'
import { ObjectId } from 'mongodb'
import { getAdapter } from '@/adapters/factory'
import type { AppointmentData, CreatedAppointment } from '@/adapters/types'
import { mockClinics, mockDoctors } from '@/data/mock'
import { sendBookingNotifications } from './notifications'
import { createOrUpdatePatient } from './patients'

export interface CreatedAppointmentWithNotifications extends CreatedAppointment {
  whatsappSent: boolean
  emailSent: boolean
}

export const createAppointment = createServerFn({ method: 'POST' })
  .inputValidator((input: AppointmentData) => input)
  .handler(async ({ data }): Promise<CreatedAppointmentWithNotifications> => {
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

    const appointment = await adapter.createAppointment(data)

    // Find doctor name for notifications
    const doctor = mockDoctors.find((d) => d.slug === data.doctorSlug)
    const doctorName = doctor?.name ?? data.doctorSlug

    // Send notifications (non-blocking — failures don't affect the appointment)
    const notificationResult = await sendBookingNotifications({
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      notes: data.notes,
      service: data.service,
      date: data.date,
      time: data.time,
      clinicName: clinic.name,
      clinicEmail: clinic.email,
      clinicAddress: clinic.address,
      clinicPhone: clinic.phone,
      doctorName,
    })

    // Create or update patient profile (non-blocking)
    try {
      await createOrUpdatePatient({
        clinicId: clinic._id,
        phone: data.patientPhone,
        name: data.patientName,
        email: data.patientEmail,
        appointmentId: new ObjectId(appointment.id),
        service: data.service,
        doctorName,
        appointmentDate: new Date(`${data.date} ${data.time}`),
      })
    } catch (error) {
      console.error('Failed to create/update patient profile:', error)
      // Don't fail the appointment if patient creation fails
    }

    return {
      ...appointment,
      whatsappSent: notificationResult.whatsappSent,
      emailSent: notificationResult.emailSent,
    }
  })
