// ManualAdapter — calculates available slots from doctor schedule minus existing appointments
// Uses mock data for now; will use MongoDB when connected

import { mockDoctors } from '@/data/mock'
import type {
  AppointmentData,
  ClinicManagementAdapter,
  CreatedAppointment,
  TimeSlot,
} from './types'

// In-memory appointment store (will be replaced by MongoDB)
const appointments: CreatedAppointment[] = []

function parseTime(time: string): number {
  const [h, m] = time.split(':').map(Number)
  return h * 60 + m
}

function formatTime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`
}

function getDayOfWeek(dateStr: string): number {
  const date = new Date(`${dateStr}T12:00:00`)
  return date.getDay()
}

export class ManualAdapter implements ClinicManagementAdapter {
  async getAvailableSlots(
    doctorSlug: string,
    date: string,
    serviceDuration: number,
  ): Promise<TimeSlot[]> {
    const doctor = mockDoctors.find((d) => d.slug === doctorSlug)
    if (!doctor) return []

    const dayOfWeek = getDayOfWeek(date)
    const scheduleForDay = doctor.schedule.filter((s) => s.day === dayOfWeek)
    if (scheduleForDay.length === 0) return []

    // Get existing appointments for this doctor on this date
    const bookedSlots = appointments
      .filter((a) => a.doctorSlug === doctorSlug && a.date === date && a.status !== 'cancelled')
      .map((a) => ({
        start: parseTime(a.time),
        end: parseTime(a.time) + a.duration,
      }))

    const available: TimeSlot[] = []

    for (const schedule of scheduleForDay) {
      const schedStart = parseTime(schedule.startTime)
      const schedEnd = parseTime(schedule.endTime)

      // Generate slots based on service duration
      let slotStart = schedStart
      while (slotStart + serviceDuration <= schedEnd) {
        const slotEnd = slotStart + serviceDuration

        // Check for conflicts with booked appointments
        const hasConflict = bookedSlots.some(
          (booked) => slotStart < booked.end && slotEnd > booked.start,
        )

        if (!hasConflict) {
          available.push({
            start: formatTime(slotStart),
            end: formatTime(slotEnd),
          })
        }

        slotStart += serviceDuration
      }
    }

    return available
  }

  async createAppointment(data: AppointmentData): Promise<CreatedAppointment> {
    // Check for conflicts
    const slots = await this.getAvailableSlots(data.doctorSlug, data.date, data.duration)
    const isAvailable = slots.some((slot) => slot.start === data.time)

    if (!isAvailable) {
      throw new Error('Selected time slot is no longer available')
    }

    const appointment: CreatedAppointment = {
      id: crypto.randomUUID(),
      clinicSlug: data.clinicSlug,
      doctorSlug: data.doctorSlug,
      patientName: data.patientName,
      patientPhone: data.patientPhone,
      patientEmail: data.patientEmail,
      service: data.service,
      date: data.date,
      time: data.time,
      duration: data.duration,
      notes: data.notes,
      status: 'confirmed',
      createdAt: new Date().toISOString(),
    }

    appointments.push(appointment)
    return appointment
  }

  async cancelAppointment(appointmentId: string): Promise<void> {
    const appointment = appointments.find((a) => a.id === appointmentId)
    if (!appointment) {
      throw new Error('Appointment not found')
    }
    appointment.status = 'cancelled'
  }
}
