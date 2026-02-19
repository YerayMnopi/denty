import { createServerFn } from '@tanstack/react-start'
import { ObjectId } from 'mongodb'
import { type BlogPost, getBlogPostsCollection, getClinicsCollection } from '@/lib/collections'

// ─── Input Types ─────────────────────────────────────────

export interface CreateBlogPostInput {
  clinicId: string
  title: Record<string, string>
  content: Record<string, string>
  excerpt: Record<string, string>
  author: string
  authorId: string
  tags: string[]
  seo: {
    title: Record<string, string>
    description: Record<string, string>
    keywords: string[]
  }
  published?: boolean
}

export interface UpdateBlogPostInput {
  postId: string
  updates: {
    title?: Record<string, string>
    content?: Record<string, string>
    excerpt?: Record<string, string>
    author?: string
    tags?: string[]
    seo?: {
      title?: Record<string, string>
      description?: Record<string, string>
      keywords?: string[]
    }
    published?: boolean
  }
}

export interface GetBlogPostsInput {
  clinicId: string
  published?: boolean
  limit?: number
  skip?: number
  tags?: string[]
}

// ─── Serialized Types ────────────────────────────────────

export interface SerializedBlogPost {
  _id: string
  clinicId: string
  slug: string
  title: Record<string, string>
  content: Record<string, string>
  excerpt: Record<string, string>
  author: string
  authorId: string
  tags: string[]
  published: boolean
  seo: {
    title: Record<string, string>
    description: Record<string, string>
    keywords: string[]
  }
  publishedAt?: string
  createdAt: string
  updatedAt: string
}

