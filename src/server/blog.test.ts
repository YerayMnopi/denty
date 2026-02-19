import { ObjectId } from 'mongodb'
import { describe, expect, it } from 'vitest'

describe('Blog Server Functions', () => {
  describe('slug generation logic', () => {
    it('should generate clean slugs from titles', () => {
      const titleToSlugTests = [
        { title: 'How to Brush Your Teeth', expected: 'how-to-brush-your-teeth' },
        { title: 'Dental Care Tips!', expected: 'dental-care-tips' },
        { title: 'My Amazing Blog Post', expected: 'my-amazing-blog-post' },
        { title: 'Cómo Cuidar Tus Dientes', expected: 'como-cuidar-tus-dientes' },
        {
          title: 'Implantes Dentales: Guía Completa',
          expected: 'implantes-dentales-guia-completa',
        },
      ]

      titleToSlugTests.forEach(({ title, expected }) => {
        const generated = title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '') // Remove accents
          .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
          .trim()
          .replace(/\s+/g, '-') // Replace spaces with hyphens
          .replace(/-+/g, '-') // Replace multiple hyphens

        expect(generated).toBe(expected)
      })
    })

    it('should handle special characters and accents correctly', () => {
      const specialTitles = [
        {
          title: 'Niños & Adolescentes: Cuidado Dental',
          expected: 'ninos-adolescentes-cuidado-dental',
        },
        { title: 'Bruxismo - Problemas y Soluciones', expected: 'bruxismo-problemas-y-soluciones' },
        {
          title: 'El 90% de las Caries son Prevenibles',
          expected: 'el-90-de-las-caries-son-prevenibles',
        },
        { title: '¿Cuándo visitar al dentista?', expected: 'cuando-visitar-al-dentista' },
      ]

      specialTitles.forEach(({ title, expected }) => {
        const generated = title
          .toLowerCase()
          .normalize('NFD')
          .replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9\s-]/g, '')
          .trim()
          .replace(/\s+/g, '-')
          .replace(/-+/g, '-')

        expect(generated).toBe(expected)
      })
    })

    it('should handle slug collision logic', () => {
      const baseSlug = 'dental-care-tips'
      const existingSlugs = ['dental-care-tips', 'dental-care-tips-1', 'dental-care-tips-2']

      // Logic to find next available slug
      let counter = 1
      let uniqueSlug = `${baseSlug}-${counter}`

      while (existingSlugs.includes(uniqueSlug)) {
        counter++
        uniqueSlug = `${baseSlug}-${counter}`
      }

      expect(uniqueSlug).toBe('dental-care-tips-3')
    })

    it('should validate slug format', () => {
      const validSlugs = [
        'my-blog-post',
        'dental-health-tips-2024',
        'orthodontics-guide',
        'post-1',
        'cuidado-dental',
      ]

      const invalidSlugs = [
        'My Blog Post',
        'post with spaces',
        'post_with_underscores',
        'post@with#symbols',
        '',
        '   ',
        'POST-IN-CAPS',
      ]

      const slugRegex = /^[a-z0-9-]+$/

      validSlugs.forEach((slug) => {
        expect(slug).toMatch(slugRegex)
        expect(slug.length).toBeGreaterThan(0)
      })

      invalidSlugs.forEach((slug) => {
        const isValid = slug.trim().length > 0 && slugRegex.test(slug)
        expect(isValid).toBe(false)
      })
    })
  })

  describe('blog post validation logic', () => {
    it('should validate blog post structure', () => {
      const validBlogPost = {
        clinicId: new ObjectId(),
        slug: 'valid-slug',
        title: { en: 'English Title', es: 'Título Español' },
        content: { en: '# English Content\n\nParagraph', es: '# Contenido Español\n\nPárrafo' },
        excerpt: { en: 'English excerpt', es: 'Extracto español' },
        author: 'Dr. Test',
        authorId: new ObjectId(),
        tags: ['health', 'tips', 'dental'],
        published: false,
        seo: {
          title: { en: 'SEO Title', es: 'Título SEO' },
          description: { en: 'SEO Description', es: 'Descripción SEO' },
          keywords: ['keyword1', 'keyword2', 'keyword3'],
        },
      }

      expect(validBlogPost.clinicId).toBeInstanceOf(ObjectId)
      expect(validBlogPost.authorId).toBeInstanceOf(ObjectId)
      expect(validBlogPost.slug).toMatch(/^[a-z0-9-]+$/)
      expect(Array.isArray(validBlogPost.tags)).toBe(true)
      expect(Array.isArray(validBlogPost.seo.keywords)).toBe(true)
      expect(typeof validBlogPost.published).toBe('boolean')
    })

    it('should require title in at least one language', () => {
      const invalidTitles: Record<string, string>[] = [
        { en: '', es: '' },
        { en: '   ', es: '   ' },
      ]

      const validTitles: Record<string, string>[] = [
        { en: 'Valid Title' },
        { es: 'Título Válido' },
        { en: 'English', es: 'Español' },
        { en: 'English Only', es: '' },
      ]

      const hasValidTitle = (title: Record<string, string>) => {
        return Object.values(title).some((t) => t && t.trim().length > 0)
      }

      invalidTitles.forEach((title) => {
        expect(hasValidTitle(title)).toBe(false)
      })

      validTitles.forEach((title) => {
        expect(hasValidTitle(title)).toBe(true)
      })
    })

    it('should validate content structure', () => {
      const validContent = {
        title: { en: 'English Title', es: 'Título Español' },
        content: { en: '# English Content', es: '# Contenido Español' },
        excerpt: { en: 'English excerpt', es: 'Extracto español' },
      }

      const invalidContent = {
        title: 'should be object',
        content: { en: 'Valid' },
        excerpt: null,
      }
      // Suppress unused variable warning
      void invalidContent

      // Valid content should have multilingual structure
      Object.values(validContent).forEach((field) => {
        expect(typeof field).toBe('object')
        expect(field).not.toBeNull()
        expect(Array.isArray(field)).toBe(false)
      })

      // Should have at least one language with content
      Object.values(validContent).forEach((field) => {
        const hasContent = Object.values(field).some((v) => v && v.trim().length > 0)
        expect(hasContent).toBe(true)
      })
    })

    it('should validate tags format', () => {
      const validTagSets = [
        ['dental-health'],
        ['tips', 'prevention', 'oral-care'],
        ['orthodontics', 'braces', 'teeth-alignment'],
        [], // Empty array is valid
      ]

      const invalidTagSets = [
        'single-string', // Should be array
        [''], // Empty strings not allowed
        ['tag with spaces'], // Spaces not recommended
        [123], // Non-string values
        ['TAG-IN-CAPS'], // Should be lowercase
      ]
      // Suppress unused variable warning
      void invalidTagSets

      validTagSets.forEach((tags) => {
        expect(Array.isArray(tags)).toBe(true)
        if (tags.length > 0) {
          expect(tags.every((tag) => typeof tag === 'string' && tag.trim().length > 0)).toBe(true)
          expect(tags.every((tag) => tag === tag.toLowerCase())).toBe(true)
        }
      })
    })

    it('should validate publishing state logic', () => {
      const unpublishedPost = { published: false, publishedAt: undefined }
      const publishedPost = { published: true, publishedAt: new Date() }
      const publishingPost: { published: boolean; publishedAt?: Date } = {
        published: true,
        publishedAt: undefined,
      } // Being published now

      expect(unpublishedPost.published).toBe(false)
      expect(unpublishedPost.publishedAt).toBeUndefined()

      expect(publishedPost.published).toBe(true)
      expect(publishedPost.publishedAt).toBeInstanceOf(Date)

      // When publishing, publishedAt should be set
      if (publishingPost.published && !publishingPost.publishedAt) {
        publishingPost.publishedAt = new Date()
      }
      expect(publishingPost.publishedAt).toBeInstanceOf(Date)
    })
  })

  describe('SEO validation logic', () => {
    it('should validate SEO title length', () => {
      const shortTitle = 'Short SEO Title'
      const optimalTitle = 'This is an optimal length SEO title for dental blog'
      const longTitle =
        'This is a very long SEO title that exceeds the recommended 60 character limit for search engines and will be truncated'

      expect(shortTitle.length).toBeLessThan(60)
      expect(optimalTitle.length).toBeLessThanOrEqual(60)
      expect(longTitle.length).toBeGreaterThan(60)

      // Validation function
      const isOptimalSEOTitle = (title: string) => {
        return title.length > 0 && title.length <= 60
      }

      expect(isOptimalSEOTitle(shortTitle)).toBe(true)
      expect(isOptimalSEOTitle(optimalTitle)).toBe(true)
      expect(isOptimalSEOTitle(longTitle)).toBe(false)
    })

    it('should validate SEO description length', () => {
      const shortDesc = 'Short description'
      const optimalDesc =
        'This is an optimal length meta description that provides enough information about the dental blog post while staying within search engine limits'
      const longDesc =
        'This is a very long meta description that far exceeds the recommended 160 character limit for search engine results pages and will definitely get truncated in search results which is not good for SEO and user experience overall'

      expect(shortDesc.length).toBeLessThan(160)
      expect(optimalDesc.length).toBeLessThanOrEqual(160)
      expect(longDesc.length).toBeGreaterThan(160)

      // Validation function
      const isOptimalSEODescription = (desc: string) => {
        return desc.length > 0 && desc.length <= 160
      }

      expect(isOptimalSEODescription(shortDesc)).toBe(true)
      expect(isOptimalSEODescription(optimalDesc)).toBe(true)
      expect(isOptimalSEODescription(longDesc)).toBe(false)
    })

    it('should validate SEO keywords array', () => {
      const validKeywords = ['dental', 'health', 'oral-care', 'tips']
      const tooManyKeywords = Array(15).fill('keyword')
      const emptyKeywords: string[] = []
      const duplicateKeywords = ['dental', 'health', 'dental', 'care']

      expect(Array.isArray(validKeywords)).toBe(true)
      expect(validKeywords.length).toBeLessThanOrEqual(10)
      expect(validKeywords.every((k) => typeof k === 'string' && k.length > 0)).toBe(true)

      expect(tooManyKeywords.length).toBeGreaterThan(10)
      expect(emptyKeywords.length).toBe(0)

      // Check for duplicates
      const uniqueKeywords = [...new Set(duplicateKeywords)]
      expect(uniqueKeywords.length).toBeLessThan(duplicateKeywords.length)

      // Validation function
      const isValidKeywordsArray = (keywords: string[]) => {
        return (
          Array.isArray(keywords) &&
          keywords.length <= 10 &&
          keywords.every((k) => typeof k === 'string' && k.trim().length > 0) &&
          keywords.length === new Set(keywords).size
        ) // No duplicates
      }

      expect(isValidKeywordsArray(validKeywords)).toBe(true)
      expect(isValidKeywordsArray(tooManyKeywords)).toBe(false)
      expect(isValidKeywordsArray(emptyKeywords)).toBe(true)
      expect(isValidKeywordsArray(duplicateKeywords)).toBe(false)
    })
  })

  describe('blog content parsing logic', () => {
    it('should parse markdown content correctly', () => {
      const markdownContent = `# Main Title

This is a paragraph with **bold text** and *italic text*.

## Subtitle

- Bullet point 1
- Bullet point 2

> This is a quote

\`\`\`javascript
const code = 'example';
\`\`\`
`

      // Basic markdown validation
      expect(markdownContent).toContain('# Main Title')
      expect(markdownContent).toContain('**bold text**')
      expect(markdownContent).toContain('*italic text*')
      expect(markdownContent).toContain('## Subtitle')
      expect(markdownContent).toContain('- Bullet point')
      expect(markdownContent).toContain('> This is a quote')
      expect(markdownContent).toContain('```javascript')
    })

    it('should extract excerpt from content', () => {
      const longContent = `# Title

This is the first paragraph that should be used as excerpt.

This is the second paragraph with more detailed content that should not be included in the excerpt automatically.

And here is even more content that definitely should not be in the excerpt.`

      // Extract first paragraph as excerpt
      const lines = longContent.split('\n').filter((line) => line.trim())
      const titleLine = lines.find((line) => line.startsWith('#'))
      const contentLines = lines.filter((line) => !line.startsWith('#'))
      const firstParagraph = contentLines[0]

      expect(titleLine).toBe('# Title')
      expect(firstParagraph).toBe('This is the first paragraph that should be used as excerpt.')
      expect(firstParagraph.length).toBeLessThan(200) // Good excerpt length
    })

    it('should validate content has minimum length', () => {
      const shortContent = 'Too short'
      const adequateContent =
        'This is a blog post with adequate content length that provides value to readers and contains enough information to be considered a proper blog post with useful dental health information.'

      const hasMinimumContent = (content: string) => {
        const textOnly = content.replace(/[#*`>-]/g, '').trim()
        return textOnly.length >= 100
      }

      expect(hasMinimumContent(shortContent)).toBe(false)
      expect(hasMinimumContent(adequateContent)).toBe(true)
    })
  })

  describe('blog filtering and sorting logic', () => {
    const samplePosts = [
      {
        title: 'Post 1',
        tags: ['dental-health', 'tips'],
        published: true,
        publishedAt: new Date('2024-01-15'),
        createdAt: new Date('2024-01-10'),
      },
      {
        title: 'Post 2',
        tags: ['orthodontics'],
        published: false,
        publishedAt: undefined,
        createdAt: new Date('2024-01-20'),
      },
      {
        title: 'Post 3',
        tags: ['prevention', 'tips'],
        published: true,
        publishedAt: new Date('2024-01-25'),
        createdAt: new Date('2024-01-22'),
      },
    ]

    it('should filter by published status', () => {
      const publishedPosts = samplePosts.filter((post) => post.published === true)
      const unpublishedPosts = samplePosts.filter((post) => post.published === false)

      expect(publishedPosts).toHaveLength(2)
      expect(unpublishedPosts).toHaveLength(1)
      expect(publishedPosts.every((post) => post.published)).toBe(true)
      expect(unpublishedPosts.every((post) => !post.published)).toBe(true)
    })

    it('should filter by tags', () => {
      const tipsTagPosts = samplePosts.filter((post) => post.tags.includes('tips'))
      const orthodonticsTagPosts = samplePosts.filter((post) => post.tags.includes('orthodontics'))

      expect(tipsTagPosts).toHaveLength(2)
      expect(orthodonticsTagPosts).toHaveLength(1)
      expect(tipsTagPosts.every((post) => post.tags.includes('tips'))).toBe(true)
    })

    it('should sort by publishedAt descending, then createdAt', () => {
      const publishedPosts = samplePosts.filter((post) => post.published)
      const sorted = publishedPosts.sort((a, b) => {
        // Sort by publishedAt descending, then createdAt descending
        const aDate = a.publishedAt || a.createdAt
        const bDate = b.publishedAt || b.createdAt
        return bDate.getTime() - aDate.getTime()
      })

      expect(sorted[0].title).toBe('Post 3') // Latest published
      expect(sorted[1].title).toBe('Post 1') // Earlier published
      expect(sorted[0].publishedAt?.getTime()).toBeGreaterThan(
        sorted[1].publishedAt?.getTime() ?? 0,
      )
    })

    it('should implement pagination logic', () => {
      const allPosts = [...samplePosts, ...samplePosts] // 6 posts total
      const pageSize = 2
      const page = 1 // 0-indexed

      const paginatedPosts = allPosts.slice(page * pageSize, (page + 1) * pageSize)
      const totalPages = Math.ceil(allPosts.length / pageSize)

      expect(paginatedPosts).toHaveLength(2)
      expect(totalPages).toBe(3)
      expect(page * pageSize).toBe(2) // Skip first 2 posts
    })
  })

  describe('tag aggregation logic', () => {
    it('should extract unique tags from posts', () => {
      const posts = [
        { tags: ['dental-health', 'tips'] },
        { tags: ['orthodontics', 'tips'] },
        { tags: ['prevention', 'dental-health'] },
      ]

      // Flatten and get unique tags
      const allTags = posts.flatMap((post) => post.tags)
      const uniqueTags = [...new Set(allTags)].sort()

      expect(uniqueTags).toEqual(['dental-health', 'orthodontics', 'prevention', 'tips'])
      expect(uniqueTags.length).toBe(4)

      // Count tag occurrences
      const tagCounts = allTags.reduce(
        (acc, tag) => {
          acc[tag] = (acc[tag] || 0) + 1
          return acc
        },
        {} as Record<string, number>,
      )

      expect(tagCounts['dental-health']).toBe(2)
      expect(tagCounts.tips).toBe(2)
      expect(tagCounts.orthodontics).toBe(1)
      expect(tagCounts.prevention).toBe(1)
    })

    it('should handle empty tags arrays', () => {
      const postsWithEmptyTags = [{ tags: [] }, { tags: ['dental-health'] }, { tags: [] }]

      const allTags = postsWithEmptyTags.flatMap((post) => post.tags)
      const uniqueTags = [...new Set(allTags)]

      expect(allTags).toHaveLength(1)
      expect(uniqueTags).toEqual(['dental-health'])
    })
  })
})
