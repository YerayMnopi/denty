import { createServerFn } from '@tanstack/react-start'
import { ObjectId } from 'mongodb'
import { getClinicsCollection, getWebsitesCollection, type Website } from '@/lib/collections'

// ─── Serialized Types ────────────────────────────────────

export interface SerializedWebsite {
  _id: string
  clinicId: string
  domain?: string
  subdomain: string
  settings: Website['settings']
  content: Website['content']
  createdAt: string
  updatedAt: string
}

function serializeWebsite(w: Website): SerializedWebsite {
  return {
    _id: w._id.toHexString(),
    clinicId: w.clinicId.toHexString(),
    domain: w.domain,
    subdomain: w.subdomain,
    settings: w.settings,
    content: w.content,
    createdAt: w.createdAt.toISOString(),
    updatedAt: w.updatedAt.toISOString(),
  }
}

// ─── Input Types ─────────────────────────────────────────

export interface CreateWebsiteInput {
  clinicId: string
  subdomain: string
  domain?: string
  settings: {
    name: Record<string, string>
    theme: {
      primaryColor: string
      secondaryColor: string
      logo?: string
      favicon?: string
    }
    pages: {
      homepage: boolean
      services: boolean
      team: boolean
      contact: boolean
      blog: boolean
    }
    seo: {
      title: Record<string, string>
      description: Record<string, string>
      keywords: string[]
    }
  }
  content: {
    homepage: {
      hero: Record<string, string>
      about: Record<string, string>
      callToAction: Record<string, string>
    }
    services: {
      title: Record<string, string>
      description: Record<string, string>
    }
    team: {
      title: Record<string, string>
      description: Record<string, string>
    }
    contact: {
      title: Record<string, string>
      description: Record<string, string>
    }
  }
}

export interface UpdateWebsiteInput {
  websiteId: string
  updates: {
    domain?: string
    settings?: {
      name?: Record<string, string>
      theme?: {
        primaryColor?: string
        secondaryColor?: string
        logo?: string
        favicon?: string
      }
      pages?: {
        homepage?: boolean
        services?: boolean
        team?: boolean
        contact?: boolean
        blog?: boolean
      }
      seo?: {
        title?: Record<string, string>
        description?: Record<string, string>
        keywords?: string[]
      }
    }
    content?: {
      homepage?: {
        hero?: Record<string, string>
        about?: Record<string, string>
        callToAction?: Record<string, string>
      }
      services?: {
        title?: Record<string, string>
        description?: Record<string, string>
      }
      team?: {
        title?: Record<string, string>
        description?: Record<string, string>
      }
      contact?: {
        title?: Record<string, string>
        description?: Record<string, string>
      }
    }
  }
}

// ─── Server Functions ────────────────────────────────────

export const createWebsite = createServerFn()
  .inputValidator((input: CreateWebsiteInput) => input)
  .handler(async ({ data }): Promise<SerializedWebsite> => {
    const websitesCollection = await getWebsitesCollection()
    
    // Validate clinic exists
    const clinicsCollection = await getClinicsCollection()
    const clinic = await clinicsCollection.findOne({ _id: new ObjectId(data.clinicId) })
    if (!clinic) {
      throw new Error('Clinic not found')
    }

    // Check if website already exists for this clinic
    const existingWebsite = await websitesCollection.findOne({ clinicId: new ObjectId(data.clinicId) })
    if (existingWebsite) {
      throw new Error('Website already exists for this clinic')
    }

    // Check if subdomain is already taken
    const existingSubdomain = await websitesCollection.findOne({ subdomain: data.subdomain })
    if (existingSubdomain) {
      throw new Error('Subdomain is already taken')
    }

    const website: Omit<Website, '_id'> = {
      clinicId: new ObjectId(data.clinicId),
      subdomain: data.subdomain,
      domain: data.domain,
      settings: data.settings,
      content: data.content,
      createdAt: new Date(),
      updatedAt: new Date(),
    }

    const result = await websitesCollection.insertOne(website)
    return serializeWebsite({ ...website, _id: result.insertedId })
  })

export const getWebsite = createServerFn()
  .inputValidator((input: { clinicId: string }) => input)
  .handler(async ({ data }): Promise<SerializedWebsite | null> => {
    const websitesCollection = await getWebsitesCollection()
    const website = await websitesCollection.findOne({ clinicId: new ObjectId(data.clinicId) })
    return website ? serializeWebsite(website) : null
  })

export const getWebsiteBySubdomain = createServerFn()
  .inputValidator((input: { subdomain: string }) => input)
  .handler(async ({ data }): Promise<SerializedWebsite | null> => {
    const websitesCollection = await getWebsitesCollection()
    const website = await websitesCollection.findOne({ subdomain: data.subdomain })
    return website ? serializeWebsite(website) : null
  })

export const updateWebsite = createServerFn()
  .inputValidator((input: UpdateWebsiteInput) => input)
  .handler(async ({ data }): Promise<SerializedWebsite | null> => {
    const websitesCollection = await getWebsitesCollection()
    
    const updateDoc: any = { updatedAt: new Date() }
    
    if (data.updates.domain !== undefined) {
      updateDoc.domain = data.updates.domain
    }
    
    if (data.updates.settings) {
      if (data.updates.settings.name) updateDoc['settings.name'] = data.updates.settings.name
      if (data.updates.settings.theme) {
        Object.entries(data.updates.settings.theme).forEach(([key, value]) => {
          if (value !== undefined) {
            updateDoc[`settings.theme.${key}`] = value
          }
        })
      }
      if (data.updates.settings.pages) {
        Object.entries(data.updates.settings.pages).forEach(([key, value]) => {
          if (value !== undefined) {
            updateDoc[`settings.pages.${key}`] = value
          }
        })
      }
      if (data.updates.settings.seo) {
        Object.entries(data.updates.settings.seo).forEach(([key, value]) => {
          if (value !== undefined) {
            updateDoc[`settings.seo.${key}`] = value
          }
        })
      }
    }
    
    if (data.updates.content) {
      Object.entries(data.updates.content).forEach(([section, sectionData]) => {
        if (sectionData) {
          Object.entries(sectionData).forEach(([key, value]) => {
            if (value !== undefined) {
              updateDoc[`content.${section}.${key}`] = value
            }
          })
        }
      })
    }

    const result = await websitesCollection.findOneAndUpdate(
      { _id: new ObjectId(data.websiteId) },
      { $set: updateDoc },
      { returnDocument: 'after' }
    )
    
    return result ? serializeWebsite(result) : null
  })

export const deleteWebsite = createServerFn()
  .inputValidator((input: { websiteId: string }) => input)
  .handler(async ({ data }): Promise<boolean> => {
    const websitesCollection = await getWebsitesCollection()
    
    const result = await websitesCollection.deleteOne({ _id: new ObjectId(data.websiteId) })
    return result.deletedCount > 0
  })