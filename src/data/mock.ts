// Mock data for development — will be replaced by MongoDB queries

export interface MockClinic {
  slug: string
  name: string
  city: string
  description: Record<string, string>
  services: string[]
  address: string
  phone: string
  email: string
  website?: string
  workingHours: { day: number; open: string; close: string }[]
  serviceDetails: { name: Record<string, string>; duration: number; price: string }[]
}

export interface MockDoctor {
  slug: string
  name: string
  clinicSlug: string
  clinicName: string
  specialization: Record<string, string>
  photo?: string
  bio: Record<string, string>
  schedule: { day: number; startTime: string; endTime: string }[]
  services: string[]
}

export interface MockTreatment {
  slug: string
  name: Record<string, string>
  description: Record<string, string>
  category: string
  duration: number // minutes
  priceRange?: string
}

export const mockClinics: MockClinic[] = [
  {
    slug: 'clinica-dental-sonrisa',
    name: 'Clínica Dental Sonrisa',
    city: 'Madrid',
    description: {
      es: 'Clínica dental de referencia en el centro de Madrid con más de 20 años de experiencia.',
      en: 'Leading dental clinic in central Madrid with over 20 years of experience.',
    },
    services: ['Limpieza dental', 'Ortodoncia', 'Implantes', 'Blanqueamiento'],
    address: 'Calle Gran Vía 45, 28013 Madrid',
    phone: '+34 911 234 567',
    email: 'info@clinicasonrisa.es',
    website: 'https://clinicasonrisa.es',
    workingHours: [
      { day: 1, open: '09:00', close: '20:00' },
      { day: 2, open: '09:00', close: '20:00' },
      { day: 3, open: '09:00', close: '20:00' },
      { day: 4, open: '09:00', close: '20:00' },
      { day: 5, open: '09:00', close: '14:00' },
    ],
    serviceDetails: [
      { name: { es: 'Limpieza dental', en: 'Dental Cleaning' }, duration: 45, price: '60€' },
      { name: { es: 'Ortodoncia', en: 'Orthodontics' }, duration: 30, price: '2.500€' },
      { name: { es: 'Implantes', en: 'Implants' }, duration: 90, price: '1.200€' },
      { name: { es: 'Blanqueamiento', en: 'Whitening' }, duration: 60, price: '300€' },
    ],
  },
  {
    slug: 'dental-care-barcelona',
    name: 'Dental Care Barcelona',
    city: 'Barcelona',
    description: {
      es: 'Odontología avanzada con tecnología de última generación en Barcelona.',
      en: 'Advanced dentistry with cutting-edge technology in Barcelona.',
    },
    services: ['Endodoncia', 'Periodoncia', 'Estética dental', 'Prótesis'],
    address: 'Avinguda Diagonal 312, 08013 Barcelona',
    phone: '+34 933 456 789',
    email: 'info@dentalcarebarcelona.es',
    website: 'https://dentalcarebarcelona.es',
    workingHours: [
      { day: 1, open: '08:30', close: '19:30' },
      { day: 2, open: '08:30', close: '19:30' },
      { day: 3, open: '08:30', close: '19:30' },
      { day: 4, open: '08:30', close: '19:30' },
      { day: 5, open: '08:30', close: '15:00' },
    ],
    serviceDetails: [
      { name: { es: 'Endodoncia', en: 'Root Canal' }, duration: 60, price: '250€' },
      { name: { es: 'Periodoncia', en: 'Periodontics' }, duration: 45, price: '180€' },
      { name: { es: 'Estética dental', en: 'Cosmetic Dentistry' }, duration: 60, price: '500€' },
      { name: { es: 'Prótesis', en: 'Prosthesis' }, duration: 60, price: '800€' },
    ],
  },
  {
    slug: 'clinica-dientes-sanos',
    name: 'Clínica Dientes Sanos',
    city: 'Valencia',
    description: {
      es: 'Tu clínica dental de confianza en Valencia. Tratamientos personalizados.',
      en: 'Your trusted dental clinic in Valencia. Personalized treatments.',
    },
    services: ['Ortodoncia invisible', 'Implantes', 'Odontopediatría', 'Cirugía oral'],
    address: 'Calle Colón 28, 46004 Valencia',
    phone: '+34 963 123 456',
    email: 'cita@dientessanos.es',
    workingHours: [
      { day: 1, open: '09:00', close: '21:00' },
      { day: 2, open: '09:00', close: '21:00' },
      { day: 3, open: '09:00', close: '21:00' },
      { day: 4, open: '09:00', close: '21:00' },
      { day: 5, open: '09:00', close: '14:00' },
      { day: 6, open: '10:00', close: '13:00' },
    ],
    serviceDetails: [
      { name: { es: 'Ortodoncia invisible', en: 'Invisible Orthodontics' }, duration: 30, price: '3.000€' },
      { name: { es: 'Implantes', en: 'Implants' }, duration: 90, price: '1.500€' },
      { name: { es: 'Odontopediatría', en: 'Pediatric Dentistry' }, duration: 30, price: '60€' },
      { name: { es: 'Cirugía oral', en: 'Oral Surgery' }, duration: 90, price: '400€' },
    ],
  },
  {
    slug: 'smile-clinic-sevilla',
    name: 'Smile Clinic Sevilla',
    city: 'Sevilla',
    description: {
      es: 'Especialistas en estética dental y ortodoncia en Sevilla.',
      en: 'Specialists in cosmetic dentistry and orthodontics in Seville.',
    },
    services: ['Carillas', 'Blanqueamiento', 'Ortodoncia', 'Limpieza dental'],
    address: 'Avenida de la Constitución 15, 41001 Sevilla',
    phone: '+34 954 789 012',
    email: 'hola@smileclinicsevilla.es',
    website: 'https://smileclinicsevilla.es',
    workingHours: [
      { day: 1, open: '10:00', close: '20:00' },
      { day: 2, open: '10:00', close: '20:00' },
      { day: 3, open: '10:00', close: '20:00' },
      { day: 4, open: '10:00', close: '20:00' },
      { day: 5, open: '10:00', close: '15:00' },
    ],
    serviceDetails: [
      { name: { es: 'Carillas', en: 'Veneers' }, duration: 60, price: '500€' },
      { name: { es: 'Blanqueamiento', en: 'Whitening' }, duration: 60, price: '350€' },
      { name: { es: 'Ortodoncia', en: 'Orthodontics' }, duration: 30, price: '2.000€' },
      { name: { es: 'Limpieza dental', en: 'Dental Cleaning' }, duration: 45, price: '55€' },
    ],
  },
  {
    slug: 'centro-dental-bilbao',
    name: 'Centro Dental Bilbao',
    city: 'Bilbao',
    description: {
      es: 'Centro dental multidisciplinar en el corazón de Bilbao.',
      en: 'Multidisciplinary dental center in the heart of Bilbao.',
    },
    services: ['Implantes', 'Periodoncia', 'Endodoncia', 'Prótesis dental'],
    address: 'Gran Vía de Don Diego López de Haro 8, 48001 Bilbao',
    phone: '+34 944 567 890',
    email: 'info@centrodentalbilbao.es',
    workingHours: [
      { day: 1, open: '08:00', close: '19:00' },
      { day: 2, open: '08:00', close: '19:00' },
      { day: 3, open: '08:00', close: '19:00' },
      { day: 4, open: '08:00', close: '19:00' },
      { day: 5, open: '08:00', close: '14:00' },
    ],
    serviceDetails: [
      { name: { es: 'Implantes', en: 'Implants' }, duration: 90, price: '1.300€' },
      { name: { es: 'Periodoncia', en: 'Periodontics' }, duration: 45, price: '200€' },
      { name: { es: 'Endodoncia', en: 'Root Canal' }, duration: 60, price: '280€' },
      { name: { es: 'Prótesis dental', en: 'Dental Prosthesis' }, duration: 60, price: '1.000€' },
    ],
  },
]

