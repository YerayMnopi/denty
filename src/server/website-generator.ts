import { ObjectId } from 'mongodb'
import type { Clinic, Doctor, Website, BlogPost } from '@/lib/collections'
import { getClinicsCollection, getDoctorsCollection, getWebsitesCollection } from '@/lib/collections'

// ─── Types ───────────────────────────────────────────────

export interface GeneratedPageData {
  title: string
  description: string
  keywords: string[]
  content: string
  schemaMarkup?: object
}

export interface WebsiteGenerationContext {
  website: Website
  clinic: Clinic
  doctors: Doctor[]
  blogPosts?: BlogPost[]
}

// ─── SEO Schema Markup ───────────────────────────────────

export function generateSchemaMarkup(context: WebsiteGenerationContext): {
  localBusiness: object
  dentist: object
  medicalOrganization: object
} {
  const { clinic, doctors } = context

  const localBusiness = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `https://${context.website.domain || context.website.subdomain + '.denty.es'}`,
    name: clinic.name,
    description: clinic.description.en || clinic.description.es,
    url: `https://${context.website.domain || context.website.subdomain + '.denty.es'}`,
    telephone: clinic.phone,
    email: clinic.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: clinic.address.street,
      addressLocality: clinic.address.city,
      postalCode: clinic.address.zip,
    },
    geo: clinic.address.coordinates ? {
      '@type': 'GeoCoordinates',
      latitude: clinic.address.coordinates[1],
      longitude: clinic.address.coordinates[0],
    } : undefined,
    openingHours: clinic.workingHours.map(wh => {
      const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
      return `${days[wh.day]} ${wh.open}-${wh.close}`
    }),
    priceRange: '$',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '127'
    }
  }

  const dentist = {
    '@context': 'https://schema.org',
    '@type': 'Dentist',
    name: clinic.name,
    address: localBusiness.address,
    telephone: clinic.phone,
    url: localBusiness.url,
    openingHours: localBusiness.openingHours,
    hasOfferCatalog: {
      '@type': 'OfferCatalog',
      name: 'Dental Services',
      itemListElement: clinic.services.map((service, index) => ({
        '@type': 'Offer',
        position: index + 1,
        name: service.name.en || service.name.es,
        description: `Professional ${service.name.en || service.name.es} service`,
        price: service.price,
        priceCurrency: 'EUR',
      }))
    }
  }

  const medicalOrganization = {
    '@context': 'https://schema.org',
    '@type': 'MedicalOrganization',
    '@id': localBusiness['@id'],
    name: clinic.name,
    url: localBusiness.url,
    telephone: clinic.phone,
    address: localBusiness.address,
    medicalSpecialty: 'Dentistry',
    hasCredential: {
      '@type': 'EducationalOccupationalCredential',
      credentialCategory: 'Professional License',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Spanish Dental Council'
      }
    }
  }

  return { localBusiness, dentist, medicalOrganization }
}

// ─── Page Generators ─────────────────────────────────────

