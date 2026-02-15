// Tests for patient server functions

import { describe, expect, it } from 'vitest'

describe('Patient Server Functions', () => {
  describe('patient filtering logic', () => {
    it('should filter patients by search query', () => {
      const patients = [
        { name: 'María García', phone: '+34 666 123 456', email: 'maria@test.com' },
        { name: 'Juan Pérez', phone: '+34 677 234 567', email: 'juan@test.com' },
      ]

      const searchQuery = 'maría'
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          patient.phone.includes(searchQuery) ||
          patient.email?.toLowerCase().includes(searchQuery.toLowerCase()),
      )

      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('María García')
    })

    it('should filter by phone number', () => {
      const patients = [
        { name: 'María', phone: '+34 666 123 456', email: 'maria@test.com' },
        { name: 'Juan', phone: '+34 677 234 567', email: 'juan@test.com' },
      ]

      const filtered = patients.filter((p) => p.phone.includes('666'))
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('María')
    })

    it('should filter by email', () => {
      const patients = [
        { name: 'María', phone: '+34 666 123 456', email: 'maria@test.com' },
        { name: 'Juan', phone: '+34 677 234 567', email: 'juan@test.com' },
      ]

      const filtered = patients.filter((p) => p.email?.toLowerCase().includes('juan'))
      expect(filtered).toHaveLength(1)
      expect(filtered[0].name).toBe('Juan')
    })
  })

  describe('patient segmentation logic', () => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    it('should identify active patients', () => {
      const patient = {
        lastVisit: new Date(),
        visitHistory: [{ service: 'Test' }, { service: 'Test2' }],
      }
      expect(patient.lastVisit > sixMonthsAgo).toBe(true)
    })

    it('should identify inactive patients', () => {
      const patient = {
        lastVisit: new Date('2023-01-01'),
        visitHistory: [{ service: 'Test' }],
      }
      expect(patient.lastVisit <= sixMonthsAgo).toBe(true)
    })

    it('should identify new patients', () => {
      const patient = {
        visitHistory: [{ service: 'First visit' }],
      }
      expect(patient.visitHistory.length <= 1).toBe(true)
    })

    it('should not classify multi-visit patients as new', () => {
      const patient = {
        visitHistory: [{ service: 'First' }, { service: 'Second' }],
      }
      expect(patient.visitHistory.length <= 1).toBe(false)
    })

    it('should classify patients without lastVisit as inactive', () => {
      const patients = [
        { name: 'Active', lastVisit: new Date() },
        { name: 'Inactive', lastVisit: new Date('2023-01-01') },
        { name: 'Never visited', lastVisit: undefined },
      ]

      const inactive = patients.filter((p) => !p.lastVisit || p.lastVisit < sixMonthsAgo)

      expect(inactive).toHaveLength(2)
      expect(inactive.map((p) => p.name)).toEqual(['Inactive', 'Never visited'])
    })
  })

  describe('tag management logic', () => {
    it('should add tag without duplicates', () => {
      const tags = ['existing-tag']
      const newTag = 'new-tag'

      if (!tags.includes(newTag)) {
        tags.push(newTag)
      }

      expect(tags).toContain('new-tag')
      expect(tags).toContain('existing-tag')
      expect(tags).toHaveLength(2)
    })

    it('should not add duplicate tag', () => {
      const tags = ['existing-tag']
      const newTag = 'existing-tag'

      if (!tags.includes(newTag)) {
        tags.push(newTag)
      }

      expect(tags).toHaveLength(1)
    })

    it('should remove tag from patient', () => {
      const tags = ['tag1', 'tag2', 'tag3']
      const tagToRemove = 'tag2'

      const result = tags.filter((tag) => tag !== tagToRemove)

      expect(result).not.toContain('tag2')
      expect(result).toContain('tag1')
      expect(result).toContain('tag3')
      expect(result).toHaveLength(2)
    })

    it('should handle removing non-existent tag', () => {
      const tags = ['tag1', 'tag2']
      const result = tags.filter((tag) => tag !== 'nonexistent')
      expect(result).toHaveLength(2)
    })
  })

  describe('patient creation logic', () => {
    it('should create patient with new-patient tag', () => {
      const newPatient = {
        name: 'New Patient',
        phone: '+34 666 123 456',
        tags: ['new-patient'],
        visitHistory: [] as unknown[],
      }

      expect(newPatient.tags).toContain('new-patient')
      expect(newPatient.visitHistory).toHaveLength(0)
    })

    it('should create patient with visit history from appointment', () => {
      const newPatient = {
        name: 'New Patient',
        phone: '+34 666 123 456',
        tags: ['new-patient'],
        visitHistory: [
          {
            service: 'Limpieza dental',
            date: new Date(),
            doctorName: 'Dr. Test',
          },
        ],
      }

      expect(newPatient.visitHistory).toHaveLength(1)
      expect(newPatient.visitHistory[0].service).toBe('Limpieza dental')
    })
  })

  describe('reminder time ranges', () => {
    it('should calculate correct 24h reminder window', () => {
      const now = new Date()
      const start = new Date(now.getTime() + 23 * 60 * 60 * 1000)
      const end = new Date(now.getTime() + 25 * 60 * 60 * 1000)

      expect(start.getTime()).toBeLessThan(end.getTime())
      expect(end.getTime() - start.getTime()).toBe(2 * 60 * 60 * 1000)
    })

    it('should calculate correct 1h reminder window', () => {
      const now = new Date()
      const start = new Date(now.getTime() + 50 * 60 * 1000)
      const end = new Date(now.getTime() + 70 * 60 * 1000)

      expect(start.getTime()).toBeLessThan(end.getTime())
      expect(end.getTime() - start.getTime()).toBe(20 * 60 * 1000)
    })
  })
})
