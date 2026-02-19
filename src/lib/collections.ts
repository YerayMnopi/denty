import type { ObjectId } from 'mongodb'
import { getDb } from './db'

// ─── Clinic ──────────────────────────────────────────────

export interface Clinic {
  _id: ObjectId
  slug: string
  name: string
  description: Record<string, string>
  address: {
    street: string
    city: string
    zip: string
    coordinates?: [number, number]
  }
  phone: string
  email: string
  website?: string
  logo?: string
  managementSystem: 'manual' | 'gesden' | 'klinicare' | string
  managementConfig?: Record<string, unknown>
  workingHours: { day: number; open: string; close: string }[]
  services: {
    name: Record<string, string>
    duration: number
    price?: number
  }[]
  adminEmail: string
  adminPasswordHash: string
  plan?: 'starter' | 'professional' | 'enterprise'
  trialStartDate?: Date
  trialEndDate?: Date
  onboardingComplete?: boolean
  createdAt: Date
  updatedAt: Date
}

// ─── Doctor ──────────────────────────────────────────────

export interface Doctor {
  _id: ObjectId
  slug: string
  clinicId: ObjectId
  name: string
  specialization: Record<string, string>
  bio: Record<string, string>
  photo?: string
  schedule: { day: number; startTime: string; endTime: string }[]
  services: string[]
  createdAt: Date
}

// ─── Appointment ─────────────────────────────────────────

export interface Appointment {
  _id: ObjectId
  clinicId: ObjectId
  doctorId: ObjectId
  patientName: string
  patientPhone: string
  patientEmail?: string
  service: string
  date: Date
  duration: number
  status: 'pending' | 'confirmed' | 'cancelled' | 'completed'
  externalId?: string
  notes?: string
  whatsappSent: boolean
  emailSent: boolean
  createdAt: Date
}

// ─── Chat Session ────────────────────────────────────────

export interface ChatSession {
  _id: ObjectId
  clinicId?: ObjectId
  sessionId: string
  messages: {
    role: 'user' | 'assistant'
    content: string
    timestamp: Date
  }[]
  createdAt: Date
  updatedAt: Date
}

// ─── Patient ─────────────────────────────────────────────

export interface Patient {
  _id: ObjectId
  clinicId: ObjectId
  name: string
  phone: string
  email?: string
  channels: { preferred?: string; whatsappId?: string; instagramId?: string }
  visitHistory: { appointmentId: ObjectId; service: string; date: Date; doctorName: string }[]
  tags: string[]
  notes?: string
  lastVisit?: Date
  nextAppointment?: Date
  createdAt: Date
  updatedAt: Date
}

// ─── Collection Accessors ────────────────────────────────

export async function getClinicsCollection() {
  const db = await getDb()
  return db.collection<Clinic>('clinics')
}

export async function getDoctorsCollection() {
  const db = await getDb()
  return db.collection<Doctor>('doctors')
}

export async function getAppointmentsCollection() {
  const db = await getDb()
  return db.collection<Appointment>('appointments')
}

export async function getChatSessionsCollection() {
  const db = await getDb()
  return db.collection<ChatSession>('chat_sessions')
}

export async function getPatientsCollection() {
  const db = await getDb()
  return db.collection<Patient>('patients')
}

// ─── Website ─────────────────────────────────────────────

export interface Website {
  _id: ObjectId
  clinicId: ObjectId
  domain?: string
  subdomain: string // e.g., 'clinica-dental-sonrisa' for clinica-dental-sonrisa.denty.es
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
  createdAt: Date
  updatedAt: Date
}

// ─── Blog Post ───────────────────────────────────────────

export interface BlogPost {
  _id: ObjectId
  clinicId: ObjectId
  slug: string
  title: Record<string, string>
  content: Record<string, string> // markdown content
  excerpt: Record<string, string>
  author: string
  authorId: ObjectId
  tags: string[]
  published: boolean
  seo: {
    title: Record<string, string>
    description: Record<string, string>
    keywords: string[]
  }
  publishedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export async function getWebsitesCollection() {
  const db = await getDb()
  return db.collection<Website>('websites')
}

export async function getBlogPostsCollection() {
  const db = await getDb()
  return db.collection<BlogPost>('blog_posts')
}
