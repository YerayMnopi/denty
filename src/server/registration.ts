import bcrypt from 'bcrypt'
import { ObjectId } from 'mongodb'
import {
  type Clinic,
  type Doctor,
  getClinicsCollection,
  getDoctorsCollection,
} from '@/lib/collections'
import { createTrial } from './trial'

export interface OnboardingData {
  clinicName: string
  email: string
  password: string
  phone: string
  address: string
  services: string[]
  workingHours: { day: number; open: string; close: string }[]
  doctors: { name: string; specialization: string }[]
}

export async function createClinicFromOnboarding(data: OnboardingData): Promise<{
  success: boolean
  clinicId?: ObjectId
  error?: string
}> {
  try {
    // Validate data
    const validation = validateOnboardingData(data)
    if (!validation.isValid) {
      return {
        success: false,
        error: validation.error,
      }
    }

    // Check if email already exists
    const clinicsCollection = await getClinicsCollection()
    const existingClinic = await clinicsCollection.findOne({ adminEmail: data.email })
    if (existingClinic) {
      return {
        success: false,
        error: 'Email already registered',
      }
    }

    // Hash password
    const passwordHash = await bcrypt.hash(data.password, 12)

    // Generate slug
    const slug = generateSlug(data.clinicName)

    // Create clinic
    const clinicId = new ObjectId()
    const now = new Date()

    // Parse address to extract city
    const addressParts = data.address.split(',').map((part) => part.trim())
    const city = addressParts.length > 1 ? addressParts[addressParts.length - 1] : 'Ciudad'

    // Convert services to the expected format
    const services = data.services.map((service) => ({
      name: {
        es: service,
        en: service, // For now, use same name for both languages
      },
      duration: 30, // Default duration
      price: 0, // Default price (to be set later)
    }))

    const clinic: Clinic = {
      _id: clinicId,
      slug,
      name: data.clinicName,
      description: {
        es: `${data.clinicName} - Tu clínica dental de confianza`,
        en: `${data.clinicName} - Your trusted dental clinic`,
      },
      address: {
        street: data.address,
        city,
        zip: '00000', // Default zip code
      },
      phone: data.phone,
      email: data.email,
      managementSystem: 'manual',
      workingHours: data.workingHours,
      services,
      adminEmail: data.email,
      adminPasswordHash: passwordHash,
      plan: 'starter', // Default plan
      onboardingComplete: true,
      createdAt: now,
      updatedAt: now,
    }

    // Create trial
    const trialResult = createTrial(30) // 30 days trial
    clinic.trialStartDate = trialResult.startDate
    clinic.trialEndDate = trialResult.endDate

    await clinicsCollection.insertOne(clinic)

    // Create doctors
    await createDoctorsFromOnboarding(clinicId, data.doctors, data.services)

    return {
      success: true,
      clinicId,
    }
  } catch (error) {
    console.error('Error creating clinic from onboarding:', error)
    return {
      success: false,
      error: 'Failed to create clinic',
    }
  }
}

async function createDoctorsFromOnboarding(
  clinicId: ObjectId,
  doctors: { name: string; specialization: string }[],
  services: string[],
): Promise<void> {
  try {
    const doctorsCollection = await getDoctorsCollection()
    const now = new Date()

    for (const doctorData of doctors) {
      const doctorSlug = generateSlug(doctorData.name)

      // Default schedule (Monday to Friday, 9:00-18:00)
      const defaultSchedule = [1, 2, 3, 4, 5].map((day) => ({
        day,
        startTime: '09:00',
        endTime: '18:00',
      }))

      const doctor: Doctor = {
        _id: new ObjectId(),
        slug: doctorSlug,
        clinicId,
        name: doctorData.name,
        specialization: {
          es: doctorData.specialization,
          en: doctorData.specialization,
        },
        bio: {
          es: `Dr./Dra. ${doctorData.name} es especialista en ${doctorData.specialization}`,
          en: `Dr. ${doctorData.name} specializes in ${doctorData.specialization}`,
        },
        schedule: defaultSchedule,
        services, // All clinic services by default
        createdAt: now,
      }

      await doctorsCollection.insertOne(doctor)
    }
  } catch (error) {
    console.error('Error creating doctors:', error)
    throw error
  }
}

export function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD') // Decompose accented characters
    .replace(/[\u0300-\u036f]/g, '') // Remove accent marks
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
    .trim()
    .replace(/^-|-$/g, '') // Remove leading/trailing hyphens
}

export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function validatePassword(password: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  if (password.length < 8) {
    errors.push('Password must be at least 8 characters long')
  }

  if (!/[A-Z]/.test(password)) {
    errors.push('Password must contain at least one uppercase letter')
  }

  if (!/[a-z]/.test(password)) {
    errors.push('Password must contain at least one lowercase letter')
  }

  if (!/\d/.test(password)) {
    errors.push('Password must contain at least one number')
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}

function validateOnboardingData(data: OnboardingData): {
  isValid: boolean
  error?: string
} {
  if (!data.clinicName?.trim()) {
    return { isValid: false, error: 'Clinic name is required' }
  }

  if (!validateEmail(data.email)) {
    return { isValid: false, error: 'Valid email is required' }
  }

  const passwordValidation = validatePassword(data.password)
  if (!passwordValidation.isValid) {
    return { isValid: false, error: passwordValidation.errors[0] }
  }

  if (!data.phone?.trim()) {
    return { isValid: false, error: 'Phone number is required' }
  }

  if (!data.address?.trim()) {
    return { isValid: false, error: 'Address is required' }
  }

  if (!data.services?.length) {
    return { isValid: false, error: 'At least one service is required' }
  }

  if (!data.workingHours?.length) {
    return { isValid: false, error: 'Working hours are required' }
  }

  if (!data.doctors?.length) {
    return { isValid: false, error: 'At least one doctor is required' }
  }

  return { isValid: true }
}
