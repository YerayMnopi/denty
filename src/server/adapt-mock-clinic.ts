import type { MockClinic, MockDoctor } from '@/data/mock'
import { ObjectId } from 'mongodb'

/**
 * Adapts raw MockClinic + MockDoctor data into the shape expected by
 * the website-generator functions (WebsiteGenerationContext).
 *
 * The generators expect:
 *   clinic.services  → Array<{ name: Record<string, string>; duration: number; price?: number }>
 *   clinic.address   → { street: string; city: string; zip: string }
 *   doctors[].specialization → Record<string, string>  (already correct in mock)
 */
export function adaptMockToGenerationContext(
  mockClinic: MockClinic,
  mockDoctors: MockDoctor[],
  website: any,
) {
  const addressParts = mockClinic.address.split(',').map((s: string) => s.trim())
  const streetPart = addressParts[0] || mockClinic.address
  const cityZipPart = addressParts[1] || ''
  const zipMatch = cityZipPart.match(/(\d{5})/)
  const zip = zipMatch ? zipMatch[1] : ''
  const city = cityZipPart.replace(/\d{5}/, '').trim() || mockClinic.city

  const clinicId = new ObjectId()

  const clinic = {
    _id: clinicId,
    slug: mockClinic.slug,
    name: mockClinic.name,
    description: mockClinic.description,
    address: { street: streetPart, city, zip },
    phone: mockClinic.phone,
    email: mockClinic.email,
    website: mockClinic.website,
    managementSystem: 'manual' as const,
    workingHours: mockClinic.workingHours,
    services: mockClinic.serviceDetails.map((sd) => ({
      name: sd.name,
      duration: sd.duration,
      price: Number.parseInt(sd.price.replace(/[^\d]/g, ''), 10) || undefined,
    })),
    adminEmail: mockClinic.email,
    adminPasswordHash: '',
    createdAt: new Date(),
    updatedAt: new Date(),
  }

  const doctors = mockDoctors.map((d) => ({
    _id: new ObjectId(),
    slug: d.slug,
    clinicId,
    name: d.name,
    specialization: d.specialization,
    bio: d.bio,
    photo: d.photo,
    schedule: d.schedule,
    services: d.services,
    createdAt: new Date(),
  }))

  const adaptedWebsite = {
    ...website,
    _id: new ObjectId(),
    clinicId,
  }

  return {
    website: adaptedWebsite,
    clinic,
    doctors,
  }
}
