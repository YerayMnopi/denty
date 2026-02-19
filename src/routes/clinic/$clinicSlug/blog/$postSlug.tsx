import { createFileRoute, Link, notFound } from '@tanstack/react-router'
import { createServerFn } from '@tanstack/react-start'
import { mockClinics } from '@/data/mock'
import {
  getMockBlogPostBySlug,
  getMockBlogPostsByClinicId,
  getMockWebsiteBySubdomain,
  type MockBlogPost,
} from '@/data/website-mock'

// Server function to get blog post data
const getBlogPostData = createServerFn({ method: 'GET' })
  .inputValidator((input: { clinicSlug: string; postSlug: string }) => input)
  .handler(
    async ({
      data,
    }): Promise<{
      post: MockBlogPost
      clinic: { name: string; slug: string }
      relatedPosts: MockBlogPost[]
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

      // Get the specific blog post
      const post = getMockBlogPostBySlug(website.clinicId, data.postSlug)
      if (!post || !post.published) {
        throw notFound()
      }

      // Get related posts (other posts with similar tags)
      const allPosts = getMockBlogPostsByClinicId(website.clinicId).filter(
        (p) => p.published && p._id !== post._id,
      )

      const relatedPosts = allPosts
        .filter((p) => p.tags.some((tag) => post.tags.includes(tag)))
        .slice(0, 3)

      return {
        post,
        clinic: { name: clinic.name, slug: data.clinicSlug },
        relatedPosts,
      }
    },
  )

export const Route = createFileRoute('/clinic/$clinicSlug/blog/$postSlug')({
  loader: async ({ params }) => {
    const postData = await getBlogPostData({
      data: {
        clinicSlug: params.clinicSlug,
        postSlug: params.postSlug,
      },
    })

    return {
      ...postData,
      clinicSlug: params.clinicSlug,
    }
  },
  component: ClinicBlogPost,
  head: ({ loaderData }) => {
    const post = loaderData?.post
    const clinic = loaderData?.clinic
    if (!post || !clinic) return { meta: [] }

    return {
      meta: [
        {
          title:
            post.seo.title.en ||
            post.title.en ||
            `${Object.values(post.title)[0]} | ${clinic.name}`,
        },
        {
          name: 'description',
          content: post.seo.description.en || post.excerpt.en || Object.values(post.excerpt)[0],
        },
        {
          name: 'keywords',
          content: post.seo.keywords.join(', '),
        },
        {
          property: 'og:title',
          content: post.title.en || Object.values(post.title)[0],
        },
        {
          property: 'og:description',
          content: post.excerpt.en || Object.values(post.excerpt)[0],
        },
        {
          property: 'og:type',
          content: 'article',
        },
        {
          name: 'article:author',
          content: post.author,
        },
        {
          name: 'article:published_time',
          content: (post.publishedAt || post.createdAt).toISOString(),
        },
      ],
      scripts: [
        {
          type: 'application/ld+json',
          children: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'BlogPosting',
            headline: post.title.en || Object.values(post.title)[0],
            description: post.excerpt.en || Object.values(post.excerpt)[0],
            author: {
              '@type': 'Person',
              name: post.author,
            },
            datePublished: (post.publishedAt || post.createdAt).toISOString(),
            dateModified: post.updatedAt.toISOString(),
            publisher: {
              '@type': 'Organization',
              name: clinic.name,
            },
            keywords: post.seo.keywords.join(', '),
          }),
        },
      ],
    }
  },
})