export function generateHomepage(context: WebsiteGenerationContext, language: string = 'en'): GeneratedPageData {
  const { website, clinic, doctors } = context
  const lang = language as 'en' | 'es'
  
  const seoTitle = website.settings.seo.title[lang] || clinic.name
  const seoDescription = website.settings.seo.description[lang] || clinic.description[lang]
  
  const heroContent = website.content.homepage.hero[lang] || `Welcome to ${clinic.name}`
  const aboutContent = website.content.homepage.about[lang] || clinic.description[lang]
  const ctaContent = website.content.homepage.callToAction[lang] || 'Book Your Appointment Today'

  const content = `
    <div class="hero-section">
      <h1>${heroContent}</h1>
      <p class="hero-subtitle">${seoDescription}</p>
      <div class="cta-buttons">
        <a href="/book" class="btn btn-primary">${ctaContent}</a>
        <a href="/services" class="btn btn-secondary">Our Services</a>
      </div>
    </div>
    
    <div class="about-section">
      <h2>About ${clinic.name}</h2>
      <p>${aboutContent}</p>
    </div>
    
    <div class="services-preview">
      <h2>Our Services</h2>
      <div class="services-grid">
        ${clinic.services.map(service => `
          <div class="service-card">
            <h3>${service.name[lang] || service.name.en || service.name.es}</h3>
            <p>Duration: ${service.duration} minutes</p>
            ${service.price ? `<p>From €${service.price}</p>` : ''}
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="doctors-preview">
      <h2>Our Team</h2>
      <div class="doctors-grid">
        ${doctors.map(doctor => `
          <div class="doctor-card">
            ${doctor.photo ? `<img src="${doctor.photo}" alt="${doctor.name}" />` : ''}
            <h3>${doctor.name}</h3>
            <p>${doctor.specialization[lang] || doctor.specialization.en || doctor.specialization.es}</p>
          </div>
        `).join('')}
      </div>
    </div>
    
    <div class="contact-section">
      <h2>Contact Us</h2>
      <div class="contact-info">
        <p><strong>Phone:</strong> ${clinic.phone}</p>
        <p><strong>Email:</strong> ${clinic.email}</p>
        <p><strong>Address:</strong> ${clinic.address.street}, ${clinic.address.city} ${clinic.address.zip}</p>
      </div>
    </div>
  `

  const schemaMarkup = generateSchemaMarkup(context)

  return {
    title: seoTitle,
    description: seoDescription,
    keywords: website.settings.seo.keywords,
    content,
    schemaMarkup: schemaMarkup.localBusiness
  }
}

export function generateServicesPage(context: WebsiteGenerationContext, language: string = 'en'): GeneratedPageData {
  const { website, clinic } = context
  const lang = language as 'en' | 'es'
  
  const pageTitle = website.content.services.title[lang] || 'Our Services'
  const pageDescription = website.content.services.description[lang] || `Comprehensive dental services at ${clinic.name}`
  
  const content = `
    <div class="services-page">
      <h1>${pageTitle}</h1>
      <p class="page-description">${pageDescription}</p>
      
      <div class="services-list">
        ${clinic.services.map(service => `
          <div class="service-detail">
            <h2>${service.name[lang] || service.name.en || service.name.es}</h2>
            <div class="service-meta">
              <span class="duration">Duration: ${service.duration} minutes</span>
              ${service.price ? `<span class="price">From €${service.price}</span>` : ''}
            </div>
            <div class="service-actions">
              <a href="/book?service=${encodeURIComponent(service.name[lang] || service.name.en || service.name.es)}" class="btn btn-primary">Book Now</a>
            </div>
          </div>
        `).join('')}
      </div>
      
      <div class="services-cta">
        <h2>Ready to Book?</h2>
        <p>Choose your preferred service and schedule your appointment today.</p>
        <a href="/book" class="btn btn-primary">Book Appointment</a>
      </div>
    </div>
  `

  const schemaMarkup = generateSchemaMarkup(context)

  return {
    title: `${pageTitle} | ${clinic.name}`,
    description: pageDescription,
    keywords: [...website.settings.seo.keywords, 'dental services', 'dentist services'],
    content,
    schemaMarkup: schemaMarkup.dentist
  }
}

export function generateTeamPage(context: WebsiteGenerationContext, language: string = 'en'): GeneratedPageData {
  const { website, clinic, doctors } = context
  const lang = language as 'en' | 'es'
  
  const pageTitle = website.content.team.title[lang] || 'Our Team'
  const pageDescription = website.content.team.description[lang] || `Meet the professional team at ${clinic.name}`
  
  const content = `
    <div class="team-page">
      <h1>${pageTitle}</h1>
      <p class="page-description">${pageDescription}</p>
      
      <div class="doctors-grid">
        ${doctors.map(doctor => `
          <div class="doctor-profile">
            ${doctor.photo ? `<img src="${doctor.photo}" alt="${doctor.name}" class="doctor-photo" />` : ''}
            <h2>${doctor.name}</h2>
            <p class="specialization">${doctor.specialization[lang] || doctor.specialization.en || doctor.specialization.es}</p>
            <div class="doctor-bio">
              ${doctor.bio[lang] || doctor.bio.en || doctor.bio.es || ''}
            </div>
            <div class="doctor-services">
              <h3>Specializes in:</h3>
              <ul>
                ${doctor.services.map(serviceId => {
                  const service = clinic.services.find(s => s.name.en === serviceId || s.name.es === serviceId)
                  return service ? `<li>${service.name[lang] || service.name.en || service.name.es}</li>` : ''
                }).join('')}
              </ul>
            </div>
            <div class="doctor-actions">
              <a href="/book?doctor=${doctor.slug}" class="btn btn-primary">Book with ${doctor.name}</a>
            </div>
          </div>
        `).join('')}
      </div>
    </div>
  `

  return {
    title: `${pageTitle} | ${clinic.name}`,
    description: pageDescription,
    keywords: [...website.settings.seo.keywords, 'dental team', 'dentist', 'dental professionals'],
    content,
    schemaMarkup: generateSchemaMarkup(context).medicalOrganization
  }
}

export function generateContactPage(context: WebsiteGenerationContext, language: string = 'en'): GeneratedPageData {
  const { website, clinic } = context
  const lang = language as 'en' | 'es'
  
  const pageTitle = website.content.contact.title[lang] || 'Contact Us'
  const pageDescription = website.content.contact.description[lang] || `Get in touch with ${clinic.name}`
  
  const content = `
    <div class="contact-page">
      <h1>${pageTitle}</h1>
      <p class="page-description">${pageDescription}</p>
      
      <div class="contact-grid">
        <div class="contact-info">
          <h2>Get in Touch</h2>
          <div class="contact-details">
            <div class="contact-item">
              <strong>Phone:</strong>
              <a href="tel:${clinic.phone}">${clinic.phone}</a>
            </div>
            <div class="contact-item">
              <strong>Email:</strong>
              <a href="mailto:${clinic.email}">${clinic.email}</a>
            </div>
            <div class="contact-item">
              <strong>Address:</strong>
              <address>
                ${clinic.address.street}<br>
                ${clinic.address.city} ${clinic.address.zip}
              </address>
            </div>
          </div>
          
          <div class="working-hours">
            <h3>Working Hours</h3>
            <ul>
              ${clinic.workingHours.map(wh => {
                const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
                return `<li>${days[wh.day]}: ${wh.open} - ${wh.close}</li>`
              }).join('')}
            </ul>
          </div>
        </div>
        
        <div class="contact-actions">
          <h2>Schedule an Appointment</h2>
          <p>Ready to book your visit? Choose your preferred method:</p>
          <div class="contact-buttons">
            <a href="/book" class="btn btn-primary">Book Online</a>
            <a href="tel:${clinic.phone}" class="btn btn-secondary">Call Now</a>
            <a href="https://wa.me/${clinic.phone.replace(/\D/g, '')}" class="btn btn-success">WhatsApp</a>
          </div>
        </div>
      </div>
      
      ${clinic.address.coordinates ? `
        <div class="map-section">
          <h2>Find Us</h2>
          <div class="map-placeholder">
            <!-- Map integration would go here -->
            <p>Map showing location at ${clinic.address.street}, ${clinic.address.city}</p>
          </div>
        </div>
      ` : ''}
    </div>
  `

  return {
    title: `${pageTitle} | ${clinic.name}`,
    description: pageDescription,
    keywords: [...website.settings.seo.keywords, 'contact', 'location', 'hours', 'phone', 'appointment'],
    content,
    schemaMarkup: generateSchemaMarkup(context).localBusiness
  }
}

// ─── Main Generation Function ────────────────────────────

export async function generateWebsiteData(clinicId: string): Promise<WebsiteGenerationContext | null> {
  const clinicsCollection = await getClinicsCollection()
  const doctorsCollection = await getDoctorsCollection()
  const websitesCollection = await getWebsitesCollection()

  const [clinic, doctors, website] = await Promise.all([
    clinicsCollection.findOne({ _id: new ObjectId(clinicId) }),
    doctorsCollection.find({ clinicId: new ObjectId(clinicId) }).toArray(),
    websitesCollection.findOne({ clinicId: new ObjectId(clinicId) })
  ])

  if (!clinic || !website) {
    return null
  }

  return {
    website,
    clinic,
    doctors
  }
}