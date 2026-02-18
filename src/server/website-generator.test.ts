import { describe, expect, it } from 'vitest'
import { ObjectId } from 'mongodb'
import {
  generateSchemaMarkup,
  generateHomepage,
  generateServicesPage,
  generateTeamPage,
  generateContactPage,
  type WebsiteGenerationContext
} from './website-generator'
import type { Clinic, Doctor, Website } from '@/lib/collections'

describe('Website Generator', () => {
  const mockClinic: Clinic = {
    _id: new ObjectId(),
    slug: 'test-clinic',
    name: 'Test Dental Clinic',
    description: {
      en: 'Professional dental care in the heart of the city',
      es: 'Cuidado dental profesional en el corazón de la ciudad'
    },
    address: {
      street: '123 Main Street',
      city: 'Madrid',
      zip: '28001',
      coordinates: [-3.7038, 40.4168]
    },
    phone: '+34 911 234 567',
    email: 'info@testclinic.com',
    website: 'https://testclinic.com',
    logo: '/logo.png',
    managementSystem: 'manual',
    workingHours: [
      { day: 1, open: '09:00', close: '17:00' },
      { day: 2, open: '09:00', close: '17:00' },
      { day: 3, open: '09:00', close: '17:00' },
      { day: 4, open: '09:00', close: '17:00' },
      { day: 5, open: '09:00', close: '14:00' }
    ],
    services: [
      {
        name: { en: 'Dental Cleaning', es: 'Limpieza Dental' },
        duration: 30,
        price: 60
      },
      {
        name: { en: 'Dental Implants', es: 'Implantes Dentales' },
        duration: 120,
        price: 1500
      }
    ],
    adminEmail: 'admin@testclinic.com',
    adminPasswordHash: 'hash',
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockDoctors: Doctor[] = [
    {
      _id: new ObjectId(),
      slug: 'dr-garcia',
      clinicId: mockClinic._id,
      name: 'Dr. María García',
      specialization: {
        en: 'General Dentistry',
        es: 'Odontología General'
      },
      bio: {
        en: 'Experienced dentist with 10+ years in practice',
        es: 'Dentista experimentada con más de 10 años de práctica'
      },
      photo: '/photos/dr-garcia.jpg',
      schedule: [
        { day: 1, startTime: '09:00', endTime: '17:00' },
        { day: 2, startTime: '09:00', endTime: '17:00' }
      ],
      services: ['Dental Cleaning', 'Dental Implants'],
      createdAt: new Date()
    }
  ]

  const mockWebsite: Website = {
    _id: new ObjectId(),
    clinicId: mockClinic._id,
    subdomain: 'test-clinic',
    settings: {
      name: {
        en: 'Test Dental Clinic',
        es: 'Clínica Dental de Prueba'
      },
      theme: {
        primaryColor: '#2563eb',
        secondaryColor: '#06b6d4'
      },
      pages: {
        homepage: true,
        services: true,
        team: true,
        contact: true,
        blog: true
      },
      seo: {
        title: {
          en: 'Test Dental Clinic - Professional Dental Care',
          es: 'Clínica Dental de Prueba - Cuidado Dental Profesional'
        },
        description: {
          en: 'Expert dental care in Madrid with modern technology',
          es: 'Cuidado dental experto en Madrid con tecnología moderna'
        },
        keywords: ['dentist', 'dental clinic', 'Madrid', 'teeth cleaning']
      }
    },
    content: {
      homepage: {
        hero: {
          en: 'Your Smile, Our Priority',
          es: 'Tu Sonrisa, Nuestra Prioridad'
        },
        about: {
          en: 'We provide comprehensive dental care with the latest technology',
          es: 'Proporcionamos cuidado dental integral con la última tecnología'
        },
        callToAction: {
          en: 'Book Your Appointment',
          es: 'Reserva Tu Cita'
        }
      },
      services: {
        title: {
          en: 'Our Services',
          es: 'Nuestros Servicios'
        },
        description: {
          en: 'Comprehensive dental services for all your needs',
          es: 'Servicios dentales integrales para todas tus necesidades'
        }
      },
      team: {
        title: {
          en: 'Meet Our Team',
          es: 'Conoce Nuestro Equipo'
        },
        description: {
          en: 'Our experienced dental professionals',
          es: 'Nuestros profesionales dentales experimentados'
        }
      },
      contact: {
        title: {
          en: 'Contact Us',
          es: 'Contáctanos'
        },
        description: {
          en: 'Get in touch with our friendly team',
          es: 'Ponte en contacto con nuestro equipo amigable'
        }
      }
    },
    createdAt: new Date(),
    updatedAt: new Date()
  }

  const mockContext: WebsiteGenerationContext = {
    website: mockWebsite,
    clinic: mockClinic,
    doctors: mockDoctors
  }

  describe('generateSchemaMarkup', () => {
    it('should generate LocalBusiness schema markup with correct structure', () => {
      const schemas = generateSchemaMarkup(mockContext)
      
      expect(schemas.localBusiness).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: mockClinic.name,
        telephone: mockClinic.phone,
        email: mockClinic.email,
        address: {
          '@type': 'PostalAddress',
          streetAddress: mockClinic.address.street,
          addressLocality: mockClinic.address.city,
          postalCode: mockClinic.address.zip
        }
      })
    })

    it('should include geo coordinates when available', () => {
      const schemas = generateSchemaMarkup(mockContext)
      
      expect((schemas.localBusiness as any).geo).toEqual({
        '@type': 'GeoCoordinates',
        latitude: 40.4168,
        longitude: -3.7038
      })
    })

    it('should format opening hours correctly', () => {
      const schemas = generateSchemaMarkup(mockContext)
      
      expect(Array.isArray((schemas.localBusiness as any).openingHours)).toBe(true)
      expect((schemas.localBusiness as any).openingHours).toContain('Monday 09:00-17:00')
      expect((schemas.localBusiness as any).openingHours).toContain('Friday 09:00-14:00')
    })

    it('should generate Dentist schema with services catalog', () => {
      const schemas = generateSchemaMarkup(mockContext)
      
      expect(schemas.dentist).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'Dentist',
        name: mockClinic.name,
        hasOfferCatalog: {
          '@type': 'OfferCatalog',
          name: 'Dental Services',
          itemListElement: expect.arrayContaining([
            expect.objectContaining({
              '@type': 'Offer',
              name: 'Dental Cleaning',
              price: 60,
              priceCurrency: 'EUR'
            })
          ])
        }
      })
    })

    it('should generate MedicalOrganization schema with dental specialty', () => {
      const schemas = generateSchemaMarkup(mockContext)
      
      expect(schemas.medicalOrganization).toMatchObject({
        '@context': 'https://schema.org',
        '@type': 'MedicalOrganization',
        name: mockClinic.name,
        medicalSpecialty: 'Dentistry'
      })
    })

    it('should handle missing coordinates gracefully', () => {
      const contextWithoutCoordinates = {
        ...mockContext,
        clinic: {
          ...mockClinic,
          address: {
            ...mockClinic.address,
            coordinates: undefined
          }
        }
      }

      const schemas = generateSchemaMarkup(contextWithoutCoordinates)
      expect((schemas.localBusiness as any).geo).toBeUndefined()
    })
  })

  describe('generateHomepage', () => {
    it('should generate homepage content in English', () => {
      const pageData = generateHomepage(mockContext, 'en')
      
      expect(pageData.title).toBe(mockWebsite.settings.seo.title.en)
      expect(pageData.description).toBe(mockWebsite.settings.seo.description.en)
      expect(pageData.keywords).toEqual(mockWebsite.settings.seo.keywords)
      expect(pageData.content).toContain(mockWebsite.content.homepage.hero.en)
      expect(pageData.content).toContain(mockWebsite.content.homepage.about.en)
      expect(pageData.schemaMarkup).toBeDefined()
    })

    it('should generate homepage content in Spanish', () => {
      const pageData = generateHomepage(mockContext, 'es')
      
      expect(pageData.content).toContain(mockWebsite.content.homepage.hero.es)
      expect(pageData.content).toContain(mockWebsite.content.homepage.about.es)
      expect(pageData.content).toContain(mockWebsite.content.homepage.callToAction.es)
    })

    it('should include services preview with pricing', () => {
      const pageData = generateHomepage(mockContext, 'en')
      
      expect(pageData.content).toContain('Dental Cleaning')
      expect(pageData.content).toContain('30 minutes')
      expect(pageData.content).toContain('€60')
      expect(pageData.content).toContain('Dental Implants')
      expect(pageData.content).toContain('€1500')
    })

    it('should include doctors preview', () => {
      const pageData = generateHomepage(mockContext, 'en')
      
      expect(pageData.content).toContain('Dr. María García')
      expect(pageData.content).toContain('General Dentistry')
    })

    it('should include contact information', () => {
      const pageData = generateHomepage(mockContext, 'en')
      
      expect(pageData.content).toContain(mockClinic.phone)
      expect(pageData.content).toContain(mockClinic.email)
      expect(pageData.content).toContain(mockClinic.address.street)
      expect(pageData.content).toContain(mockClinic.address.city)
    })

    it('should default to clinic name when language not available', () => {
      const pageData = generateHomepage(mockContext, 'fr') // Unsupported language
      
      // Should fallback to default content with clinic name
      expect(pageData.content).toContain(`Welcome to ${mockClinic.name}`)
    })
  })

  describe('generateServicesPage', () => {
    it('should generate services page with all service details', () => {
      const pageData = generateServicesPage(mockContext, 'en')
      
      expect(pageData.title).toContain('Our Services')
      expect(pageData.content).toContain('Dental Cleaning')
      expect(pageData.content).toContain('Dental Implants')
      expect(pageData.content).toContain('Duration: 30 minutes')
      expect(pageData.content).toContain('From €60')
      expect(pageData.content).toContain('Duration: 120 minutes')
      expect(pageData.content).toContain('From €1500')
    })

    it('should include booking links with encoded service names', () => {
      const pageData = generateServicesPage(mockContext, 'en')
      
      expect(pageData.content).toContain('service=Dental%20Cleaning')
      expect(pageData.content).toContain('service=Dental%20Implants')
    })

    it('should include call-to-action elements', () => {
      const pageData = generateServicesPage(mockContext, 'en')
      
      expect(pageData.content).toContain('Book Now')
      expect(pageData.content).toContain('Book Appointment')
    })

    it('should handle services without pricing', () => {
      const contextWithoutPricing = {
        ...mockContext,
        clinic: {
          ...mockClinic,
          services: [
            { name: { en: 'Consultation', es: 'Consulta' }, duration: 30, price: undefined }
          ]
        }
      }

      const pageData = generateServicesPage(contextWithoutPricing, 'en')
      
      expect(pageData.content).toContain('Consultation')
      expect(pageData.content).toContain('Duration: 30 minutes')
      expect(pageData.content).not.toContain('From €')
    })
  })

  describe('generateTeamPage', () => {
    it('should generate team page with doctor profiles', () => {
      const pageData = generateTeamPage(mockContext, 'en')
      
      expect(pageData.title).toContain('Our Team')
      expect(pageData.content).toContain('Dr. María García')
      expect(pageData.content).toContain('General Dentistry')
      expect(pageData.content).toContain('Experienced dentist')
    })

    it('should include doctor photos when available', () => {
      const pageData = generateTeamPage(mockContext, 'en')
      
      expect(pageData.content).toContain('/photos/dr-garcia.jpg')
      expect(pageData.content).toContain('alt="Dr. María García"')
    })

    it('should list doctor services', () => {
      const pageData = generateTeamPage(mockContext, 'en')
      
      expect(pageData.content).toContain('Specializes in:')
      expect(pageData.content).toContain('Dental Cleaning')
      expect(pageData.content).toContain('Dental Implants')
    })

    it('should include booking links for specific doctors', () => {
      const pageData = generateTeamPage(mockContext, 'en')
      
      expect(pageData.content).toContain('doctor=dr-garcia')
      expect(pageData.content).toContain('Book with Dr. María García')
    })

    it('should handle doctors without photos', () => {
      const contextWithoutPhotos = {
        ...mockContext,
        doctors: [{
          ...mockDoctors[0],
          photo: undefined
        }]
      }

      const pageData = generateTeamPage(contextWithoutPhotos, 'en')
      
      expect(pageData.content).toContain('Dr. María García')
      expect(pageData.content).not.toContain('<img src=')
    })
  })

  describe('generateContactPage', () => {
    it('should generate contact page with all contact information', () => {
      const pageData = generateContactPage(mockContext, 'en')
      
      expect(pageData.title).toContain('Contact')
      expect(pageData.content).toContain(mockClinic.phone)
      expect(pageData.content).toContain(mockClinic.email)
      expect(pageData.content).toContain(mockClinic.address.street)
      expect(pageData.content).toContain(mockClinic.address.city)
      expect(pageData.content).toContain(mockClinic.address.zip)
    })

    it('should include working hours', () => {
      const pageData = generateContactPage(mockContext, 'en')
      
      expect(pageData.content).toContain('Working Hours')
      expect(pageData.content).toContain('Monday: 09:00 - 17:00')
      expect(pageData.content).toContain('Friday: 09:00 - 14:00')
    })

    it('should include multiple contact methods', () => {
      const pageData = generateContactPage(mockContext, 'en')
      
      expect(pageData.content).toContain('Book Online')
      expect(pageData.content).toContain('Call Now')
      expect(pageData.content).toContain('WhatsApp')
      expect(pageData.content).toContain('wa.me/')
    })

    it('should format phone number correctly for WhatsApp', () => {
      const pageData = generateContactPage(mockContext, 'en')
      
      // Should strip non-numeric characters from phone number
      expect(pageData.content).toContain('wa.me/34911234567')
    })

    it('should include map section when coordinates are available', () => {
      const pageData = generateContactPage(mockContext, 'en')
      
      expect(pageData.content).toContain('Find Us')
      expect(pageData.content).toContain('Map showing location')
    })

    it('should handle missing coordinates gracefully', () => {
      const contextWithoutCoordinates = {
        ...mockContext,
        clinic: {
          ...mockClinic,
          address: {
            ...mockClinic.address,
            coordinates: undefined
          }
        }
      }

      const pageData = generateContactPage(contextWithoutCoordinates, 'en')
      
      expect(pageData.content).toContain('Contact')
      expect(pageData.content).not.toContain('Find Us')
    })
  })

  describe('language fallback logic', () => {
    it('should fallback to available language when preferred not available', () => {
      const contextWithMissingTranslations = {
        ...mockContext,
        website: {
          ...mockWebsite,
          content: {
            ...mockWebsite.content,
            homepage: {
              hero: { en: 'English only' },
              about: { es: 'Solo español' },
              callToAction: { en: 'Book now', es: 'Reservar' }
            }
          }
        }
      }

      const pageDataEn = generateHomepage(contextWithMissingTranslations, 'en')
      const pageDataEs = generateHomepage(contextWithMissingTranslations, 'es')

      expect(pageDataEn.content).toContain('English only')
      expect(pageDataEs.content).toContain('Solo español')
    })

    it('should handle empty content gracefully', () => {
      const contextWithEmptyServices = {
        ...mockContext,
        clinic: {
          ...mockClinic,
          services: []
        }
      }

      const pageData = generateServicesPage(contextWithEmptyServices, 'en')
      
      expect(pageData.content).toBeTruthy()
      expect(pageData.title).toContain('Our Services')
    })

    it('should handle empty doctors list', () => {
      const contextWithoutDoctors = {
        ...mockContext,
        doctors: []
      }

      const pageData = generateTeamPage(contextWithoutDoctors, 'en')
      
      expect(pageData.content).toBeTruthy()
      expect(pageData.title).toContain('Our Team')
    })
  })
})