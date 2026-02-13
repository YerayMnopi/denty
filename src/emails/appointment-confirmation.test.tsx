import { render } from '@react-email/components'
import { describe, expect, it } from 'vitest'
import { AppointmentConfirmation } from './appointment-confirmation'

describe('AppointmentConfirmation email template', () => {
  it('renders with all props', async () => {
    const html = await render(
      <AppointmentConfirmation
        patientName="Juan García"
        clinicName="Clínica Dental Sonrisa"
        doctorName="Dra. María López"
        service="Limpieza dental"
        date="2026-03-15"
        time="10:00"
        clinicAddress="Calle Gran Vía 45, Madrid"
        clinicPhone="+34 911 234 567"
      />,
    )

    expect(html).toContain('Juan García')
    expect(html).toContain('Clínica Dental Sonrisa')
    expect(html).toContain('Dra. María López')
    expect(html).toContain('Limpieza dental')
    expect(html).toContain('2026-03-15')
    expect(html).toContain('10:00')
    expect(html).toContain('Calle Gran Vía 45, Madrid')
    expect(html).toContain('+34 911 234 567')
  })

  it('renders with default props', async () => {
    const html = await render(<AppointmentConfirmation />)
    expect(html).toContain('Paciente')
    expect(html).toContain('confirmada')
  })
})
