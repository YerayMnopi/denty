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
