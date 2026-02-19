import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { z } from 'zod'
import { mockClinics } from '@/data/mock'
import {
  getMockBlogPostsByClinicId,
  getMockWebsiteBySubdomain,
  type MockBlogPost,
} from '@/data/website-mock'

// Search params for blog listing
const blogSearchSchema = z.object({
  page: z.number().min(1).optional(),
  limit: z.number().min(1).max(20).optional(),
  tag: z.string().optional(),
})

// Server function to get clinic blog data
const getClinicBlogData = createServerFn({ method: 'GET' })
  .inputValidator(
    (input: { clinicSlug: string; page?: number; limit?: number; tag?: string }) => input,
  )
  .handler(
    async ({
      data,
    }): Promise<{
      posts: MockBlogPost[]
      totalPosts: number
      currentPage: number
      totalPages: number
      clinic: { name: string; slug: string }
      tags: string[]
    }> => {
      // Get website data by subdomain (clinicSlug)
      const website = getMockWebsiteBySubdomain(data.clinicSlug)
      if (!website) {
        throw notFound()
      }

      // Get clinic data (match by subdomain/slug)
      const clinic = mockClinics.find((c) => c.slug === website.subdomain)
      if (!clinic) {
        throw notFound()
      }

      // Get blog posts
      let posts = getMockBlogPostsByClinicId(website.clinicId)

      // Filter published posts only
      posts = posts.filter((post) => post.published)

      // Filter by tag if provided
      if (data.tag) {
        posts = posts.filter((post) => post.tags.includes(data.tag!))
      }

      // Pagination
      const page = data.page || 1
      const limit = data.limit || 6
      const startIndex = (page - 1) * limit
      const endIndex = startIndex + limit

      const paginatedPosts = posts.slice(startIndex, endIndex)
      const totalPages = Math.ceil(posts.length / limit)

      // Get all unique tags
      const allTags = [...new Set(posts.flatMap((post) => post.tags))].sort()

      return {
        posts: paginatedPosts,
        totalPosts: posts.length,
        currentPage: page,
        totalPages,
        clinic: { name: clinic.name, slug: data.clinicSlug },
        tags: allTags,
      }
    },
  )

export const Route = createFileRoute('/clinic/$clinicSlug/blog/')({
  validateSearch: blogSearchSchema,
  loader: async ({ params, search }) => {
    const blogData = await getClinicBlogData({
      data: {
        clinicSlug: params.clinicSlug,
        page: search.page,
        limit: search.limit,
        tag: search.tag,
      },
    })

    return {
      ...blogData,
      clinicSlug: params.clinicSlug,
      searchParams: search,
    }
  },
  component: ClinicBlogIndex,
  head: ({ loaderData }) => ({
    meta: [
      {
        title: `Blog | ${loaderData?.clinic?.name ?? ''}`,
      },
      {
        name: 'description',
        content: loaderData?.clinic?.name
          ? `Read the latest dental health tips and news from ${loaderData.clinic.name}. Expert advice from our dental professionals.`
          : '',
      },
      {
        property: 'og:title',
        content: `Blog | ${loaderData?.clinic?.name ?? ''}`,
      },
      {
        property: 'og:description',
        content: loaderData?.clinic?.name
          ? `Read the latest dental health tips and news from ${loaderData.clinic.name}.`
          : '',
      },
      {
        property: 'og:type',
        content: 'website',
      },
    ],
  }),
})

