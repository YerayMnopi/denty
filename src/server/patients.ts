// Server functions for patient management

import { createServerFn } from '@tanstack/react-start'
import { ObjectId } from 'mongodb'
import { getAppointmentsCollection, getPatientsCollection, type Patient } from '@/lib/collections'

export interface PatientFilters {
  clinicId: string
  search?: string
  tag?: string
  segment?: 'all' | 'active' | 'inactive' | 'new'
}

export interface PatientListItem {
  _id: string
  name: string
  phone: string
  email?: string
  tags: string[]
  lastVisit?: string
  nextAppointment?: string
  totalVisits: number
}

export const getPatients = createServerFn({ method: 'GET' })
  .inputValidator((input: PatientFilters) => input)
  .handler(async ({ data }): Promise<PatientListItem[]> => {
    const patientsCol = await getPatientsCollection()

    const query: Record<string, unknown> = { clinicId: new ObjectId(data.clinicId) }

    if (data.search?.trim()) {
      query.$or = [
        { name: { $regex: data.search.trim(), $options: 'i' } },
        { phone: { $regex: data.search.trim(), $options: 'i' } },
        { email: { $regex: data.search.trim(), $options: 'i' } },
      ]
    }

    if (data.tag) {
      query.tags = data.tag
    }

    const patients = await patientsCol.find(query).toArray()

    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const filteredPatients = patients.filter((patient) => {
      if (data.segment === 'active') {
        return patient.lastVisit && patient.lastVisit > sixMonthsAgo
      }
      if (data.segment === 'inactive') {
        return !patient.lastVisit || patient.lastVisit <= sixMonthsAgo
      }
      if (data.segment === 'new') {
        return patient.visitHistory.length <= 1
      }
      return true
    })

    return filteredPatients.map((patient) => ({
      _id: patient._id.toHexString(),
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      tags: patient.tags,
      lastVisit: patient.lastVisit?.toISOString(),
      nextAppointment: patient.nextAppointment?.toISOString(),
      totalVisits: patient.visitHistory.length,
    }))
  })

export interface PatientDetail {
  _id: string
  clinicId: string
  name: string
  phone: string
  email?: string
  channels: { preferred?: string; whatsappId?: string; instagramId?: string }
  visitHistory: { appointmentId: string; service: string; date: string; doctorName: string }[]
  tags: string[]
  notes?: string
  lastVisit?: string
  nextAppointment?: string
  createdAt: string
  updatedAt: string
}

function serializePatient(p: Patient): PatientDetail {
  return {
    _id: p._id.toHexString(),
    clinicId: p.clinicId.toHexString(),
    name: p.name,
    phone: p.phone,
    email: p.email,
    channels: p.channels,
    visitHistory: p.visitHistory.map((v) => ({
      appointmentId: v.appointmentId.toHexString(),
      service: v.service,
      date: v.date.toISOString(),
      doctorName: v.doctorName,
    })),
    tags: p.tags,
    notes: p.notes,
    lastVisit: p.lastVisit?.toISOString(),
    nextAppointment: p.nextAppointment?.toISOString(),
    createdAt: p.createdAt.toISOString(),
    updatedAt: p.updatedAt.toISOString(),
  }
}

export const getPatient = createServerFn({ method: 'GET' })
  .inputValidator((input: { patientId: string }) => input)
  .handler(async ({ data }): Promise<PatientDetail | null> => {
    const patientsCol = await getPatientsCollection()
    const patient = await patientsCol.findOne({ _id: new ObjectId(data.patientId) })
    return patient ? serializePatient(patient) : null
  })

