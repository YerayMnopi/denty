// React Email template for patient appointment confirmation

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

interface AppointmentConfirmationProps {
  patientName?: string
  clinicName?: string
  doctorName?: string
  service?: string
  date?: string
  time?: string
  clinicAddress?: string
  clinicPhone?: string
}

export function AppointmentConfirmation({
  patientName = 'Paciente',
  clinicName = 'Clínica',
  doctorName = 'Doctor',
  service = 'Servicio',
  date = '2026-01-01',
  time = '10:00',
  clinicAddress = 'Dirección',
  clinicPhone = '+34 000 000 000',
}: AppointmentConfirmationProps) {
  return (
    <Html>
      <Head />
      <Preview>Tu cita en {clinicName} está confirmada</Preview>
      <Body style={main}>
        <Container style={container}>
          <Heading style={heading}>¡Tu cita está confirmada!</Heading>
          <Text style={text}>Hola {patientName},</Text>
          <Text style={text}>Tu cita ha sido reservada con éxito.</Text>
          <Section style={detailsSection}>
            <Row>
              <Text style={label}>Clínica</Text>
              <Text style={value}>{clinicName}</Text>
            </Row>
            <Row>
              <Text style={label}>Doctor</Text>
              <Text style={value}>{doctorName}</Text>
            </Row>
            <Row>
              <Text style={label}>Servicio</Text>
              <Text style={value}>{service}</Text>
            </Row>
            <Row>
              <Text style={label}>Fecha</Text>
              <Text style={value}>{date}</Text>
            </Row>
            <Row>
              <Text style={label}>Hora</Text>
              <Text style={value}>{time}</Text>
            </Row>
            <Row>
              <Text style={label}>Dirección</Text>
              <Text style={value}>{clinicAddress}</Text>
            </Row>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Si necesitas cancelar o reprogramar, contacta con la clínica al {clinicPhone}.
          </Text>
          <Text style={footer}>— Denty</Text>
        </Container>
      </Body>
    </Html>
  )
}

export default AppointmentConfirmation

const main = { backgroundColor: '#f6f9fc', fontFamily: 'Arial, sans-serif' }
const container = { margin: '0 auto', padding: '20px', maxWidth: '600px' }
const heading = { color: '#0f766e', fontSize: '24px' }
const text = { color: '#333', fontSize: '16px', lineHeight: '24px' }
const detailsSection = { margin: '20px 0' }
const label = { color: '#666', fontSize: '14px', fontWeight: 'bold' as const, margin: '4px 0 0' }
const value = { color: '#333', fontSize: '16px', margin: '0 0 12px' }
const hr = { borderColor: '#e6e6e6', margin: '20px 0' }
const footer = { color: '#999', fontSize: '14px' }
