import { createFileRoute, Link } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { notFound } from '@tanstack/react-router'
import { getMockWebsiteBySubdomain } from '@/data/website-mock'
import { mockClinics, mockDoctors } from '@/data/mock'
import { generateTeamPage, type WebsiteGenerationContext } from '@/server/website-generator'

// Server function to get clinic team data
const getClinicTeamData = createServerFn({ method: 'GET' })
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

    // Get clinic and doctors data
    const clinic = mockClinics.find(c => c._id.toString() === website.clinicId.toString())
    const doctors = mockDoctors.filter(d => d.clinicId.toString() === website.clinicId.toString())
    
    if (!clinic) {
      throw notFound()
    }

    const context: WebsiteGenerationContext = {
      website,
      clinic,
      doctors
    }

    // Generate team page content
    const pageData = generateTeamPage(context, 'en')
    
    return {
      html: pageData.content,
      title: pageData.title,
      description: pageData.description,
      schemaMarkup: pageData.schemaMarkup || {}
    }
  })

export const Route = createFileRoute('/clinic/$clinicSlug/team')({
  loader: async ({ params }) => {
    const teamData = await getClinicTeamData({ 
      data: { clinicSlug: params.clinicSlug } 
    })
    
    return {
      teamData,
      clinicSlug: params.clinicSlug
    }
  },
  component: ClinicTeamPage,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: loaderData.teamData.title,
      },
      {
        name: 'description',
        content: loaderData.teamData.description,
      },
      {
        property: 'og:title',
        content: loaderData.teamData.title,
      },
      {
        property: 'og:description',
        content: loaderData.teamData.description,
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
    scripts: [
      {
        type: 'application/ld+json',
        children: JSON.stringify(loaderData.teamData.schemaMarkup),
      },
    ],
  }),
})

function ClinicTeamPage() {
  const { teamData, clinicSlug } = Route.useLoaderData()

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
                className="text-gray-900 hover:text-blue-600 font-medium"
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
                  <svg className="flex-shrink-0 h-5 w-5 text-gray-400 mx-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                  <span className="text-gray-900 font-medium">Our Team</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Generated team content */}
        <div 
          className="clinic-team-content"
          dangerouslySetInnerHTML={{ 
            __html: teamData.html.replace(
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

      {/* Styles for team content */}
      <style dangerouslySetInnerHTML={{
        __html: `
          .clinic-team-content h1 {
            font-size: 2.5rem;
            font-weight: bold;
            margin-bottom: 1.5rem;
            color: #1f2937;
            text-align: center;
          }
          .clinic-team-content h2 {
            font-size: 2rem;
            font-weight: bold;
            margin: 2rem 0 1rem;
            color: #1f2937;
          }
          .clinic-team-content h3 {
            font-size: 1.5rem;
            font-weight: semibold;
            margin: 1.5rem 0 0.75rem;
            color: #374151;
          }
          .clinic-team-content p {
            margin-bottom: 1rem;
            color: #6b7280;
            line-height: 1.6;
          }
          .clinic-team-content .page-description {
            font-size: 1.25rem;
            text-align: center;
            margin-bottom: 3rem;
            color: #4b5563;
          }
          .clinic-team-content .doctors-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
            gap: 2rem;
            margin: 2rem 0;
          }
          .clinic-team-content .doctor-profile {
            background: #ffffff;
            border: 1px solid #e5e7eb;
            border-radius: 1rem;
            padding: 2rem;
            box-shadow: 0 1px 3px 0 rgb(0 0 0 / 0.1);
            transition: transform 0.2s, box-shadow 0.2s;
            text-align: center;
          }
          .clinic-team-content .doctor-profile:hover {
            transform: translateY(-4px);
            box-shadow: 0 8px 16px -4px rgb(0 0 0 / 0.1);
          }
          .clinic-team-content .doctor-photo {
            width: 120px;
            height: 120px;
            border-radius: 50%;
            object-fit: cover;
            margin: 0 auto 1.5rem;
            border: 4px solid #e5e7eb;
          }
          .clinic-team-content .specialization {
            color: #3b82f6;
            font-weight: 600;
            margin-bottom: 1rem;
          }
          .clinic-team-content .doctor-bio {
            margin: 1.5rem 0;
            text-align: left;
          }
          .clinic-team-content .doctor-services {
            margin: 1.5rem 0;
            text-align: left;
          }
          .clinic-team-content .doctor-services ul {
            list-style: none;
            padding: 0;
            margin: 0.5rem 0;
          }
          .clinic-team-content .doctor-services li {
            position: relative;
            padding-left: 1.5rem;
            margin-bottom: 0.5rem;
            color: #6b7280;
          }
          .clinic-team-content .doctor-services li:before {
            content: "✓";
            position: absolute;
            left: 0;
            color: #059669;
            font-weight: bold;
          }
          .clinic-team-content .doctor-actions {
            margin-top: 2rem;
          }
          .clinic-team-content .btn {
            display: inline-block;
            padding: 0.75rem 1.5rem;
            border-radius: 0.5rem;
            text-decoration: none;
            font-weight: 500;
            transition: all 0.2s;
          }
          .clinic-team-content .btn-primary {
            background-color: #3b82f6;
            color: #ffffff;
          }
          .clinic-team-content .btn-primary:hover {
            background-color: #2563eb;
            transform: translateY(-1px);
          }
        `
      }} />
    </div>
  )
}