export const mockDoctors: MockDoctor[] = [
  {
    slug: 'dra-maria-garcia',
    name: 'Dra. María García',
    clinicSlug: 'clinica-dental-sonrisa',
    clinicName: 'Clínica Dental Sonrisa',
    specialization: { es: 'Ortodoncia', en: 'Orthodontics' },
    bio: {
      es: 'Especialista en ortodoncia con más de 15 años de experiencia. Certificada en Invisalign y ortodoncia lingual.',
      en: 'Orthodontics specialist with over 15 years of experience. Certified in Invisalign and lingual orthodontics.',
    },
    schedule: [
      { day: 1, startTime: '09:00', endTime: '14:00' },
      { day: 2, startTime: '09:00', endTime: '14:00' },
      { day: 3, startTime: '15:00', endTime: '20:00' },
      { day: 4, startTime: '09:00', endTime: '14:00' },
      { day: 5, startTime: '09:00', endTime: '13:00' },
    ],
    services: ['Ortodoncia', 'Blanqueamiento'],
  },
  {
    slug: 'dr-carlos-lopez',
    name: 'Dr. Carlos López',
    clinicSlug: 'clinica-dental-sonrisa',
    clinicName: 'Clínica Dental Sonrisa',
    specialization: { es: 'Implantología', en: 'Implantology' },
    bio: {
      es: 'Cirujano oral e implantólogo. Máster en Implantología Avanzada por la Universidad Complutense de Madrid.',
      en: 'Oral surgeon and implantologist. Master in Advanced Implantology from Complutense University of Madrid.',
    },
    schedule: [
      { day: 1, startTime: '10:00', endTime: '20:00' },
      { day: 3, startTime: '10:00', endTime: '20:00' },
      { day: 5, startTime: '09:00', endTime: '14:00' },
    ],
    services: ['Implantes', 'Cirugía oral'],
  },
  {
    slug: 'dra-ana-martinez',
    name: 'Dra. Ana Martínez',
    clinicSlug: 'dental-care-barcelona',
    clinicName: 'Dental Care Barcelona',
    specialization: { es: 'Endodoncia', en: 'Endodontics' },
    bio: {
      es: 'Endodoncista con dedicación exclusiva. Formada en técnicas de microscopía y rotatorias de última generación.',
      en: 'Dedicated endodontist. Trained in cutting-edge microscopy and rotary techniques.',
    },
    schedule: [
      { day: 1, startTime: '08:30', endTime: '15:00' },
      { day: 2, startTime: '08:30', endTime: '15:00' },
      { day: 4, startTime: '13:00', endTime: '19:30' },
      { day: 5, startTime: '08:30', endTime: '15:00' },
    ],
    services: ['Endodoncia', 'Estética dental'],
  },
  {
    slug: 'dr-pablo-ruiz',
    name: 'Dr. Pablo Ruiz',
    clinicSlug: 'dental-care-barcelona',
    clinicName: 'Dental Care Barcelona',
    specialization: { es: 'Periodoncia', en: 'Periodontics' },
    bio: {
      es: 'Periodoncista experto en tratamiento de enfermedades de las encías y regeneración ósea.',
      en: 'Expert periodontist in gum disease treatment and bone regeneration.',
    },
    schedule: [
      { day: 2, startTime: '09:00', endTime: '19:30' },
      { day: 3, startTime: '09:00', endTime: '19:30' },
      { day: 4, startTime: '09:00', endTime: '19:30' },
    ],
    services: ['Periodoncia', 'Prótesis'],
  },
  {
    slug: 'dra-laura-fernandez',
    name: 'Dra. Laura Fernández',
    clinicSlug: 'clinica-dientes-sanos',
    clinicName: 'Clínica Dientes Sanos',
    specialization: { es: 'Odontopediatría', en: 'Pediatric Dentistry' },
    bio: {
      es: 'Especialista en odontología infantil. Experta en crear un ambiente cómodo y divertido para los más pequeños.',
      en: 'Specialist in pediatric dentistry. Expert in creating a comfortable and fun environment for children.',
    },
    schedule: [
      { day: 1, startTime: '09:00', endTime: '17:00' },
      { day: 2, startTime: '09:00', endTime: '17:00' },
      { day: 3, startTime: '09:00', endTime: '17:00' },
      { day: 4, startTime: '09:00', endTime: '17:00' },
      { day: 5, startTime: '09:00', endTime: '14:00' },
    ],
    services: ['Odontopediatría', 'Ortodoncia invisible'],
  },
  {
    slug: 'dr-javier-moreno',
    name: 'Dr. Javier Moreno',
    clinicSlug: 'smile-clinic-sevilla',
    clinicName: 'Smile Clinic Sevilla',
    specialization: { es: 'Estética dental', en: 'Cosmetic Dentistry' },
    bio: {
      es: 'Especialista en estética dental y diseño de sonrisa. Referente en carillas y blanqueamiento en Andalucía.',
      en: 'Specialist in cosmetic dentistry and smile design. Leading expert in veneers and whitening in Andalusia.',
    },
    schedule: [
      { day: 1, startTime: '10:00', endTime: '20:00' },
      { day: 2, startTime: '10:00', endTime: '20:00' },
      { day: 3, startTime: '10:00', endTime: '20:00' },
      { day: 4, startTime: '10:00', endTime: '20:00' },
    ],
    services: ['Carillas', 'Blanqueamiento', 'Ortodoncia'],
  },
  {
    slug: 'dra-elena-diaz',
    name: 'Dra. Elena Díaz',
    clinicSlug: 'centro-dental-bilbao',
    clinicName: 'Centro Dental Bilbao',
    specialization: { es: 'Cirugía oral', en: 'Oral Surgery' },
    bio: {
      es: 'Cirujana oral y maxilofacial. Especialista en extracciones complejas, cirugía de muelas del juicio e implantes.',
      en: 'Oral and maxillofacial surgeon. Specialist in complex extractions, wisdom teeth surgery, and implants.',
    },
    schedule: [
      { day: 1, startTime: '08:00', endTime: '15:00' },
      { day: 2, startTime: '08:00', endTime: '15:00' },
      { day: 3, startTime: '08:00', endTime: '15:00' },
      { day: 4, startTime: '12:00', endTime: '19:00' },
    ],
    services: ['Implantes', 'Endodoncia', 'Cirugía oral'],
  },
]

