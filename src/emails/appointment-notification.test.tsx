import { render } from '@react-email/components'
import { describe, expect, it } from 'vitest'
import { AppointmentNotification } from './appointment-notification'

describe('AppointmentNotification email template', () => {
  it('renders with all props including notes', async () => {
    const html = await render(
      <AppointmentNotification
        patientName="Juan García"
        patientPhone="+34 612 345 678"
        service="Limpieza dental"
        doctorName="Dra. María López"
        date="2026-03-15"
        time="10:00"
        notes="Primera visita"
      />,
    )

    expect(html).toContain('Juan García')
    expect(html).toContain('+34 612 345 678')
    expect(html).toContain('Limpieza dental')
    expect(html).toContain('Dra. María López')
    expect(html).toContain('2026-03-15')
    expect(html).toContain('10:00')
    expect(html).toContain('Primera visita')
  })

  it('renders without notes', async () => {
    const html = await render(
      <AppointmentNotification
        patientName="Juan García"
        patientPhone="+34 612 345 678"
        service="Limpieza dental"
        doctorName="Dra. María López"
        date="2026-03-15"
        time="10:00"
      />,
    )

    expect(html).toContain('Juan García')
    expect(html).not.toContain('Primera visita')
  })

  it('renders with default props', async () => {
    const html = await render(<AppointmentNotification />)
    expect(html).toContain('Paciente')
    expect(html).toContain('Nueva Cita Reservada')
  })
})
