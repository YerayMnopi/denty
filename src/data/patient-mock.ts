// Mock patient data for development and testing

import { ObjectId } from 'mongodb'
import type { Patient } from '@/lib/collections'

export const mockPatients: Patient[] = [
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'), // Clínica Dental Sonrisa
    name: 'María García López',
    phone: '+34 666 123 456',
    email: 'maria.garcia@email.com',
    channels: { preferred: 'whatsapp', whatsappId: '+34666123456' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Limpieza dental',
        date: new Date('2024-01-15'),
        doctorName: 'Dr. Juan Pérez',
      },
      {
        appointmentId: new ObjectId(),
        service: 'Empaste',
        date: new Date('2024-03-20'),
        doctorName: 'Dr. Juan Pérez',
      },
    ],
    tags: ['regular-patient', 'preventive-care'],
    notes: 'Paciente muy puntual. Prefiere citas por la mañana.',
    lastVisit: new Date('2024-03-20'),
    nextAppointment: new Date('2024-06-15'),
    createdAt: new Date('2023-12-01'),
    updatedAt: new Date('2024-03-20'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Carlos Rodríguez Fernández',
    phone: '+34 655 987 654',
    email: 'carlos.rodriguez@email.com',
    channels: { preferred: 'email' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Ortodoncia - Revisión',
        date: new Date('2024-02-10'),
        doctorName: 'Dra. Ana Martínez',
      },
    ],
    tags: ['orthodontics', 'active-treatment'],
    notes: 'Tratamiento de ortodoncia en curso. Próxima revisión en 6 semanas.',
    lastVisit: new Date('2024-02-10'),
    nextAppointment: new Date('2024-03-25'),
    createdAt: new Date('2023-11-15'),
    updatedAt: new Date('2024-02-10'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Ana Sánchez Torres',
    phone: '+34 644 555 789',
    channels: { preferred: 'whatsapp', whatsappId: '+34644555789' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Blanqueamiento dental',
        date: new Date('2023-08-15'),
        doctorName: 'Dr. Juan Pérez',
      },
    ],
    tags: ['cosmetic-treatment', 'inactive'],
    notes: 'Muy satisfecha con el blanqueamiento. Interesada en tratamientos estéticos.',
    lastVisit: new Date('2023-08-15'),
    createdAt: new Date('2023-07-20'),
    updatedAt: new Date('2023-08-15'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Pedro Martín Ruiz',
    phone: '+34 633 741 852',
    email: 'pedro.martin@email.com',
    channels: { preferred: 'phone' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Extracción dental',
        date: new Date('2024-01-08'),
        doctorName: 'Dr. Luis González',
      },
      {
        appointmentId: new ObjectId(),
        service: 'Revisión post-extracción',
        date: new Date('2024-01-22'),
        doctorName: 'Dr. Luis González',
      },
    ],
    tags: ['surgery', 'follow-up-needed'],
    notes: 'Extracción complicada. Requiere seguimiento especial.',
    lastVisit: new Date('2024-01-22'),
    createdAt: new Date('2023-12-20'),
    updatedAt: new Date('2024-01-22'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Laura Jiménez Mora',
    phone: '+34 622 159 753',
    email: 'laura.jimenez@email.com',
    channels: { preferred: 'whatsapp', whatsappId: '+34622159753' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Primera consulta',
        date: new Date('2024-02-28'),
        doctorName: 'Dr. Juan Pérez',
      },
    ],
    tags: ['new-patient', 'first-visit'],
    notes: 'Primera visita. Necesita plan de tratamiento completo.',
    lastVisit: new Date('2024-02-28'),
    nextAppointment: new Date('2024-03-15'),
    createdAt: new Date('2024-02-28'),
    updatedAt: new Date('2024-02-28'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Roberto Fernández Vila',
    phone: '+34 611 357 159',
    channels: { preferred: 'whatsapp', whatsappId: '+34611357159' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Implante dental',
        date: new Date('2023-09-12'),
        doctorName: 'Dr. Luis González',
      },
      {
        appointmentId: new ObjectId(),
        service: 'Revisión implante',
        date: new Date('2023-12-12'),
        doctorName: 'Dr. Luis González',
      },
    ],
    tags: ['implants', 'high-value'],
    notes: 'Implante en sector anterior. Muy satisfecho con el resultado.',
    lastVisit: new Date('2023-12-12'),
    createdAt: new Date('2023-08-01'),
    updatedAt: new Date('2023-12-12'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Carmen López Vega',
    phone: '+34 699 876 543',
    email: 'carmen.lopez@email.com',
    channels: { preferred: 'email' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Endodoncia',
        date: new Date('2024-01-30'),
        doctorName: 'Dra. Ana Martínez',
      },
    ],
    tags: ['endodontics', 'pain-management'],
    notes: 'Tratamiento de endodoncia completado. Sin complicaciones.',
    lastVisit: new Date('2024-01-30'),
    createdAt: new Date('2024-01-20'),
    updatedAt: new Date('2024-01-30'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'José Antonio Ruiz Castro',
    phone: '+34 688 234 567',
    channels: { preferred: 'phone' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Limpieza dental',
        date: new Date('2023-06-15'),
        doctorName: 'Dr. Juan Pérez',
      },
    ],
    tags: ['inactive', 'recall-needed'],
    notes: 'Paciente ocasional. Le cuesta mantener la regularidad en las visitas.',
    lastVisit: new Date('2023-06-15'),
    createdAt: new Date('2023-06-10'),
    updatedAt: new Date('2023-06-15'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Elena Morales Díaz',
    phone: '+34 677 345 678',
    email: 'elena.morales@email.com',
    channels: { preferred: 'whatsapp', whatsappId: '+34677345678' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Revisión preventiva',
        date: new Date('2024-02-05'),
        doctorName: 'Dr. Juan Pérez',
      },
      {
        appointmentId: new ObjectId(),
        service: 'Limpieza profesional',
        date: new Date('2024-02-05'),
        doctorName: 'Dr. Juan Pérez',
      },
    ],
    tags: ['preventive-care', 'regular-patient', 'hygiene-focused'],
    notes: 'Excelente higiene dental. Muy consciente de la prevención.',
    lastVisit: new Date('2024-02-05'),
    nextAppointment: new Date('2024-08-05'),
    createdAt: new Date('2023-02-05'),
    updatedAt: new Date('2024-02-05'),
  },
  {
    _id: new ObjectId(),
    clinicId: new ObjectId('507f1f77bcf86cd799439011'),
    name: 'Miguel Ángel Torres Prieto',
    phone: '+34 666 789 012',
    channels: { preferred: 'whatsapp', whatsappId: '+34666789012' },
    visitHistory: [
      {
        appointmentId: new ObjectId(),
        service: 'Urgencia - Dolor',
        date: new Date('2024-03-01'),
        doctorName: 'Dr. Luis González',
      },
    ],
    tags: ['emergency', 'new-patient', 'pain-management'],
    notes: 'Visita de urgencia por dolor intenso. Requiere seguimiento.',
    lastVisit: new Date('2024-03-01'),
    nextAppointment: new Date('2024-03-08'),
    createdAt: new Date('2024-03-01'),
    updatedAt: new Date('2024-03-01'),
  },
]

// Helper function to get patients for a specific clinic
export function getPatientsByClinic(clinicId: string): Patient[] {
  return mockPatients.filter((patient) => patient.clinicId.toString() === clinicId)
}

// Helper to get all available tags
export function getAllPatientTags(): string[] {
  const tags = new Set<string>()
  mockPatients.forEach((patient) => {
    patient.tags.forEach((tag) => {
      tags.add(tag)
    })
  })
  return Array.from(tags).sort()
}
