import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { getMockWebsiteBySubdomain } from '@/data/website-mock'
import { mockClinics, mockDoctors } from '@/data/mock'
import { generateContactPage, type WebsiteGenerationContext } from '@/server/website-generator'

// Server function to get clinic contact data
const getClinicContactData = createServerFn({ method: 'GET' })
  .inputValidator((input: { clinicSlug: string }) => input)
  .handler(async ({ data }): Promise<{ 
    html: string 
    title: string 
    description: string 
    schemaMarkup: object
  }> => {
    // Get website data by subdomain (clinicSlug)
    const website = getMockWebsiteBySubdomain(data.clinicSlug)
    if (!website) {
      throw notFound()
    }

    // Get clinic and doctors data (match by subdomain/slug)
    const clinic = mockClinics.find(c => c.slug === website.subdomain)
    const doctors = mockDoctors.filter(d => d.clinicSlug === website.subdomain)
    
    if (!clinic) {
      throw notFound()
    }

    const context = {
      website,
      clinic,
      doctors
    } as unknown as WebsiteGenerationContext

    // Generate contact page content
    const pageData = generateContactPage(context, 'en')
    
    return {
      html: pageData.content,
      title: pageData.title,
      description: pageData.description,
      schemaMarkup: pageData.schemaMarkup || {}
    }
  })

export const Route = createFileRoute('/clinic/$clinicSlug/contact')({
  loader: async ({ params }) => {
    const contactData = await getClinicContactData({ 
      data: { clinicSlug: params.clinicSlug } 
    })
    
    return {
      contactData,
      clinicSlug: params.clinicSlug
    }
  },
  component: ClinicContactPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.contactData?.title ?? '',
      },
      {
        name: 'description',
        content: loaderData?.contactData?.description ?? '',
      },
      {
        property: 'og:title',
        content: loaderData?.contactData?.title ?? '',
      },
      {
        property: 'og:description',
        content: loaderData?.contactData?.description ?? '',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    scripts: loaderData?.contactData?.schemaMarkup ? [
      {
        type: 'application/ld+json',
        children: JSON.stringify(loaderData.contactData.schemaMarkup),
      },
    ] : [],
  }),
})

