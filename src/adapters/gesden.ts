// GesdenAdapter — stub for Gesden clinic management system integration
// Will be implemented when API access is available

import type {
  AppointmentData,
  ClinicManagementAdapter,
  CreatedAppointment,
  DoctorData,
  TimeSlot,
} from './types'

export class GesdenAdapter implements ClinicManagementAdapter {
  async getAvailableSlots(
    _doctorSlug: string,
    _date: string,
    _serviceDuration: number,
  ): Promise<TimeSlot[]> {
    throw new Error(
      'Gesden integration is not yet available. Please configure your clinic to use the manual booking system or contact support for Gesden API access.',
    )
  }

  async createAppointment(_data: AppointmentData): Promise<CreatedAppointment> {
    throw new Error(
      'Gesden integration is not yet available. Appointment creation through Gesden requires API access. Please contact support.',
    )
  }

  async cancelAppointment(_appointmentId: string): Promise<void> {
    throw new Error(
      'Gesden integration is not yet available. Appointment cancellation through Gesden requires API access. Please contact support.',
    )
  }

  async syncDoctors(): Promise<DoctorData[]> {
    throw new Error(
      'Gesden integration is not yet available. Doctor synchronization requires API access. Please contact support.',
    )
  }
}
