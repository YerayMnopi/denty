import { describe, it, expect } from 'vitest'
import { mockClinics, mockDoctors, mockTreatments } from './mock'

describe('mock data', () => {
  describe('mockClinics', () => {
    it('has at least one clinic', () => {
      expect(mockClinics.length).toBeGreaterThan(0)
    })

    it('each clinic has required fields', () => {
      for (const clinic of mockClinics) {
        expect(clinic.slug).toBeTruthy()
        expect(clinic.name).toBeTruthy()
        expect(clinic.city).toBeTruthy()
        expect(clinic.services.length).toBeGreaterThan(0)
        expect(clinic.description.es).toBeTruthy()
        expect(clinic.description.en).toBeTruthy()
      }
    })

    it('slugs are unique', () => {
      const slugs = mockClinics.map((c) => c.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })
  })

  describe('mockDoctors', () => {
    it('has at least one doctor', () => {
      expect(mockDoctors.length).toBeGreaterThan(0)
    })

    it('each doctor references a valid clinic', () => {
      const clinicSlugs = new Set(mockClinics.map((c) => c.slug))
      for (const doctor of mockDoctors) {
        expect(clinicSlugs.has(doctor.clinicSlug)).toBe(true)
      }
    })
  })

  describe('mockTreatments', () => {
    it('has at least one treatment', () => {
      expect(mockTreatments.length).toBeGreaterThan(0)
    })

    it('each treatment has positive duration', () => {
      for (const treatment of mockTreatments) {
        expect(treatment.duration).toBeGreaterThan(0)
      }
    })

    it('slugs are unique', () => {
      const slugs = mockTreatments.map((t) => t.slug)
      expect(new Set(slugs).size).toBe(slugs.length)
    })
  })
})