function serializeBlogPost(p: BlogPost): SerializedBlogPost {
  return {
    _id: p._id.toHexString(),
    clinicId: p.clinicId.toHexString(),
    slug: p.slug,
    title: p.title,
    content: p.content,
    excerpt: p.excerpt,
    author: p.author,
    authorId: p.authorId.toHexString(),
    tags: p.tags,
    published: p.published,
    seo: p.seo,
    publishedAt: p.publishedAt?.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

// ─── Helper Functions ────────────────────────────────────

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Remove accents
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single hyphen
}

async function generateUniqueSlug(
  clinicId: string,
  title: string,
  excludeId?: string,
): Promise<string> {
  const blogPostsCollection = await getBlogPostsCollection()
  const baseSlug = generateSlug(title)
  let slug = baseSlug
  let counter = 1

  while (true) {
    const query: Record<string, unknown> = {
      clinicId: new ObjectId(clinicId),
      slug,
    }

    if (excludeId) {
      query._id = { $ne: new ObjectId(excludeId) }
    }

    const existing = await blogPostsCollection.findOne(query)

    if (!existing) {
      return slug
    }

    slug = `${baseSlug}-${counter}`
    counter++
  }
}

// ─── Server Functions ────────────────────────────────────

export const createBlogPost = createServerFn()
  .inputValidator((input: CreateBlogPostInput) => input)
  .handler(async ({ data }): Promise<SerializedBlogPost> => {
    const blogPostsCollection = await getBlogPostsCollection()

    // Validate clinic exists
    const clinicsCollection = await getClinicsCollection()
    const clinic = await clinicsCollection.findOne({ _id: new ObjectId(data.clinicId) })
    if (!clinic) {
      throw new Error('Clinic not found')
    }

    // Generate unique slug from title (prefer English, fallback to any language)
    const titleForSlug = data.title.en || data.title.es || Object.values(data.title)[0]
    if (!titleForSlug) {
      throw new Error('Title is required in at least one language')
    }

    const slug = await generateUniqueSlug(data.clinicId, titleForSlug)

    const blogPost: Omit<BlogPost, '_id'> = {
      clinicId: new ObjectId(data.clinicId),
      slug,
      title: data.title,
      content: data.content,
      excerpt: data.excerpt,
      author: data.author,
      authorId: new ObjectId(data.authorId),
      tags: data.tags,
      published: data.published || false,
      seo: data.seo,
      publishedAt: data.published || false ? new Date() : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await blogPostsCollection.insertOne(blogPost)
    return serializeBlogPost({ ...blogPost, _id: result.insertedId })
  })

export const getBlogPost = createServerFn()
  .inputValidator((input: { clinicId: string; slug: string }) => input)
  .handler(async ({ data }): Promise<SerializedBlogPost | null> => {
    const blogPostsCollection = await getBlogPostsCollection()
    const post = await blogPostsCollection.findOne({
      clinicId: new ObjectId(data.clinicId),
      slug: data.slug,
    })
    return post ? serializeBlogPost(post) : null
  })

export const getBlogPostById = createServerFn()
  .inputValidator((input: { postId: string }) => input)
  .handler(async ({ data }): Promise<SerializedBlogPost | null> => {
    const blogPostsCollection = await getBlogPostsCollection()
    const post = await blogPostsCollection.findOne({ _id: new ObjectId(data.postId) })
    return post ? serializeBlogPost(post) : null
  })

export const getBlogPosts = createServerFn()
  .inputValidator((input: GetBlogPostsInput) => input)
  .handler(async ({ data }): Promise<{ posts: SerializedBlogPost[]; total: number }> => {
    const blogPostsCollection = await getBlogPostsCollection()

    // Apply defaults
    const limit = data.limit || 10
    const skip = data.skip || 0

    const query: Record<string, unknown> = { clinicId: new ObjectId(data.clinicId) }

    if (data.published !== undefined) {
      query.published = data.published
    }

    if (data.tags && data.tags.length > 0) {
      query.tags = { $in: data.tags }
    }

    const [posts, total] = await Promise.all([
      blogPostsCollection
        .find(query)
        .sort({ publishedAt: -1, createdAt: -1 })
        .skip(skip)
        .limit(limit)
        .toArray(),
      blogPostsCollection.countDocuments(query),
    ])

    return { posts: posts.map(serializeBlogPost), total }
  })

export const updateBlogPost = createServerFn()
  .inputValidator((input: UpdateBlogPostInput) => input)
  .handler(async ({ data }): Promise<SerializedBlogPost | null> => {
    const blogPostsCollection = await getBlogPostsCollection()

    // Get existing post to check for slug changes
    const existingPost = await blogPostsCollection.findOne({ _id: new ObjectId(data.postId) })
    if (!existingPost) {
      throw new Error('Blog post not found')
    }

    const updateDoc: Record<string, unknown> = { updatedAt: new Date() }

    if (data.updates.title) {
      updateDoc.title = data.updates.title

      // Regenerate slug if title changed
      const newTitleForSlug =
        data.updates.title.en || data.updates.title.es || Object.values(data.updates.title)[0]
      if (newTitleForSlug) {
        const currentTitleForSlug =
          existingPost.title.en || existingPost.title.es || Object.values(existingPost.title)[0]
        if (newTitleForSlug !== currentTitleForSlug) {
          updateDoc.slug = await generateUniqueSlug(
            existingPost.clinicId.toString(),
            newTitleForSlug,
            data.postId,
          )
        }
      }
    }

    if (data.updates.content) updateDoc.content = data.updates.content
    if (data.updates.excerpt) updateDoc.excerpt = data.updates.excerpt
    if (data.updates.author) updateDoc.author = data.updates.author
    if (data.updates.tags) updateDoc.tags = data.updates.tags

    if (data.updates.seo) {
      if (data.updates.seo.title) updateDoc['seo.title'] = data.updates.seo.title
      if (data.updates.seo.description) updateDoc['seo.description'] = data.updates.seo.description
      if (data.updates.seo.keywords) updateDoc['seo.keywords'] = data.updates.seo.keywords
    }

    // Handle publishing state change
    if (data.updates.published !== undefined) {
      updateDoc.published = data.updates.published
      if (data.updates.published && !existingPost.published) {
        // First time publishing
        updateDoc.publishedAt = new Date()
      } else if (!data.updates.published) {
        // Unpublishing
        updateDoc.publishedAt = null
      }
    }

    const result = await blogPostsCollection.findOneAndUpdate(
      { _id: new ObjectId(data.postId) },
      { $set: updateDoc },
      { returnDocument: 'after' },
    )

    return result ? serializeBlogPost(result) : null
  })

export const deleteBlogPost = createServerFn()
  .inputValidator((input: { postId: string }) => input)
  .handler(async ({ data }): Promise<boolean> => {
    const blogPostsCollection = await getBlogPostsCollection()

    const result = await blogPostsCollection.deleteOne({ _id: new ObjectId(data.postId) })
    return result.deletedCount > 0
  })

export const getBlogPostTags = createServerFn()
  .inputValidator((input: { clinicId: string }) => input)
  .handler(async ({ data }): Promise<string[]> => {
    const blogPostsCollection = await getBlogPostsCollection()

    const pipeline = [
      { $match: { clinicId: new ObjectId(data.clinicId) } },
      { $unwind: '$tags' },
      { $group: { _id: '$tags' } },
      { $sort: { _id: 1 } },
    ]

    const result = await blogPostsCollection.aggregate<{ _id: string }>(pipeline).toArray()
    return result.map((item) => item._id)
  })