function ClinicBlogIndex() {
  const { posts, totalPosts, currentPage, totalPages, clinic, tags, clinicSlug, searchParams } =
    Route.useLoaderData()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

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
                {clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
                className="text-gray-600 hover:text-blue-600 font-medium"
              >
                Contact
              </Link>
              <Link
                to="/clinic/$clinicSlug/blog"
                params={{ clinicSlug }}
                className="text-gray-900 hover:text-blue-600 font-medium"
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
                  <svg
                    className="shrink-0 h-5 w-5 text-gray-400 mx-2"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  <span className="text-gray-900 font-medium">Blog</span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Blog</h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Stay informed with the latest dental health tips, news, and insights from our
            experienced team
          </p>
        </div>

        {/* Tags Filter */}
        {tags.length > 0 && (
          <div className="mb-8">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Filter by Topic:</h3>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/clinic/$clinicSlug/blog"
                params={{ clinicSlug }}
                search={{}}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  !searchParams.tag
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
              >
                All Posts
              </Link>
              {tags.map((tag) => (
                <Link
                  key={tag}
                  to="/clinic/$clinicSlug/blog"
                  params={{ clinicSlug }}
                  search={{ tag }}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                    searchParams.tag === tag
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
                >
                  {tag.replace(/\b\w/g, (l) => l.toUpperCase())}
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Blog Posts */}
        {posts.length > 0 ? (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-12">
              {posts.map((post) => (
                <article
                  key={post._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{post.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(post.publishedAt || post.createdAt)}</span>
                    </div>
                    <h2 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      <Link
                        to="/clinic/$clinicSlug/blog/$postSlug"
                        params={{ clinicSlug, postSlug: post.slug }}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {post.title.en || post.title.es || Object.values(post.title)[0]}
                      </Link>
                    </h2>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {post.excerpt.en || post.excerpt.es || Object.values(post.excerpt)[0]}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {post.tags.slice(0, 3).map((tag) => (
                        <span
                          key={tag}
                          className="bg-blue-100 text-blue-800 text-xs font-medium px-2.5 py-0.5 rounded"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                    <Link
                      to="/clinic/$clinicSlug/blog/$postSlug"
                      params={{ clinicSlug, postSlug: post.slug }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex justify-center items-center space-x-4">
                {currentPage > 1 && (
                  <Link
                    to="/clinic/$clinicSlug/blog"
                    params={{ clinicSlug }}
                    search={{ ...searchParams, page: currentPage - 1 }}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Previous
                  </Link>
                )}

                <span className="text-gray-600">
                  Page {currentPage} of {totalPages}
                </span>

                {currentPage < totalPages && (
                  <Link
                    to="/clinic/$clinicSlug/blog"
                    params={{ clinicSlug }}
                    search={{ ...searchParams, page: currentPage + 1 }}
                    className="px-4 py-2 text-gray-600 bg-white border border-gray-300 rounded-md hover:bg-gray-50 transition-colors"
                  >
                    Next
                  </Link>
                )}
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <svg
              className="mx-auto h-12 w-12 text-gray-400 mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"
              />
            </svg>
            <h3 className="text-lg font-medium text-gray-900 mb-2">No blog posts yet</h3>
            <p className="text-gray-600">
              {searchParams.tag
                ? `No posts found with the tag "${searchParams.tag}". Try browsing all posts or selecting a different topic.`
                : 'Check back soon for dental health tips and news from our team!'}
            </p>
            {searchParams.tag && (
              <Link
                to="/clinic/$clinicSlug/blog"
                params={{ clinicSlug }}
                search={{}}
                className="inline-block mt-4 text-blue-600 hover:text-blue-800 font-medium"
              >
                View All Posts
              </Link>
            )}
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                {clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}
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
              <h3 className="text-lg font-semibold text-gray-900 mb-4">Subscribe to Our Blog</h3>
              <p className="text-gray-600 mb-4">
                Stay updated with the latest dental health tips and news.
              </p>
              <Link
                to="/clinic/$clinicSlug/contact"
                params={{ clinicSlug }}
                className="inline-block bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
              >
                Contact Us
              </Link>
            </div>
          </div>
          <div className="border-t border-gray-200 mt-8 pt-8 text-center">
            <p className="text-gray-600">
              © 2024 {clinicSlug.replace(/-/g, ' ').replace(/\b\w/g, (l) => l.toUpperCase())}. All
              rights reserved. Powered by{' '}
              <Link to="/" className="text-blue-600 hover:text-blue-700">
                Denty
              </Link>
              .
            </p>
          </div>
        </div>
      </footer>

      {/* Custom styles for text clamping */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .line-clamp-2 {
            display: -webkit-box;
            -webkit-line-clamp: 2;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
          .line-clamp-3 {
            display: -webkit-box;
            -webkit-line-clamp: 3;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
        `,
        }}
      />
    </div>
  )
}