function ClinicContactPage() {
  const { contactData, clinicSlug } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <Link 
                to="/clinic/$clinicSlug" 
                params={{ clinicSlug }}
                className="text-2xl font-bold text-gray-900"
              >
                {clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </Link>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link 
                to="/clinic/$clinicSlug" 
                params={{ clinicSlug }} 
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Home
              </Link>
              <Link 
                to="/clinic/$clinicSlug/services" 
                params={{ clinicSlug }} 
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Services
              </Link>
              <Link 
                to="/clinic/$clinicSlug/team" 
                params={{ clinicSlug }} 
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Team
              </Link>
              <Link 
                to="/clinic/$clinicSlug/contact" 
                params={{ clinicSlug }} 
                className="text-gray-900 hover:text-blue-600 font-medium"
              >
                Contact
              </Link>
              <Link 
                to="/clinic/$clinicSlug/blog" 
                params={{ clinicSlug }} 
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Blog
              </Link>
            </div>
            <div className="flex items-center space-x-4">
              <Link 
                to="/book/$clinicSlug" 
                params={{ clinicSlug }} 
                className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Book Appointment
              </Link>
            </div>
          </div>
        </nav>
      </header>

      {/* Breadcrumb */}
      <div className="bg-gray-50 py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex" aria-label="Breadcrumb">
            <ol className="flex items-center space-x-4">
              <li>
                <Link 
                  to="/clinic/$clinicSlug" 
                  params={{ clinicSlug }} 
                  className="text-gray-500 hover:text-gray-700"
                >
                  Home
                </Link>
              </li>
              <li>
                <div className="flex items-center">
                  <svg className="shrink-0 h-5 w-5 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Contact</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generated contact content */}
        <div 
          className="clinic-contact-content"
          dangerouslySetInnerHTML={{ 
            __html: contactData.html.replace(
              /href="\/([^"]*)"/, 
              `href="/clinic/${clinicSlug}/$1"`
            )
          }} 
        />
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h3>
              <p className="text-gray-600">
                Professional dental care with modern technology and personalized service.
              </p>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Links</h3>
              <ul className="space-y-2">
                <li>
                  <Link 
                    to="/clinic/$clinicSlug" 
                    params={{ clinicSlug }} 
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Home
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/clinic/$clinicSlug/services" 
                    params={{ clinicSlug }} 
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Our Services
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/clinic/$clinicSlug/team" 
                    params={{ clinicSlug }} 
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Our Team
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
              <p className="text-gray-600 mb-4">
                For dental emergencies, please call us directly or visit our clinic.
              </p>
              <div className="space-y-2">
                <a 
                  href="tel:+34911234567" 
                  className="inline-block bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                >
                  Emergency Line
                </a>
              </div>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">
              © 2024 {clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}. All rights reserved.
              Powered by <Link to="/" className="text-blue-600 hover:text-blue-700">Denty</Link>.
            </p>
          </div>
        </div>
      </footer>

      {/* Styles for contact content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .clinic-contact-content h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: #1f2937;
            text-align: center;
          }
          .clinic-contact-content h2 {
            font-size: 2rem;
            font-weight: bold;
            margin: 2rem 0 1rem;
            color: #1f2937;
          }
          .clinic-contact-content h3 {
            font-size: 1.5rem;
            font-weight: semibold;
            margin: 1.5rem 0 0.75rem;
            color: #374151;
          }
          .clinic-contact-content p {
            margin-bottom: 1rem;
            color: #6b7280;
            line-height: 1.6;
          }
          .clinic-contact-content .page-description {
            font-size: 1.25rem;
            text-align: center;
            margin-bottom: 3rem;
            color: #4b5563;
          }
          .clinic-contact-content .contact-grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 3rem;
            margin: 3rem 0;
          }
          @media (max-width: 768px) {
            .clinic-contact-content .contact-grid {
              grid-template-columns: 1fr;
              gap: 2rem;
            }
          }
          .clinic-contact-content .contact-info {
            background: #f9fafb;
            padding: 2rem;
            border-radius: 1rem;
            border: 1px solid #e5e7eb;
          }
          .clinic-contact-content .contact-details {
            margin: 1.5rem 0;
          }
          .clinic-contact-content .contact-item {
            margin-bottom: 1rem;
            display: flex;
            flex-direction: column;
          }
          .clinic-contact-content .contact-item strong {
            color: #1f2937;
            margin-bottom: 0.25rem;
          }
          .clinic-contact-content .contact-item a {
            color: #3b82f6;
            text-decoration: none;
          }
          .clinic-contact-content .contact-item a:hover {
            text-decoration: underline;
          }
          .clinic-contact-content .working-hours {
            margin-top: 2rem;
          }
          .clinic-contact-content .working-hours ul {
            list-style: none;
            padding: 0;
            margin: 1rem 0 0;
          }
          .clinic-contact-content .working-hours li {
            padding: 0.5rem 0;
            border-bottom: 1px solid #e5e7eb;
            display: flex;
            justify-content: space-between;
          }
          .clinic-contact-content .working-hours li:last-child {
            border-bottom: none;
          }
          .clinic-contact-content .contact-actions {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 2rem;
            border-radius: 1rem;
            text-align: center;
          }
          .clinic-contact-content .contact-actions h2 {
            color: #ffffff;
            margin-bottom: 1rem;
          }
          .clinic-contact-content .contact-actions p {
            color: #e5e7eb;
            margin-bottom: 2rem;
          }
          .clinic-contact-content .contact-buttons {
            display: flex;
            flex-direction: column;
            gap: 1rem;
          }
          .clinic-contact-content .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
            text-align: center;
          }
          .clinic-contact-content .btn-primary {
            background-color: #ffffff;
            color: #3b82f6;
          }
          .clinic-contact-content .btn-primary:hover {
            background-color: #f8fafc;
            transform: translateY(-1px);
          }
          .clinic-contact-content .btn-secondary {
            background-color: transparent;
            color: #ffffff;
            border: 2px solid #ffffff;
          }
          .clinic-contact-content .btn-secondary:hover {
            background-color: #ffffff;
            color: #3b82f6;
          }
          .clinic-contact-content .btn-success {
            background-color: #10b981;
            color: #ffffff;
          }
          .clinic-contact-content .btn-success:hover {
            background-color: #059669;
          }
          .clinic-contact-content .map-section {
            margin: 3rem 0;
          }
          .clinic-contact-content .map-placeholder {
            background: #f3f4f6;
            border: 2px dashed #d1d5db;
            border-radius: 0.5rem;
            padding: 3rem;
            text-align: center;
            color: #6b7280;
            margin-top: 1rem;
          }
          .clinic-contact-content address {
            font-style: normal;
            line-height: 1.4;
          }
        `
      }} />
    </div>
  )
}