function ClinicBlogPost() {
  const { post, clinic, relatedPosts, clinicSlug } = Route.useLoaderData()

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(new Date(date))
  }

  const formatContentToHTML = (content: string) => {
    // Basic markdown to HTML conversion (simplified)
    return content
      .replace(/^# (.*$)/gm, '<h1>$1</h1>')
      .replace(/^## (.*$)/gm, '<h2>$1</h2>')
      .replace(/^### (.*$)/gm, '<h3>$1</h3>')
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(
        /\[(.*?)\]\((.*?)\)/g,
        '<a href="$2" class="text-blue-600 hover:text-blue-800 underline">$1</a>',
      )
      .replace(/\n\n/g, '</p><p>')
      .replace(/\n/g, '<br>')
      .replace(/^(.*)$/gm, '<p>$1</p>')
      .replace(/<p><h([1-3])>/g, '<h$1>')
      .replace(/<\/h([1-3])><\/p>/g, '</h$1>')
      .replace(/<p><\/p>/g, '')
      .replace(/<p><br>/g, '<p>')
  }

  const contentHTML = formatContentToHTML(
    post.content.en || post.content.es || Object.values(post.content)[0],
  )

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
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
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
                  <Link
                    to="/clinic/$clinicSlug/blog"
                    params={{ clinicSlug }}
                    className="text-gray-500 hover:text-gray-700"
                  >
                    Blog
                  </Link>
                </div>
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
                  <span className="text-gray-900 font-medium line-clamp-1">
                    {post.title.en || post.title.es || Object.values(post.title)[0]}
                  </span>
                </div>
              </li>
            </ol>
          </nav>
        </div>
      </div>

      {/* Main Content */}
      <article className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Article Header */}
        <header className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <span
                key={tag}
                className="bg-blue-100 text-blue-800 text-sm font-medium px-3 py-1 rounded-full"
              >
                {tag.replace(/\b\w/g, (l) => l.toUpperCase())}
              </span>
            ))}
          </div>

          <h1 className="text-4xl font-bold text-gray-900 mb-6">
            {post.title.en || post.title.es || Object.values(post.title)[0]}
          </h1>

          <div className="flex items-center text-gray-600 mb-6">
            <div className="flex items-center">
              <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-semibold mr-3">
                {post.author.charAt(0).toUpperCase()}
              </div>
              <div>
                <p className="font-medium text-gray-900">{post.author}</p>
                <p className="text-sm text-gray-500">
                  {formatDate(post.publishedAt || post.createdAt)}
                  {post.updatedAt.getTime() !== post.createdAt.getTime() && (
                    <span> • Updated {formatDate(post.updatedAt)}</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          <div className="text-xl text-gray-600 leading-relaxed">
            {post.excerpt.en || post.excerpt.es || Object.values(post.excerpt)[0]}
          </div>
        </header>

        {/* Article Content */}
        <div
          className="prose prose-lg prose-blue max-w-none"
          dangerouslySetInnerHTML={{ __html: contentHTML }}
        />

        {/* Call to Action */}
        <div className="bg-linear-to-r from-blue-600 to-blue-700 rounded-lg p-8 mt-12 text-center text-white">
          <h2 className="text-2xl font-bold mb-4">Need Professional Dental Care?</h2>
          <p className="text-blue-100 mb-6">
            Our experienced team at {clinic.name} is here to help you maintain optimal oral health.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              to="/book/$clinicSlug"
              params={{ clinicSlug }}
              className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-blue-50 transition-colors"
            >
              Book Appointment
            </Link>
            <Link
              to="/clinic/$clinicSlug/contact"
              params={{ clinicSlug }}
              className="border border-white text-white px-6 py-3 rounded-lg font-semibold hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Us
            </Link>
          </div>
        </div>
      </article>

      {/* Related Posts */}
      {relatedPosts.length > 0 && (
        <section className="bg-gray-50 py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-3xl font-bold text-gray-900 text-center mb-12">
              You Might Also Like
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedPosts.map((relatedPost) => (
                <article
                  key={relatedPost._id}
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow"
                >
                  <div className="p-6">
                    <div className="flex items-center text-sm text-gray-500 mb-2">
                      <span>{relatedPost.author}</span>
                      <span className="mx-2">•</span>
                      <span>{formatDate(relatedPost.publishedAt || relatedPost.createdAt)}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 line-clamp-2">
                      <Link
                        to="/clinic/$clinicSlug/blog/$postSlug"
                        params={{ clinicSlug, postSlug: relatedPost.slug }}
                        className="hover:text-blue-600 transition-colors"
                      >
                        {relatedPost.title.en ||
                          relatedPost.title.es ||
                          Object.values(relatedPost.title)[0]}
                      </Link>
                    </h3>
                    <p className="text-gray-600 mb-4 line-clamp-3">
                      {relatedPost.excerpt.en ||
                        relatedPost.excerpt.es ||
                        Object.values(relatedPost.excerpt)[0]}
                    </p>
                    <Link
                      to="/clinic/$clinicSlug/blog/$postSlug"
                      params={{ clinicSlug, postSlug: relatedPost.slug }}
                      className="text-blue-600 hover:text-blue-800 font-medium"
                    >
                      Read More →
                    </Link>
                  </div>
                </article>
              ))}
            </div>

            <div className="text-center mt-12">
              <Link
                to="/clinic/$clinicSlug/blog"
                params={{ clinicSlug }}
                className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium"
              >
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
                View All Blog Posts
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="bg-gray-50">
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

      {/* Custom Styles */}
      <style
        dangerouslySetInnerHTML={{
          __html: `
          .prose {
            color: #374151;
            line-height: 1.75;
          }
          .prose h1, .prose h2, .prose h3 {
            color: #1f2937;
            font-weight: bold;
            margin-top: 2rem;
            margin-bottom: 1rem;
          }
          .prose h1 {
            font-size: 2.25rem;
            line-height: 1.2;
          }
          .prose h2 {
            font-size: 1.875rem;
            line-height: 1.3;
          }
          .prose h3 {
            font-size: 1.5rem;
            line-height: 1.4;
          }
          .prose p {
            margin-bottom: 1.5rem;
          }
          .prose strong {
            font-weight: 600;
            color: #1f2937;
          }
          .prose em {
            font-style: italic;
          }
          .prose ul, .prose ol {
            margin: 1.5rem 0;
            padding-left: 1.5rem;
          }
          .prose li {
            margin-bottom: 0.5rem;
          }
          .prose a {
            color: #2563eb;
            text-decoration: underline;
          }
          .prose a:hover {
            color: #1d4ed8;
          }
          .line-clamp-1 {
            display: -webkit-box;
            -webkit-line-clamp: 1;
            -webkit-box-orient: vertical;
            overflow: hidden;
          }
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