export const mockTreatments: MockTreatment[] = [
  {
    slug: 'limpieza-dental',
    name: { es: 'Limpieza dental', en: 'Dental Cleaning' },
    description: {
      es: 'Eliminación profesional de placa y sarro para mantener tus encías y dientes sanos. Recomendada cada 6 meses.',
      en: 'Professional removal of plaque and tartar to keep your gums and teeth healthy. Recommended every 6 months.',
    },
    category: 'preventive',
    duration: 45,
    priceRange: '50€ - 80€',
  },
  {
    slug: 'blanqueamiento-dental',
    name: { es: 'Blanqueamiento dental', en: 'Teeth Whitening' },
    description: {
      es: 'Tratamiento estético para aclarar el tono de tus dientes de forma segura y eficaz.',
      en: 'Cosmetic treatment to safely and effectively lighten the shade of your teeth.',
    },
    category: 'cosmetic',
    duration: 60,
    priceRange: '200€ - 400€',
  },
  {
    slug: 'ortodoncia',
    name: { es: 'Ortodoncia', en: 'Orthodontics' },
    description: {
      es: 'Corrección de la posición de los dientes y la mandíbula mediante brackets u otros aparatos.',
      en: 'Correction of teeth and jaw alignment using braces or other appliances.',
    },
    category: 'orthodontics',
    duration: 30,
    priceRange: '1.500€ - 4.000€',
  },
  {
    slug: 'ortodoncia-invisible',
    name: { es: 'Ortodoncia invisible', en: 'Invisible Orthodontics' },
    description: {
      es: 'Alineadores transparentes y removibles para corregir la posición dental de forma discreta.',
      en: 'Clear, removable aligners to discreetly correct dental alignment.',
    },
    category: 'orthodontics',
    duration: 30,
    priceRange: '2.000€ - 5.000€',
  },
  {
    slug: 'implantes-dentales',
    name: { es: 'Implantes dentales', en: 'Dental Implants' },
    description: {
      es: 'Sustitución de dientes perdidos mediante tornillos de titanio que se integran en el hueso maxilar.',
      en: 'Replacement of missing teeth using titanium screws that integrate into the jawbone.',
    },
    category: 'surgery',
    duration: 90,
    priceRange: '800€ - 2.500€',
  },
  {
    slug: 'endodoncia',
    name: { es: 'Endodoncia', en: 'Root Canal' },
    description: {
      es: 'Tratamiento del interior del diente para eliminar la infección y salvar la pieza dental.',
      en: 'Treatment of the inside of the tooth to remove infection and save the tooth.',
    },
    category: 'restorative',
    duration: 60,
    priceRange: '150€ - 350€',
  },
  {
    slug: 'carillas-dentales',
    name: { es: 'Carillas dentales', en: 'Dental Veneers' },
    description: {
      es: 'Finas láminas de porcelana o composite que se adhieren a la superficie del diente para mejorar su apariencia.',
      en: 'Thin porcelain or composite shells bonded to the tooth surface to improve appearance.',
    },
    category: 'cosmetic',
    duration: 60,
    priceRange: '300€ - 800€',
  },
  {
    slug: 'periodoncia',
    name: { es: 'Periodoncia', en: 'Periodontics' },
    description: {
      es: 'Tratamiento de las enfermedades de las encías y los tejidos que soportan los dientes.',
      en: 'Treatment of gum diseases and the tissues that support the teeth.',
    },
    category: 'preventive',
    duration: 45,
    priceRange: '100€ - 300€',
  },
  {
    slug: 'protesis-dental',
    name: { es: 'Prótesis dental', en: 'Dental Prosthesis' },
    description: {
      es: 'Restauración de dientes perdidos mediante prótesis fijas o removibles para recuperar la funcionalidad.',
      en: 'Restoration of missing teeth using fixed or removable prostheses to restore function.',
    },
    category: 'restorative',
    duration: 60,
    priceRange: '500€ - 2.000€',
  },
  {
    slug: 'odontopediatria',
    name: { es: 'Odontopediatría', en: 'Pediatric Dentistry' },
    description: {
      es: 'Atención dental especializada para bebés, niños y adolescentes en un entorno amigable.',
      en: 'Specialized dental care for babies, children, and adolescents in a friendly environment.',
    },
    category: 'pediatric',
    duration: 30,
    priceRange: '40€ - 120€',
  },
  {
    slug: 'cirugia-oral',
    name: { es: 'Cirugía oral', en: 'Oral Surgery' },
    description: {
      es: 'Procedimientos quirúrgicos en la cavidad oral, incluyendo extracciones complejas y cirugía de muelas del juicio.',
      en: 'Surgical procedures in the oral cavity, including complex extractions and wisdom teeth surgery.',
    },
    category: 'surgery',
    duration: 90,
    priceRange: '200€ - 600€',
  },
  {
    slug: 'estetica-dental',
    name: { es: 'Estética dental', en: 'Cosmetic Dentistry' },
    description: {
      es: 'Conjunto de tratamientos orientados a mejorar la apariencia de tu sonrisa.',
      en: 'A range of treatments aimed at improving the appearance of your smile.',
    },
    category: 'cosmetic',
    duration: 60,
    priceRange: '150€ - 1.000€',
  },
]
