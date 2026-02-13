// React Email template for clinic notification about new appointment

import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Row,
  Section,
  Text,
} from '@react-email/components'

interface AppointmentNotificationProps {
  patientName?: string
  patientPhone?: string
  service?: string
  doctorName?: string
  date?: string
  time?: string
  notes?: string
}

export function AppointmentNotification({
  patientName = 'Paciente',
  patientPhone = '+34 000 000 000',
  service = 'Servicio',
  doctorName = 'Doctor',
  date = '2026-01-01',
  time = '10:00',
  notes,
}: AppointmentNotificationProps) {
  return (
    <Html>
      <Head />
      <Preview>
        Nueva cita: {patientName} - {service}
      </Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>Nueva Cita Reservada</Heading>
          <Text style={text}>Se ha reservado una nueva cita con los siguientes datos:</Text>
          <Section style={detailsSection}>
            <Row>
              <Text style={label}>Paciente</Text>
              <Text style={value}>{patientName}</Text>
            </Row>
            <Row>
              <Text style={label}>Teléfono</Text>
              <Text style={value}>{patientPhone}</Text>
            </Row>
            <Row>
              <Text style={label}>Servicio</Text>
              <Text style={value}>{service}</Text>
            </Row>
            <Row>
              <Text style={label}>Doctor</Text>
              <Text style={value}>{doctorName}</Text>
            </Row>
            <Row>
              <Text style={label}>Fecha</Text>
              <Text style={value}>{date}</Text>
            </Row>
            <Row>
              <Text style={label}>Hora</Text>
              <Text style={value}>{time}</Text>
            </Row>
            {notes && (
              <Row>
                <Text style={label}>Notas</Text>
                <Text style={value}>{notes}</Text>
              </Row>
            )}
          </Section>
          <Hr style={hr} />
          <Text style={footer}>— Denty</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default AppointmentNotification

const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '20px', maxWidth: '600px' }
const heading = { color: '#0f766e', fontSize: '24px' }
const text = { color: '#333', fontSize: '16px', lineHeight: '24px' }
const detailsSection = { margin: '20px 0' }
const label = { color: '#666', fontSize: '14px', fontWeight: 'bold' as const, margin: '4px 0 0' }
const value = { color: '#333', fontSize: '16px', margin: '0 0 12px' }
const hr = { borderColor: '#e6e6e6', margin: '20px 0' }
const footer = { color: '#999', fontSize: '14px' }
