// Adapter layer types for clinic management system integration

export interface TimeSlot {
  start: string // HH:mm format
  end: string // HH:mm format
}

export interface AppointmentData {
  clinicSlug: string
  doctorSlug: string
  patientName: string
  patientPhone: string
  patientEmail?: string
  service: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  duration: number // minutes
  notes?: string
}

export interface CreatedAppointment {
  id: string
  externalId?: string
  clinicSlug: string
  doctorSlug: string
  patientName: string
  patientPhone: string
  patientEmail?: string
  service: string
  date: string
  time: string
  duration: number
  notes?: string
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  createdAt: string
}

export interface DoctorData {
  slug: string
  name: string
  specialization: Record<string, string>
}

export interface ClinicManagementAdapter {
  getAvailableSlots(doctorSlug: string, date: string, serviceDuration: number): Promise<TimeSlot[]>
  createAppointment(data: AppointmentData): Promise<CreatedAppointment>
  cancelAppointment(appointmentId: string): Promise<void>
  syncDoctors?(): Promise<DoctorData[]>
}
