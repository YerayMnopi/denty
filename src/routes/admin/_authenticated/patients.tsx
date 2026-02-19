import { createFileRoute } from '@tanstack/react-router'
import { MessageCircle, Plus, Search, Tag, Users, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { getAllPatientTags, type MockPatient, mockPatients } from '@/data/patient-mock'

export const Route = createFileRoute('/admin/_authenticated/patients')({
  component: AdminPatientsPage,
})

interface PatientWithStats extends MockPatient {
  totalVisits: number
}

function AdminPatientsPage() {
  const { t } = useTranslation()
  const [patients] = useState<PatientWithStats[]>(
    mockPatients.map((p) => ({
      ...p,
      totalVisits: p.visitHistory.length,
    })),
  )

  const [searchQuery, setSearchQuery] = useState('')
  const [selectedTag, setSelectedTag] = useState<string>('all')
  const [selectedSegment, setSelectedSegment] = useState<'all' | 'active' | 'inactive' | 'new'>(
    'all',
  )
  const [selectedPatient, setSelectedPatient] = useState<PatientWithStats | null>(null)
  const [newTag, setNewTag] = useState('')
  const [editingNotes, setEditingNotes] = useState<string | null>(null)
  const [notes, setNotes] = useState('')

  const allTags = getAllPatientTags()

  // Filter patients
  const filteredPatients = useMemo(() => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    return patients.filter((patient) => {
      // Search filter
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase()
        if (
          !patient.name.toLowerCase().includes(query) &&
          !patient.phone.includes(query) &&
          !patient.email?.toLowerCase().includes(query)
        ) {
          return false
        }
      }

      // Tag filter
      if (selectedTag !== 'all' && !patient.tags.includes(selectedTag)) {
        return false
      }

      // Segment filter
      if (selectedSegment === 'active') {
        return patient.lastVisit && patient.lastVisit > sixMonthsAgo
      }
      if (selectedSegment === 'inactive') {
        return !patient.lastVisit || patient.lastVisit <= sixMonthsAgo
      }
      if (selectedSegment === 'new') {
        return patient.totalVisits <= 1
      }

      return true
    })
  }, [patients, searchQuery, selectedTag, selectedSegment])

  const addTag = async (patientId: string, tag: string) => {
    if (!tag.trim()) return
    // In real app, call server function
    console.log('Add tag:', patientId, tag)
  }

  const removeTag = async (patientId: string, tag: string) => {
    // In real app, call server function
    console.log('Remove tag:', patientId, tag)
  }

  const updateNotes = async (patientId: string, newNotes: string) => {
    // In real app, call server function
    console.log('Update notes:', patientId, newNotes)
    setEditingNotes(null)
  }

  const sendRecall = async (patient: PatientWithStats) => {
    // In real app, call server function
    console.log('Send recall to:', patient.name)
    // Show success message
  }

  const getSegmentColor = (patient: PatientWithStats) => {
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    if (patient.totalVisits <= 1) return 'text-blue-600'
    if (!patient.lastVisit || patient.lastVisit <= sixMonthsAgo) return 'text-red-600'
    return 'text-green-600'
  }

  const formatDate = (date?: Date) => {
    if (!date) return '-'
    return new Intl.DateTimeFormat('es-ES', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    }).format(new Date(date))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            {t('admin.patients.title')}
          </h2>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap gap-4 p-4 bg-muted/30 rounded-xl">
          {/* Search */}
          <div className="relative flex-1 min-w-64">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder={t('admin.patients.search')}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 border border-input bg-background rounded-md text-sm"
            />
          </div>

          {/* Segment filter */}
          <select
            value={selectedSegment}
            onChange={(e) =>
              setSelectedSegment(e.target.value as 'all' | 'active' | 'inactive' | 'new')
            }
            className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-32"
          >
            <option value="all">{t('admin.patients.segments.all')}</option>
            <option value="active">{t('admin.patients.segments.active')}</option>
            <option value="inactive">{t('admin.patients.segments.inactive')}</option>
            <option value="new">{t('admin.patients.segments.new')}</option>
          </select>

          {/* Tag filter */}
          <select
            value={selectedTag}
            onChange={(e) => setSelectedTag(e.target.value)}
            className="px-3 py-2 border border-input bg-background rounded-md text-sm min-w-32"
          >
            <option value="all">{t('admin.patients.allTags')}</option>
            {allTags.map((tag) => (
              <option key={tag} value={tag}>
                {tag}
              </option>
            ))}
          </select>
        </div>

        {/* Results count */}
        <p className="text-sm text-muted-foreground">
          {filteredPatients.length} {filteredPatients.length === 1 ? 'paciente' : 'pacientes'}
        </p>

        {/* Patient List */}
        <div className="grid gap-4">
          {filteredPatients.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>{t('admin.patients.noPatients')}</p>
            </div>
          ) : (
            filteredPatients.map((patient) => (
              <div
                key={patient._id}
                className="bg-background border rounded-xl p-4"
                data-testid="patient-card"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-lg">{patient.name}</h3>
                      <span
                        className={`text-xs px-2 py-1 rounded-full bg-muted ${getSegmentColor(patient)}`}
                      >
                        {patient.totalVisits <= 1
                          ? t('admin.patients.segments.new')
                          : !patient.lastVisit ||
                              patient.lastVisit <=
                                new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)
                            ? t('admin.patients.segments.inactive')
                            : t('admin.patients.segments.active')}
                      </span>
                    </div>

                    <div className="flex flex-wrap gap-4 text-sm text-muted-foreground mb-3">
                      <span>{patient.phone}</span>
                      {patient.email && <span>{patient.email}</span>}
                      <span>
                        {t('admin.patients.totalVisits')}: {patient.totalVisits}
                      </span>
                      <span>
                        {t('admin.patients.lastVisit')}: {formatDate(patient.lastVisit)}
                      </span>
                      {patient.nextAppointment && (
                        <span>
                          {t('admin.patients.nextAppointment')}:{' '}
                          {formatDate(patient.nextAppointment)}
                        </span>
                      )}
                    </div>

                    {/* Tags */}
                    <div className="flex flex-wrap gap-2 mb-3">
                      {patient.tags.map((tag) => (
                        <span
                          key={tag}
                          className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                          data-testid="patient-tag"
                        >
                          <Tag className="h-3 w-3" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => setSelectedPatient(patient)}>
                      {t('admin.patients.patientDetail')}
                    </Button>

                    {(!patient.lastVisit ||
                      patient.lastVisit <= new Date(Date.now() - 6 * 30 * 24 * 60 * 60 * 1000)) && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => sendRecall(patient)}
                        className="text-blue-600 border-blue-200"
                      >
                        <MessageCircle className="h-4 w-4 mr-1" />
                        {t('admin.patients.sendRecall')}
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Patient Detail Modal */}
        {selectedPatient && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-background rounded-xl shadow-xl max-w-2xl w-full mx-4 max-h-[90vh] overflow-auto">
              <div className="flex items-center justify-between p-6 border-b">
                <h3 className="text-xl font-semibold">{selectedPatient.name}</h3>
                <Button variant="ghost" size="icon" onClick={() => setSelectedPatient(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="p-6 space-y-6">
                {/* Contact Info */}
                <div>
                  <h4 className="font-medium mb-3">Información de contacto</h4>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">{t('common.phone')}: </span>
                      {selectedPatient.phone}
                    </div>
                    {selectedPatient.email && (
                      <div>
                        <span className="text-muted-foreground">{t('common.email')}: </span>
                        {selectedPatient.email}
                      </div>
                    )}
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{t('admin.patients.tags')}</h4>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        placeholder={t('admin.patients.newTag')}
                        value={newTag}
                        onChange={(e) => setNewTag(e.target.value)}
                        className="px-2 py-1 border rounded text-sm w-32"
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') {
                            addTag(selectedPatient._id, newTag)
                            setNewTag('')
                          }
                        }}
                      />
                      <Button
                        size="xs"
                        onClick={() => {
                          addTag(selectedPatient._id, newTag)
                          setNewTag('')
                        }}
                      >
                        <Plus className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {selectedPatient.tags.map((tag) => (
                      <span
                        key={tag}
                        className="inline-flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full"
                      >
                        <Tag className="h-3 w-3" />
                        {tag}
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => removeTag(selectedPatient._id, tag)}
                          className="ml-1 h-4 w-4 p-0 text-blue-600 hover:text-red-600"
                        >
                          <X className="h-2 w-2" />
                        </Button>
                      </span>
                    ))}
                  </div>
                </div>

                {/* Notes */}
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <h4 className="font-medium">{t('admin.patients.notes')}</h4>
                    {editingNotes !== selectedPatient._id && (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setEditingNotes(selectedPatient._id)
                          setNotes(selectedPatient.notes || '')
                        }}
                      >
                        Editar
                      </Button>
                    )}
                  </div>
                  {editingNotes === selectedPatient._id ? (
                    <div className="space-y-2">
                      <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full p-2 border rounded text-sm min-h-20"
                        placeholder="Notas sobre el paciente..."
                      />
                      <div className="flex gap-2">
                        <Button size="sm" onClick={() => updateNotes(selectedPatient._id, notes)}>
                          {t('common.save')}
                        </Button>
                        <Button size="sm" variant="outline" onClick={() => setEditingNotes(null)}>
                          {t('common.cancel')}
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      {selectedPatient.notes || 'Sin notas'}
                    </p>
                  )}
                </div>

                {/* Visit History */}
                <div>
                  <h4 className="font-medium mb-3">{t('admin.patients.visitHistory')}</h4>
                  <div className="space-y-3">
                    {selectedPatient.visitHistory.length === 0 ? (
                      <p className="text-sm text-muted-foreground">Sin historial de visitas</p>
                    ) : (
                      selectedPatient.visitHistory
                        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
                        .map((visit, index) => (
                          <div
                            key={index}
                            className="flex justify-between items-center p-3 bg-muted/30 rounded"
                          >
                            <div>
                              <p className="font-medium text-sm">{visit.service}</p>
                              <p className="text-xs text-muted-foreground">{visit.doctorName}</p>
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {formatDate(visit.date)}
                            </p>
                          </div>
                        ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  )
}
