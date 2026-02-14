// Notification functions for WhatsApp and Email after booking

import { Resend } from 'resend'

export interface NotificationData {
  // Patient info
  patientName: string
  patientPhone: string
  patientEmail?: string
  notes?: string
  // Appointment info
  service: string
  date: string // YYYY-MM-DD
  time: string // HH:mm
  // Clinic info
  clinicName: string
  clinicEmail: string
  clinicAddress: string
  clinicPhone: string
  // Doctor info
  doctorName: string
}

export interface NotificationResult {
  whatsappSent: boolean
  emailSent: boolean
}

/**
 * Send WhatsApp confirmation to patient via WhatsApp Business Cloud API.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendWhatsAppConfirmation(data: NotificationData): Promise<boolean> {
  const token = process.env.WHATSAPP_TOKEN
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID

  if (!token || !phoneNumberId) {
    console.warn('[WhatsApp] Missing WHATSAPP_TOKEN or WHATSAPP_PHONE_NUMBER_ID')
    return false
  }

  // Strip non-numeric chars from phone for WhatsApp API
  const recipientPhone = data.patientPhone.replace(/[^0-9]/g, '')

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
        type: 'template',
        template: {
          name: 'appointment_confirmation',
          language: { code: 'es' },
          components: [
            {
              type: 'body',
              parameters: [
                { type: 'text', text: data.clinicName },
                { type: 'text', text: data.doctorName },
                { type: 'text', text: data.service },
                { type: 'text', text: data.date },
                { type: 'text', text: data.time },
                { type: 'text', text: data.clinicAddress },
              ],
            },
          ],
        },
      }),
    })

    if (!response.ok) {
      const body = await response.text()
      console.error('[WhatsApp] API error:', response.status, body)
      return false
    }

    console.log('[WhatsApp] Confirmation sent to', recipientPhone)
    return true
  } catch (error) {
    console.error('[WhatsApp] Failed to send confirmation:', error)
    return false
  }
}

/**
 * Send email notification to clinic via Resend.
 * Returns true if sent successfully, false otherwise.
 */
export async function sendClinicEmailNotification(data: NotificationData): Promise<boolean> {
  const apiKey = process.env.RESEND_API_KEY

  if (!apiKey) {
    console.warn('[Email] Missing RESEND_API_KEY')
    return false
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: 'Denty <noreply@denty.es>',
      to: data.clinicEmail,
      subject: `Nueva cita: ${data.patientName} - ${data.service}`,
      html: buildClinicNotificationHtml(data),
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return false
    }

    console.log('[Email] Clinic notification sent to', data.clinicEmail)
    return true
  } catch (error) {
    console.error('[Email] Failed to send clinic notification:', error)
    return false
  }
}

/**
 * Send patient confirmation email via Resend (if email provided).
 * Returns true if sent successfully, false otherwise.
 */
export async function sendPatientEmailConfirmation(data: NotificationData): Promise<boolean> {
  if (!data.patientEmail) return false

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.warn('[Email] Missing RESEND_API_KEY')
    return false
  }

  const resend = new Resend(apiKey)

  try {
    const { error } = await resend.emails.send({
      from: 'Denty <noreply@denty.es>',
      to: data.patientEmail,
      subject: `Confirmación de cita - ${data.clinicName}`,
      html: buildPatientConfirmationHtml(data),
    })

    if (error) {
      console.error('[Email] Resend error:', error)
      return false
    }

    console.log('[Email] Patient confirmation sent to', data.patientEmail)
    return true
  } catch (error) {
    console.error('[Email] Failed to send patient confirmation:', error)
    return false
  }
}

/**
 * Send all notifications for a booking. Failures are logged but do not throw.
 */
export async function sendBookingNotifications(
  data: NotificationData,
): Promise<NotificationResult> {
  const [whatsappSent, clinicEmailSent, patientEmailSent] = await Promise.all([
    sendWhatsAppConfirmation(data),
    sendClinicEmailNotification(data),
    sendPatientEmailConfirmation(data),
  ])

  return {
    whatsappSent,
    emailSent: clinicEmailSent || patientEmailSent,
  }
}

// ─── HTML builders (inline for simplicity; React Email templates below) ──────

function buildClinicNotificationHtml(data: NotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0f766e;">Nueva Cita Reservada</h1>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px; font-weight: bold;">Paciente:</td><td style="padding: 8px;">${escapeHtml(data.patientName)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Teléfono:</td><td style="padding: 8px;">${escapeHtml(data.patientPhone)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Servicio:</td><td style="padding: 8px;">${escapeHtml(data.service)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Doctor:</td><td style="padding: 8px;">${escapeHtml(data.doctorName)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Fecha:</td><td style="padding: 8px;">${escapeHtml(data.date)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Hora:</td><td style="padding: 8px;">${escapeHtml(data.time)}</td></tr>
    ${data.notes ? `<tr><td style="padding: 8px; font-weight: bold;">Notas:</td><td style="padding: 8px;">${escapeHtml(data.notes)}</td></tr>` : ''}
  </table>
  <p style="color: #666; margin-top: 20px;">— Denty</p>
</body>
</html>`
}

function buildPatientConfirmationHtml(data: NotificationData): string {
  return `
<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #0f766e;">¡Tu cita está confirmada!</h1>
  <p>Hola ${escapeHtml(data.patientName)},</p>
  <p>Tu cita ha sido reservada con éxito. Aquí están los detalles:</p>
  <table style="width: 100%; border-collapse: collapse;">
    <tr><td style="padding: 8px; font-weight: bold;">Clínica:</td><td style="padding: 8px;">${escapeHtml(data.clinicName)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Doctor:</td><td style="padding: 8px;">${escapeHtml(data.doctorName)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Servicio:</td><td style="padding: 8px;">${escapeHtml(data.service)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Fecha:</td><td style="padding: 8px;">${escapeHtml(data.date)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Hora:</td><td style="padding: 8px;">${escapeHtml(data.time)}</td></tr>
    <tr><td style="padding: 8px; font-weight: bold;">Dirección:</td><td style="padding: 8px;">${escapeHtml(data.clinicAddress)}</td></tr>
  </table>
  <p style="color: #666; margin-top: 20px;">Si necesitas cancelar o reprogramar, contacta con la clínica al ${escapeHtml(data.clinicPhone)}.</p>
  <p style="color: #666;">— Denty</p>
</body>
</html>`
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
}
