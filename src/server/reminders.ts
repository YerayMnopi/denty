// Reminder and follow-up logic for patient CRM

import type { ObjectId } from 'mongodb'
import { mockClinics } from '@/data/mock'
import type { Appointment } from '@/lib/collections'

// Type for appointments with additional fields
interface AppointmentWithDetails extends Appointment {
  doctorName?: string
}

// Type for patients in bulk operations
interface PatientForBulk {
  name: string
  phone: string
}

interface ReminderData {
  patientName: string
  patientPhone: string
  patientEmail?: string
  service: string
  date: string
  time: string
  clinicName: string
  clinicAddress: string
  doctorName: string
}

/**
 * Send WhatsApp appointment reminder (24h or 1h before)
 */
export async function sendAppointmentReminder(
  data: ReminderData,
  timeFrame: '24h' | '1h',
): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
    return false
  }

  const recipientPhone = data.patientPhone.replace(/[^0-9]/g, '')

  const timeText = timeFrame === '24h' ? 'mañana' : 'en 1 hora'
  const message = `¡Hola ${data.patientName}! Te recordamos tu cita ${timeText} en ${data.clinicName}.

📅 Fecha: ${data.date}
⏰ Hora: ${data.time}
👨‍⚕️ Doctor: ${data.doctorName}
🦷 Servicio: ${data.service}
📍 Dirección: ${data.clinicAddress}

Si necesitas cancelar o reprogramar, contáctanos lo antes posible.`

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: message,
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[WhatsApp Reminder] API error:', response.status, body)
      return false
    }

    console.log(`[WhatsApp Reminder] ${timeFrame} reminder sent to`, recipientPhone)
    return true
  } catch (error) {
    console.error('[WhatsApp Reminder] Failed to send:', error)
    return false
  }
}

/**
 * Send post-visit follow-up message (24h after appointment)
 */
export async function sendPostVisitFollowUp(data: ReminderData): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
    return false
  }

  const recipientPhone = data.patientPhone.replace(/[^0-9]/g, '')

  const message = `¡Hola ${data.patientName}! 

Esperamos que tu visita de ayer en ${data.clinicName} haya sido satisfactoria. 

¿Cómo te sientes después del tratamiento de ${data.service}?

Si tienes alguna molestia o pregunta, no dudes en contactarnos. Tu salud dental es nuestra prioridad.

¡Gracias por confiar en nosotros! 😊`

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: message,
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[WhatsApp Follow-up] API error:', response.status, body)
      return false
    }

    console.log('[WhatsApp Follow-up] Post-visit message sent to', recipientPhone)
    return true
  } catch (error) {
    console.error('[WhatsApp Follow-up] Failed to send:', error)
    return false
  }
}

/**
 * Send recall campaign message to inactive patients
 */
export async function sendRecallCampaign(data: {
  patientName: string
  patientPhone: string
  clinicName: string
  clinicAddress: string
  clinicPhone: string
}): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
    return false
  }

  const recipientPhone = data.patientPhone.replace(/[^0-9]/g, '')

  const message = `¡Hola ${data.patientName}! 

Te echamos de menos en ${data.clinicName} 🦷

Ha pasado tiempo desde tu última visita y nos preocupamos por tu salud dental. ¿Te gustaría agendar una cita de revisión?

Recuerda que las revisiones regulares son clave para mantener una sonrisa saludable.

📞 Llámanos al ${data.clinicPhone}
📍 ${data.clinicAddress}

¡Esperamos verte pronto!`

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: recipientPhone,
        type: 'text',
        text: {
          body: message,
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[WhatsApp Recall] API error:', response.status, body)
      return false
    }

    console.log('[WhatsApp Recall] Campaign message sent to', recipientPhone)
    return true
  } catch (error) {
    console.error('[WhatsApp Recall] Failed to send:', error)
    return false
  }
}

/**
 * Process appointment reminders for upcoming appointments
 */
export async function sendAppointmentReminders(
  appointments: AppointmentWithDetails[],
  timeFrame: '24h' | '1h',
): Promise<void> {
  for (const appointment of appointments) {
    // Find clinic info
    const clinic = mockClinics.find((c) => c._id.toString() === appointment.clinicId.toString())
    if (!clinic) continue

    const reminderData: ReminderData = {
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientEmail: appointment.patientEmail,
      service: appointment.service,
      date: appointment.date.toLocaleDateString('es-ES'),
      time: appointment.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      clinicName: clinic.name,
      clinicAddress: `${clinic.address.street}, ${clinic.address.city}`,
      doctorName: appointment.doctorName || 'Nuestro equipo',
    }

    await sendAppointmentReminder(reminderData, timeFrame)
  }
}

/**
 * Send post-visit follow-ups for completed appointments
 */
export async function sendPostVisitFollowUps(appointments: AppointmentWithDetails[]): Promise<void> {
  for (const appointment of appointments) {
    // Find clinic info
    const clinic = mockClinics.find((c) => c._id.toString() === appointment.clinicId.toString())
    if (!clinic) continue

    const followUpData: ReminderData = {
      patientName: appointment.patientName,
      patientPhone: appointment.patientPhone,
      patientEmail: appointment.patientEmail,
      service: appointment.service,
      date: appointment.date.toLocaleDateString('es-ES'),
      time: appointment.date.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' }),
      clinicName: clinic.name,
      clinicAddress: `${clinic.address.street}, ${clinic.address.city}`,
      doctorName: appointment.doctorName || 'Nuestro equipo',
    }

    await sendPostVisitFollowUp(followUpData)
  }
}

/**
 * Send recall campaign to multiple inactive patients
 */
export async function sendRecallCampaignBulk(
  patients: PatientForBulk[],
  clinicId: ObjectId,
): Promise<void> {
  // Find clinic info
  const clinic = mockClinics.find((c) => c._id.toString() === clinicId.toString())
  if (!clinic) return

  for (const patient of patients) {
    const recallData = {
      patientName: patient.name,
      patientPhone: patient.phone,
      clinicName: clinic.name,
      clinicAddress: `${clinic.address.street}, ${clinic.address.city}`,
      clinicPhone: clinic.phone,
    }

    await sendRecallCampaign(recallData)
  }
}
