import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { getMockWebsiteBySubdomain } from '@/data/website-mock'
import { mockClinics, mockDoctors } from '@/data/mock'
import { generateHomepage, type WebsiteGenerationContext } from '@/server/website-generator'

// Server function to get clinic website data
const getClinicWebsiteData = createServerFn({ method: 'GET' })
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

    // Generate homepage content
    const pageData = generateHomepage(context, 'en') // Default to English, could be dynamic
    
    return {
      html: pageData.content,
      title: pageData.title,
      description: pageData.description,
      schemaMarkup: pageData.schemaMarkup || {}
    }
  })

export const Route = createFileRoute('/clinic/$clinicSlug/')({
  loader: async ({ params }) => {
    const websiteData = await getClinicWebsiteData({ 
      data: { clinicSlug: params.clinicSlug } 
    })
    
    return {
      websiteData,
      clinicSlug: params.clinicSlug
    }
  },
  component: ClinicHomepage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData?.websiteData?.title ?? '',
      },
      {
        name: 'description',
        content: loaderData?.websiteData?.description ?? '',
      },
      {
        property: 'og:title',
        content: loaderData?.websiteData?.title ?? '',
      },
      {
        property: 'og:description',
        content: loaderData?.websiteData?.description ?? '',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    scripts: loaderData?.websiteData?.schemaMarkup ? [
      {
        type: 'application/ld+json',
        children: JSON.stringify(loaderData.websiteData.schemaMarkup),
      },
    ] : [],
  }),
})

function ClinicHomepage() {
  const { websiteData, clinicSlug } = Route.useLoaderData()

  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-gray-900">
                {clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
              </h1>
            </div>
            <div className="hidden md:flex space-x-8">
              <Link 
                to="/clinic/$clinicSlug" 
                params={{ clinicSlug }} 
                className="text-gray-900 hover:text-blue-600 font-medium"
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

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generated website content */}
        <div 
          className="clinic-website-content"
          dangerouslySetInnerHTML={{ 
            __html: websiteData.html.replace(
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

      {/* Chat Widget */}
      <div className="fixed bottom-4 right-4 z-50">
        <button 
          className="bg-green-500 text-white p-3 rounded-full shadow-lg hover:bg-green-600 transition-colors"
          title="Chat with us"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
          </svg>
        </button>
      </div>

      {/* Styles for generated content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .clinic-website-content h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: #1f2937;
          }
          .clinic-website-content h2 {
            font-size: 2rem;
            font-weight: bold;
            margin: 2rem 0 1rem;
            color: #1f2937;
          }
          .clinic-website-content h3 {
            font-size: 1.5rem;
            font-weight: semibold;
            margin: 1.5rem 0 0.75rem;
            color: #374151;
          }
          .clinic-website-content p {
            margin-bottom: 1rem;
            color: #6b7280;
            line-height: 1.6;
          }
          .clinic-website-content .hero-section {
            text-align: center;
            padding: 4rem 0;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border-radius: 1rem;
            margin-bottom: 3rem;
          }
          .clinic-website-content .hero-subtitle {
            font-size: 1.25rem;
            margin-bottom: 2rem;
          }
          .clinic-website-content .cta-buttons {
            display: flex;
            gap: 1rem;
            justify-content: center;
            flex-wrap: wrap;
          }
          .clinic-website-content .btn {
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
          }
          .clinic-website-content .btn-primary {
            background-color: #ffffff;
            color: #3b82f6;
          }
          .clinic-website-content .btn-primary:hover {
            background-color: #f8fafc;
            transform: translateY(-1px);
          }
          .clinic-website-content .btn-secondary {
            background-color: transparent;
            color: #ffffff;
            border: 2px solid #ffffff;
          }
          .clinic-website-content .btn-secondary:hover {
            background-color: #ffffff;
            color: #3b82f6;
          }
          .clinic-website-content .services-grid,
          .clinic-website-content .doctors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
            gap: 1.5rem;
            margin: 2rem 0;
          }
          .clinic-website-content .service-card,
          .clinic-website-content .doctor-card {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 0.75rem;
            padding: 1.5rem;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
          }
          .clinic-website-content .service-card:hover,
          .clinic-website-content .doctor-card:hover {
            transform: translateY(-2px);
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
          }
          .clinic-website-content .about-section,
          .clinic-website-content .services-preview,
          .clinic-website-content .doctors-preview,
          .clinic-website-content .contact-section {
            margin: 3rem 0;
          }
          .clinic-website-content .contact-info {
            background: #f9fafb;
            padding: 2rem;
            border-radius: 0.75rem;
            margin-top: 1rem;
          }
        `
      }} />
    </div>
  )
}