import { createServerFn } from '@tanstack/react-start'
import { setCookie } from '@tanstack/react-start/server'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import { ObjectId } from 'mongodb'
import { getClinicsCollection } from '@/lib/collections'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret-change-me'

interface RegisterClinicData {
  clinicName: string
  ownerName: string
  email: string
  password: string
  phone: string
}

interface RegisterResult {
  success: boolean
  error?: string
  clinicId?: string
}

// Generate slug from clinic name
function generateSlug(name: string): string {
  return name
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
}

// Generate subdomain from clinic name
function generateSubdomain(name: string): string {
  const baseSlug = generateSlug(name)
  // Ensure it starts with a letter and is not too long
  let subdomain = baseSlug.substring(0, 30)
  if (!/^[a-z]/.test(subdomain)) {
    subdomain = `clinica-${subdomain}`
  }
  return subdomain
}

export const registerClinicFn = createServerFn({ method: 'POST' })
  .inputValidator((input: RegisterClinicData) => input)
  .handler(async ({ data }): Promise<RegisterResult> => {
    try {
      const clinicsCollection = await getClinicsCollection()

      // Check if email already exists
      const existingClinic = await clinicsCollection.findOne({
        adminEmail: data.email.toLowerCase(),
      })

      if (existingClinic) {
        return { success: false, error: 'Email already registered' }
      }

      // Generate slug and subdomain
      const slug = generateSlug(data.clinicName)
      const subdomain = generateSubdomain(data.clinicName)

      // Check if slug is already taken
      let finalSlug = slug
      let counter = 1
      while (await clinicsCollection.findOne({ slug: finalSlug })) {
        finalSlug = `${slug}-${counter}`
        counter++
      }

      // Check if subdomain is already taken
      let finalSubdomain = subdomain
      counter = 1
      // We need to check both clinics collection and a theoretical websites collection
      while (await clinicsCollection.findOne({ 'website.subdomain': finalSubdomain })) {
        finalSubdomain = `${subdomain}-${counter}`
        counter++
      }

      // Hash password
      const saltRounds = 10
      const passwordHash = await bcrypt.hash(data.password, saltRounds)

      // Create trial dates (30 days from now)
      const trialStartDate = new Date()
      const trialEndDate = new Date()
      trialEndDate.setDate(trialEndDate.getDate() + 30)

      // Create clinic
      const newClinic = {
        _id: new ObjectId(),
        slug: finalSlug,
        name: data.clinicName,
        description: {
          es: `Clínica dental ${data.clinicName}`,
          en: `${data.clinicName} Dental Clinic`,
        },
        address: {
          street: '',
          city: '',
          zip: '',
        },
        phone: data.phone,
        email: data.email.toLowerCase(),
        managementSystem: 'manual' as const,
        workingHours: [
          { day: 1, open: '09:00', close: '18:00' }, // Monday
          { day: 2, open: '09:00', close: '18:00' }, // Tuesday
          { day: 3, open: '09:00', close: '18:00' }, // Wednesday
          { day: 4, open: '09:00', close: '18:00' }, // Thursday
          { day: 5, open: '09:00', close: '18:00' }, // Friday
        ],
        services: [
          {
            name: { es: 'Limpieza dental', en: 'Dental cleaning' },
            duration: 45,
            price: 60,
          },
          {
            name: { es: 'Revisión', en: 'Check-up' },
            duration: 30,
            price: 40,
          },
          {
            name: { es: 'Empaste', en: 'Filling' },
            duration: 60,
            price: 80,
          },
        ],
        adminEmail: data.email.toLowerCase(),
        adminPasswordHash: passwordHash,
        plan: 'starter' as const,
        trialStartDate,
        trialEndDate,
        onboardingComplete: false,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      const result = await clinicsCollection.insertOne(newClinic)

      if (!result.insertedId) {
        return { success: false, error: 'Failed to create clinic' }
      }

      // Generate JWT token for auto-login
      const token = jwt.sign(
        {
          email: data.email.toLowerCase(),
          clinicSlug: finalSlug,
          clinicId: result.insertedId.toString(),
        },
        JWT_SECRET,
        { expiresIn: '24h' },
      )

      setCookie('admin_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24,
        path: '/',
      })

      return {
        success: true,
        clinicId: result.insertedId.toString(),
      }
    } catch (error) {
      console.error('Registration error:', error)
      return { success: false, error: 'Registration failed' }
    }
  })

export const checkEmailAvailableFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { email: string }) => input)
  .handler(async ({ data }): Promise<{ available: boolean }> => {
    try {
      const clinicsCollection = await getClinicsCollection()
      const existing = await clinicsCollection.findOne({
        adminEmail: data.email.toLowerCase(),
      })
      return { available: !existing }
    } catch {
      return { available: false }
    }
  })

export const checkSubdomainAvailableFn = createServerFn({ method: 'POST' })
  .inputValidator((input: { subdomain: string }) => input)
  .handler(async ({ data }): Promise<{ available: boolean }> => {
    try {
      const clinicsCollection = await getClinicsCollection()
      const existing = await clinicsCollection.findOne({
        'website.subdomain': data.subdomain.toLowerCase(),
      })
      return { available: !existing }
    } catch {
      return { available: false }
    }
  })
