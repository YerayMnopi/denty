// Mock data for registration and onboarding tests

export const mockRegistrationData = {
  valid: {
    clinicName: 'Clínica Dental Sonrisa',
    ownerName: 'Dr. Juan García',
    email: 'admin@clinicasonrisa.com',
    password: 'SecurePass123!',
    phone: '+34 666 777 888',
  },

  invalid: {
    emptyFields: {
      clinicName: '',
      ownerName: '',
      email: '',
      password: '',
      phone: '',
    },

    invalidEmail: {
      clinicName: 'Clínica Test',
      ownerName: 'Dr. Test',
      email: 'invalid-email',
      password: 'password123',
      phone: '+34 600 000 000',
    },

    weakPassword: {
      clinicName: 'Clínica Test',
      ownerName: 'Dr. Test',
      email: 'test@test.com',
      password: '123',
      phone: '+34 600 000 000',
    },

    invalidPhone: {
      clinicName: 'Clínica Test',
      ownerName: 'Dr. Test',
      email: 'test@test.com',
      password: 'password123',
      phone: 'invalid-phone',
    },
  },
}

export const mockOnboardingData = {
  address: {
    complete: 'Calle Gran Vía 42, Madrid, 28013',
    incomplete: 'Calle Gran Vía 42',
    invalid: '',
  },

  services: {
    basic: 'Limpiezas, Empastes, Revisiones',
    advanced: 'Limpiezas, Empastes, Revisiones, Ortodoncia, Blanqueamiento, Implantes',
    single: 'Limpiezas',
    empty: '',
  },

  workingHours: {
    standard: 'De 9:00 a 18:00 de lunes a viernes',
    extended: 'De 8:00 a 20:00 de lunes a viernes, sábados de 9:00 a 14:00',
    minimal: '9 a 18 lunes a viernes',
    invalid: '',
  },

  doctors: {
    single: 'Dr. García',
    multiple: 'Dr. García, Dra. Martínez, Dr. López',
    withSpecialties: 'Dr. García (Ortodoncista), Dra. Martínez (Endodoncista)',
    empty: '',
  },

  logo: {
    hasLogo: 'Sí, tenemos logo',
    noLogo: 'No tenemos logo aún',
    willUploadLater: 'Lo subiré después',
  },
}

export const mockTrialData = {
  activeTrail: {
    startDate: new Date(),
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
    plan: 'starter' as const,
  },

  expiredTrial: {
    startDate: new Date(Date.now() - 31 * 24 * 60 * 60 * 1000), // 31 days ago
    endDate: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
    plan: 'starter' as const,
  },

  expiringSoon: {
    startDate: new Date(Date.now() - 28 * 24 * 60 * 60 * 1000), // 28 days ago
    endDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
    plan: 'professional' as const,
  },
}

export const mockSubdomains = {
  available: ['clinica-dental-nueva', 'dentista-madrid-centro', 'sonrisa-perfecta-2024'],

  taken: ['clinica-dental-sonrisa', 'dentista-madrid', 'clinica-test'],
}

export const mockEmails = {
  available: ['admin@nuevaclinica.com', 'director@dentistamadrid.es', 'info@sonrisaperfecta.com'],

  taken: ['admin@sonrisa.com', 'test@test.com', 'admin@clinicatest.com'],
}

export const expectedSlugs = {
  'Clínica Dental Sonrisa': 'clinica-dental-sonrisa',
  'CLÍNICA MÉDICA LÓPEZ': 'clinica-medica-lopez',
  'Dentes & Salud': 'dentes-salud',
  'Clínica 123!@#': 'clinica-123',
  'Multiple   Spaces': 'multiple-spaces',
  'áéíóú ÀÈÌÒÙ': 'aeiou-aeiou',
}

export const expectedSubdomains = {
  'Clínica Dental Sonrisa': 'clinica-dental-sonrisa',
  'CENTRO ODONTOLÓGICO': 'centro-odontologico',
  '123 Dental': 'clinica-123-dental', // Should start with letter
  'Very Long Clinic Name That Exceeds Thirty Characters': 'very-long-clinic-name-that-exc',
}
