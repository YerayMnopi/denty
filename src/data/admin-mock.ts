// Mock data for admin panel — will be replaced by MongoDB queries

export interface MockAppointment {
  id: string
  patientName: string
  patientPhone: string
  patientEmail?: string
  doctorName: string
  service: string
  date: string
  time: string
  duration: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  whatsappSent: boolean
  emailSent: boolean
}

export interface MockAdminDoctor {
  id: string
  name: string
  specialization: Record<string, string>
  bio: Record<string, string>
  photo?: string
  schedule: { day: number; startTime: string; endTime: string }[]
  services: string[]
  active: boolean
}

const today = new Date()
const fmt = (d: Date) => d.toISOString().split('T')[0]
const addDays = (d: Date, n: number) => {
  const r = new Date(d)
  r.setDate(r.getDate() + n)
  return r
}

export const mockAppointments: MockAppointment[] = [
  {
    id: '1',
    patientName: 'María García',
    patientPhone: '+34612345678',
    doctorName: 'Dra. Ana López',
    service: 'Limpieza dental',
    date: fmt(today),
    time: '09:00',
    duration: 45,
    status: 'confirmed',
    whatsappSent: true,
    emailSent: true,
  },
  {
    id: '2',
    patientName: 'Carlos Ruiz',
    patientPhone: '+34623456789',
    doctorName: 'Dr. Pedro Martín',
    service: 'Ortodoncia',
    date: fmt(today),
    time: '10:00',
    duration: 30,
    status: 'pending',
    whatsappSent: true,
    emailSent: false,
  },
  {
    id: '3',
    patientName: 'Laura Fernández',
    patientPhone: '+34634567890',
    patientEmail: 'laura@email.com',
    doctorName: 'Dra. Ana López',
    service: 'Blanqueamiento',
    date: fmt(today),
    time: '11:30',
    duration: 60,
    status: 'confirmed',
    whatsappSent: true,
    emailSent: true,
  },
  {
    id: '4',
    patientName: 'Javier Moreno',
    patientPhone: '+34645678901',
    doctorName: 'Dr. Pedro Martín',
    service: 'Implantes',
    date: fmt(addDays(today, 1)),
    time: '09:30',
    duration: 90,
    status: 'pending',
    whatsappSent: false,
    emailSent: false,
  },
  {
    id: '5',
    patientName: 'Elena Torres',
    patientPhone: '+34656789012',
    doctorName: 'Dra. Ana López',
    service: 'Limpieza dental',
    date: fmt(addDays(today, 2)),
    time: '16:00',
    duration: 45,
    status: 'confirmed',
    whatsappSent: true,
    emailSent: true,
  },
  {
    id: '6',
    patientName: 'Miguel Sánchez',
    patientPhone: '+34667890123',
    doctorName: 'Dr. Pedro Martín',
    service: 'Ortodoncia',
    date: fmt(addDays(today, 3)),
    time: '12:00',
    duration: 30,
    status: 'pending',
    whatsappSent: true,
    emailSent: false,
  },
  {
    id: '7',
    patientName: 'Ana Rodríguez',
    patientPhone: '+34678901234',
    doctorName: 'Dra. Ana López',
    service: 'Implantes',
    date: fmt(addDays(today, 5)),
    time: '10:00',
    duration: 90,
    status: 'confirmed',
    whatsappSent: true,
    emailSent: true,
  },
]

export const mockAdminDoctors: MockAdminDoctor[] = [
  {
    id: '1',
    name: 'Dra. Ana López',
    specialization: { es: 'Odontología general', en: 'General Dentistry' },
    bio: {
      es: 'Más de 15 años de experiencia en odontología general y estética.',
      en: 'Over 15 years of experience in general and aesthetic dentistry.',
    },
    photo: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?w=200&h=200&fit=crop',
    schedule: [
      { day: 1, startTime: '09:00', endTime: '14:00' },
      { day: 1, startTime: '16:00', endTime: '20:00' },
      { day: 2, startTime: '09:00', endTime: '14:00' },
      { day: 3, startTime: '09:00', endTime: '14:00' },
      { day: 3, startTime: '16:00', endTime: '20:00' },
      { day: 4, startTime: '09:00', endTime: '14:00' },
      { day: 5, startTime: '09:00', endTime: '14:00' },
    ],
    services: ['Limpieza dental', 'Blanqueamiento', 'Implantes'],
    active: true,
  },
  {
    id: '2',
    name: 'Dr. Pedro Martín',
    specialization: { es: 'Ortodoncia', en: 'Orthodontics' },
    bio: {
      es: 'Especialista en ortodoncia invisible y convencional.',
      en: 'Specialist in invisible and conventional orthodontics.',
    },
    photo: 'https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?w=200&h=200&fit=crop',
    schedule: [
      { day: 1, startTime: '10:00', endTime: '14:00' },
      { day: 2, startTime: '10:00', endTime: '14:00' },
      { day: 2, startTime: '16:00', endTime: '19:00' },
      { day: 4, startTime: '10:00', endTime: '14:00' },
      { day: 4, startTime: '16:00', endTime: '19:00' },
    ],
    services: ['Ortodoncia', 'Implantes'],
    active: true,
  },
]

export const mockClinicSettings = {
  name: 'Clínica Dental Sonrisa',
  description: {
    es: 'Clínica dental de referencia en el centro de Madrid.',
    en: 'Leading dental clinic in central Madrid.',
  },
  address: 'Calle Gran Vía 45, 28013 Madrid',
  phone: '+34 911 234 567',
  email: 'info@clinicasonrisa.es',
  workingHours: [
    { day: 1, open: '09:00', close: '20:00' },
    { day: 2, open: '09:00', close: '20:00' },
    { day: 3, open: '09:00', close: '20:00' },
    { day: 4, open: '09:00', close: '20:00' },
    { day: 5, open: '09:00', close: '14:00' },
  ],
  services: [
    { name: { es: 'Limpieza dental', en: 'Dental Cleaning' }, duration: 45, price: 60 },
    { name: { es: 'Ortodoncia', en: 'Orthodontics' }, duration: 30, price: 2500 },
    { name: { es: 'Implantes', en: 'Implants' }, duration: 90, price: 1200 },
    { name: { es: 'Blanqueamiento', en: 'Whitening' }, duration: 60, price: 300 },
  ],
  managementSystem: 'manual' as string,
  managementConfig: {},
}
