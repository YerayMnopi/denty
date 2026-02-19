import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { getMockWebsiteBySubdomain } from '@/data/website-mock'
import { mockClinics, mockDoctors } from '@/data/mock'
import { generateServicesPage, type WebsiteGenerationContext } from '@/server/website-generator'

// Server function to get clinic services data
const getClinicServicesData = createServerFn({ method: 'GET' })
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

    // Generate services page content
    const pageData = generateServicesPage(context, 'en')
    
    return {
      html: pageData.content,
      title: pageData.title,
      description: pageData.description,
      schemaMarkup: pageData.schemaMarkup || {}
    }
  })

export const Route = createFileRoute('/clinic/$clinicSlug/services')({
  loader: async ({ params }) => {
    const servicesData = await getClinicServicesData({ 
      data: { clinicSlug: params.clinicSlug } 
    })
    
    return {
      servicesData,
      clinicSlug: params.clinicSlug
    }
  },
  component: ClinicServicesPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.servicesData?.title ?? '',
      },
      {
        name: 'description',
        content: loaderData?.servicesData?.description ?? '',
      },
      {
        property: 'og:title',
        content: loaderData?.servicesData?.title ?? '',
      },
      {
        property: 'og:description',
        content: loaderData?.servicesData?.description ?? '',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    scripts: loaderData?.servicesData?.schemaMarkup ? [
      {
        type: 'application/ld+json',
        children: JSON.stringify(loaderData.servicesData.schemaMarkup),
      },
    ] : [],
  }),
})

function ClinicServicesPage() {
  const { servicesData, clinicSlug } = Route.useLoaderData()

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
                className="text-gray-900 hover:text-blue-600 font-medium"
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
                className="text-gray-600 hover:text-blue-600 font-medium"
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
                  <span className="text-gray-900 font-medium">Services</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generated services content */}
        <div 
          className="clinic-services-content"
          dangerouslySetInnerHTML={{ 
            __html: servicesData.html.replace(
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
                    to="/clinic/$clinicSlug/team" 
                    params={{ clinicSlug }} 
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Our Team
                  </Link>
                </li>
                <li>
                  <Link 
                    to="/clinic/$clinicSlug/contact" 
                    params={{ clinicSlug }} 
                    className="text-gray-600 hover:text-blue-600"
                  >
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Book Appointment</h3>
              <p className="text-gray-600 mb-4">
                Ready to schedule your visit? Book online or call us directly.
              </p>
              <Link 
                to="/book/$clinicSlug" 
                params={{ clinicSlug }} 
                className="inline-block bg-blue-600 text-white px-6 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Book Now
              </Link>
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

      {/* Styles for services content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .clinic-services-content h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: #1f2937;
            text-align: center;
          }
          .clinic-services-content h2 {
            font-size: 2rem;
            font-weight: bold;
            margin: 2rem 0 1rem;
            color: #1f2937;
          }
          .clinic-services-content h3 {
            font-size: 1.5rem;
            font-weight: semibold;
            margin: 1.5rem 0 0.75rem;
            color: #374151;
          }
          .clinic-services-content p {
            margin-bottom: 1rem;
            color: #6b7280;
            line-height: 1.6;
          }
          .clinic-services-content .page-description {
            font-size: 1.25rem;
            text-align: center;
            margin-bottom: 3rem;
            color: #4b5563;
          }
          .clinic-services-content .services-list {
            display: grid;
            gap: 2rem;
            margin: 2rem 0;
          }
          .clinic-services-content .service-detail {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            padding: 2rem;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .clinic-services-content .service-detail:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .clinic-services-content .service-meta {
            display: flex;
            gap: 1.5rem;
            margin: 1rem 0;
            flex-wrap: wrap;
          }
          .clinic-services-content .duration,
          .clinic-services-content .price {
            color: #6b7280;
            font-weight: 500;
          }
          .clinic-services-content .price {
            color: #059669;
            font-weight: 600;
          }
          .clinic-services-content .service-actions {
            margin-top: 1.5rem;
          }
          .clinic-services-content .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
          }
          .clinic-services-content .btn-primary {
            background-color: #3b82f6;
            color: #ffffff;
          }
          .clinic-services-content .btn-primary:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
          }
          .clinic-services-content .services-cta {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            text-align: center;
            padding: 3rem 2rem;
            border-radius: 1rem;
            margin: 3rem 0;
          }
          .clinic-services-content .services-cta h2 {
            color: #ffffff;
            margin-bottom: 1rem;
          }
          .clinic-services-content .services-cta p {
            color: #e5e7eb;
            margin-bottom: 2rem;
          }
          .clinic-services-content .services-cta .btn-primary {
            background-color: #ffffff;
            color: #3b82f6;
          }
          .clinic-services-content .services-cta .btn-primary:hover {
            background-color: #f8fafc;
          }
        `
      }} />
    </div>
  )
}