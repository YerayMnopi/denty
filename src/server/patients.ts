// Server functions for patient management

import { createServerFn } from '@tanstack/react-start'
import type { ObjectId } from 'mongodb'
import { getAppointmentsCollection, getPatientsCollection, type Patient } from '@/lib/collections'

export interface PatientFilters {
  clinicId: ObjectId
  search?: string
  tag?: string
  segment?: 'all' | 'active' | 'inactive' | 'new'
}

export interface PatientListItem {
  _id: ObjectId
  name: string
  phone: string
  email?: string
  tags: string[]
  lastVisit?: Date
  nextAppointment?: Date
  totalVisits: number
}

export const getPatients = createServerFn({ method: 'GET' })
  .inputValidator((input: PatientFilters) => input)
  .handler(async ({ data }): Promise<PatientListItem[]> => {
    const patientsCol = await getPatientsCollection()

    // Build query
    const query: Record<string, unknown> = { clinicId: data.clinicId }

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

    // Get patients
    const patients = await patientsCol.find(query).toArray()

    // Filter by segment
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
      return true // 'all'
    })

    // Transform to list items
    return filteredPatients.map((patient) => ({
      _id: patient._id,
      name: patient.name,
      phone: patient.phone,
      email: patient.email,
      tags: patient.tags,
      lastVisit: patient.lastVisit,
      nextAppointment: patient.nextAppointment,
      totalVisits: patient.visitHistory.length,
    }))
  })

export const getPatient = createServerFn({ method: 'GET' })
  .inputValidator((input: { patientId: ObjectId }) => input)
  .handler(async ({ data }): Promise<Patient | null> => {
    const patientsCol = await getPatientsCollection()
    return await patientsCol.findOne({ _id: data.patientId })
  })

export const createOrUpdatePatient = createServerFn({ method: 'POST' })
  .inputValidator(
    (input: {
      clinicId: ObjectId
      phone: string
      name: string
      email?: string
      appointmentId?: ObjectId
      service?: string
      doctorName?: string
      appointmentDate?: Date
    }) => input,
  )
  .handler(async ({ data }): Promise<Patient> => {
    const patientsCol = await getPatientsCollection()
    const now = new Date()

    // Find existing patient by phone and clinic
    const existing = await patientsCol.findOne({
      clinicId: data.clinicId,
      phone: data.phone,
    })

    if (existing) {
      // Update existing patient
      const updateData: Record<string, unknown> = {
        name: data.name,
        updatedAt: now,
      }

      if (data.email) {
        updateData.email = data.email
      }

      // Add visit history if provided
      if (data.appointmentId && data.service && data.doctorName && data.appointmentDate) {
        updateData.$push = {
          visitHistory: {
            appointmentId: data.appointmentId,
            service: data.service,
            date: data.appointmentDate,
            doctorName: data.doctorName,
          },
        }
        updateData.lastVisit = data.appointmentDate
      }

      await patientsCol.updateOne({ _id: existing._id }, { $set: updateData })

      const updated = await patientsCol.findOne({ _id: existing._id })
      if (!updated) {
        throw new Error('Failed to retrieve updated patient')
      }
      return updated
    } else {
      // Create new patient
      const newPatient: Omit<Patient, '_id'> = {
        clinicId: data.clinicId,
        name: data.name,
        phone: data.phone,
        email: data.email,
        channels: {},
        visitHistory:
          data.appointmentId && data.service && data.doctorName && data.appointmentDate
            ? [
                {
                  appointmentId: data.appointmentId,
                  service: data.service,
                  date: data.appointmentDate,
                  doctorName: data.doctorName,
                },
              ]
            : [],
        tags: ['new-patient'],
        lastVisit: data.appointmentDate,
        createdAt: now,
        updatedAt: now,
      }

      const result = await patientsCol.insertOne(newPatient as Patient)
      const created = await patientsCol.findOne({ _id: result.insertedId })
      if (!created) {
        throw new Error('Failed to retrieve created patient')
      }
      return created
    }
  })

export const addPatientTag = createServerFn({ method: 'POST' })
  .inputValidator((input: { patientId: ObjectId; tag: string }) => input)
  .handler(async ({ data }): Promise<void> => {
    const patientsCol = await getPatientsCollection()
    await patientsCol.updateOne(
      { _id: data.patientId },
      {
        $addToSet: { tags: data.tag },
        $set: { updatedAt: new Date() },
      },
    )
  })

export const removePatientTag = createServerFn({ method: 'POST' })
  .inputValidator((input: { patientId: ObjectId; tag: string }) => input)
  .handler(async ({ data }): Promise<void> => {
    const patientsCol = await getPatientsCollection()
    await patientsCol.updateOne(
      { _id: data.patientId },
      {
        $pull: { tags: data.tag },
        $set: { updatedAt: new Date() },
      },
    )
  })

export const updatePatientNotes = createServerFn({ method: 'POST' })
  .inputValidator((input: { patientId: ObjectId; notes: string }) => input)
  .handler(async ({ data }): Promise<void> => {
    const patientsCol = await getPatientsCollection()
    await patientsCol.updateOne(
      { _id: data.patientId },
      {
        $set: {
          notes: data.notes.trim() || undefined,
          updatedAt: new Date(),
        },
      },
    )
  })

export const getInactivePatients = createServerFn({ method: 'GET' })
  .inputValidator((input: { clinicId: ObjectId }) => input)
  .handler(async ({ data }): Promise<Patient[]> => {
    const patientsCol = await getPatientsCollection()
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    return await patientsCol
      .find({
        clinicId: data.clinicId,
        $or: [{ lastVisit: { $lt: sixMonthsAgo } }, { lastVisit: { $exists: false } }],
      })
      .toArray()
  })

export const getUpcomingReminders = createServerFn({ method: 'GET' })
  .inputValidator((input: { timeFrame: '24h' | '1h' }) => input)
  .handler(async ({ data }): Promise<unknown[]> => {
    const appointmentsCol = await getAppointmentsCollection()
    const now = new Date()

    let startTime: Date
    let endTime: Date

    if (data.timeFrame === '24h') {
      // 24 hours from now
      startTime = new Date(now.getTime() + 23 * 60 * 60 * 1000) // 23h from now
      endTime = new Date(now.getTime() + 25 * 60 * 60 * 1000) // 25h from now
    } else {
      // 1 hour from now
      startTime = new Date(now.getTime() + 50 * 60 * 1000) // 50min from now
      endTime = new Date(now.getTime() + 70 * 60 * 1000) // 70min from now
    }

    return await appointmentsCol
      .find({
        date: { $gte: startTime, $lte: endTime },
        status: { $in: ['pending', 'confirmed'] },
      })
      .toArray()
  })