export const createOrUpdatePatient = createServerFn({ method: 'POST' })
  .inputValidator(
    (input: {
      clinicId: string
      phone: string
      name: string
      email?: string
      appointmentId?: string
      service?: string
      doctorName?: string
      appointmentDate?: string
    }) => input,
  )
  .handler(async ({ data }): Promise<void> => {
    const patientsCol = await getPatientsCollection()
    const now = new Date()
    const clinicId = new ObjectId(data.clinicId)

    const existing = await patientsCol.findOne({
      clinicId,
      phone: data.phone,
    })

    if (existing) {
      const updateFields: Record<string, unknown> = {
        name: data.name,
        updatedAt: now,
      }

      if (data.email) {
        updateFields.email = data.email
      }

      if (data.appointmentDate) {
        updateFields.lastVisit = new Date(data.appointmentDate)
      }

      const updateOp: Record<string, unknown> = { $set: updateFields }

      if (data.appointmentId && data.service && data.doctorName && data.appointmentDate) {
        updateOp.$push = {
          visitHistory: {
            appointmentId: new ObjectId(data.appointmentId),
            service: data.service,
            date: new Date(data.appointmentDate),
            doctorName: data.doctorName,
          },
        }
      }

      await patientsCol.updateOne({ _id: existing._id }, updateOp)
    } else {
      const newPatient: Omit<Patient, '_id'> = {
        clinicId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        channels: {},
        visitHistory:
          data.appointmentId && data.service && data.doctorName && data.appointmentDate
            ? [
                {
                  appointmentId: new ObjectId(data.appointmentId),
                  service: data.service,
                  date: new Date(data.appointmentDate),
                  doctorName: data.doctorName,
                },
              ]
            : [],
        tags: ['new-patient'],
        lastVisit: data.appointmentDate ? new Date(data.appointmentDate) : undefined,
        createdAt: now,
        updatedAt: now,
      }

      await patientsCol.insertOne(newPatient as Patient)
    }
  })

export const addPatientTag = createServerFn({ method: 'POST' })
  .inputValidator((input: { patientId: string; tag: string }) => input)
  .handler(async ({ data }): Promise<void> => {
    const patientsCol = await getPatientsCollection()
    await patientsCol.updateOne(
      { _id: new ObjectId(data.patientId) },
      {
        $addToSet: { tags: data.tag },
        $set: { updatedAt: new Date() },
      },
    )
  })

export const removePatientTag = createServerFn({ method: 'POST' })
  .inputValidator((input: { patientId: string; tag: string }) => input)
  .handler(async ({ data }): Promise<void> => {
    const patientsCol = await getPatientsCollection()
    await patientsCol.updateOne(
      { _id: new ObjectId(data.patientId) },
      {
        $pull: { tags: data.tag },
        $set: { updatedAt: new Date() },
      },
    )
  })

export const updatePatientNotes = createServerFn({ method: 'POST' })
  .inputValidator((input: { patientId: string; notes: string }) => input)
  .handler(async ({ data }): Promise<void> => {
    const patientsCol = await getPatientsCollection()
    await patientsCol.updateOne(
      { _id: new ObjectId(data.patientId) },
      {
        $set: {
          notes: data.notes.trim() || undefined,
          updatedAt: new Date(),
        },
      },
    )
  })

export const getInactivePatients = createServerFn({ method: 'GET' })
  .inputValidator((input: { clinicId: string }) => input)
  .handler(async ({ data }): Promise<PatientListItem[]> => {
    const patientsCol = await getPatientsCollection()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const patients = await patientsCol
      .find({
        clinicId: new ObjectId(data.clinicId),
        $or: [{ lastVisit: { $lt: sixMonthsAgo } }, { lastVisit: { $exists: false } }],
      })
      .toArray()

    return patients.map((p) => ({
      _id: p._id.toHexString(),
      name: p.name,
      phone: p.phone,
      email: p.email,
      tags: p.tags,
      lastVisit: p.lastVisit?.toISOString(),
      nextAppointment: p.nextAppointment?.toISOString(),
      totalVisits: p.visitHistory.length,
    }))
  })

export const getUpcomingReminders = createServerFn({ method: 'GET' })
  .inputValidator((input: { timeFrame: '24h' | '1h' }) => input)
  .handler(async ({ data }): Promise<string> => {
    const appointmentsCol = await getAppointmentsCollection()
    const now = new Date()

    let startTime: Date
    let endTime: Date

    if (data.timeFrame === '24h') {
      startTime = new Date(now.getTime() + 23 * 60 * 60 * 1000)
      endTime = new Date(now.getTime() + 25 * 60 * 60 * 1000)
    } else {
      startTime = new Date(now.getTime() + 50 * 60 * 1000)
      endTime = new Date(now.getTime() + 70 * 60 * 1000)
    }

    const appointments = await appointmentsCol
      .find({
        date: { $gte: startTime, $lte: endTime },
        status: { $in: ['pending', 'confirmed'] },
      })
      .toArray()

    return JSON.stringify(appointments)
  })
