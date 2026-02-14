import { createFileRoute } from '@tanstack/react-router'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { type MockAdminDoctor, mockAdminDoctors } from '@/data/admin-mock'

export const Route = createFileRoute('/admin/doctors')({
  component: AdminDoctorsPage,
})

function AdminDoctorsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [doctors, setDoctors] = useState<MockAdminDoctor[]>(mockAdminDoctors)
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({
    name: '',
    specializationEs: '',
    specializationEn: '',
    bioEs: '',
    bioEn: '',
    photo: '',
    services: '',
  })

  const resetForm = () => {
    setForm({
      name: '',
      specializationEs: '',
      specializationEn: '',
      bioEs: '',
      bioEn: '',
      photo: '',
      services: '',
    })
    setEditingId(null)
    setShowForm(false)
  }

  const handleEdit = (doc: MockAdminDoctor) => {
    setForm({
      name: doc.name,
      specializationEs: doc.specialization.es || '',
      specializationEn: doc.specialization.en || '',
      bioEs: doc.bio.es || '',
      bioEn: doc.bio.en || '',
      photo: doc.photo || '',
      services: doc.services.join(', '),
    })
    setEditingId(doc.id)
    setShowForm(true)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const doctorData: MockAdminDoctor = {
      id: editingId || String(Date.now()),
      name: form.name,
      specialization: { es: form.specializationEs, en: form.specializationEn },
      bio: { es: form.bioEs, en: form.bioEn },
      photo: form.photo || undefined,
      schedule: [],
      services: form.services
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean),
      active: true,
    }
    if (editingId) {
      setDoctors((prev) => prev.map((d) => (d.id === editingId ? { ...d, ...doctorData } : d)))
    } else {
      setDoctors((prev) => [...prev, doctorData])
    }
    resetForm()
  }

  const handleRemove = (id: string) => {
    setDoctors((prev) => prev.map((d) => (d.id === id ? { ...d, active: false } : d)))
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">{t('admin.doctors.title')}</h2>
          <Button
            onClick={() => {
              resetForm()
              setShowForm(true)
            }}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t('admin.doctors.addDoctor')}
          </Button>
        </div>

        {showForm && (
          <div className="rounded-xl border bg-background p-6">
            <h3 className="mb-4 font-semibold">
              {editingId ? t('admin.doctors.editDoctor') : t('admin.doctors.addDoctor')}
            </h3>
            <form onSubmit={handleSubmit} className="grid gap-4 sm:grid-cols-2">
              <label className="block">
                <span className="mb-1 block text-sm font-medium">{t('admin.doctors.name')}</span>
                <input
                  required
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  {t('admin.doctors.photoUrl')}
                </span>
                <input
                  value={form.photo}
                  onChange={(e) => setForm({ ...form, photo: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  {t('admin.doctors.specializationEs')}
                </span>
                <input
                  required
                  value={form.specializationEs}
                  onChange={(e) => setForm({ ...form, specializationEs: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block">
                <span className="mb-1 block text-sm font-medium">
                  {t('admin.doctors.specializationEn')}
                </span>
                <input
                  required
                  value={form.specializationEn}
                  onChange={(e) => setForm({ ...form, specializationEn: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">{t('admin.doctors.bioEs')}</span>
                <textarea
                  value={form.bioEs}
                  onChange={(e) => setForm({ ...form, bioEs: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={2}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">{t('admin.doctors.bioEn')}</span>
                <textarea
                  value={form.bioEn}
                  onChange={(e) => setForm({ ...form, bioEn: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  rows={2}
                />
              </label>
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-sm font-medium">
                  {t('admin.doctors.servicesList')}
                </span>
                <input
                  value={form.services}
                  onChange={(e) => setForm({ ...form, services: e.target.value })}
                  className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                  placeholder="Limpieza, Ortodoncia, ..."
                />
              </label>
              <div className="flex gap-2 sm:col-span-2">
                <Button type="submit">{t('common.save')}</Button>
                <Button type="button" variant="outline" onClick={resetForm}>
                  {t('common.cancel')}
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="grid gap-4 sm:grid-cols-2">
          {doctors
            .filter((d) => d.active)
            .map((doc) => (
              <div key={doc.id} className="flex gap-4 rounded-xl border bg-background p-4">
                {doc.photo && (
                  <img
                    src={doc.photo}
                    alt={doc.name}
                    className="h-16 w-16 rounded-full object-cover"
                  />
                )}
                <div className="flex-1">
                  <h4 className="font-semibold">{doc.name}</h4>
                  <p className="text-sm text-muted-foreground">
                    {doc.specialization[lang] || doc.specialization.es}
                  </p>
                  <p className="mt-1 text-xs text-muted-foreground">{doc.services.join(' · ')}</p>
                </div>
                <div className="flex flex-col gap-1">
                  <Button size="icon-xs" variant="ghost" onClick={() => handleEdit(doc)}>
                    <Pencil className="h-3 w-3" />
                  </Button>
                  <Button size="icon-xs" variant="ghost" onClick={() => handleRemove(doc.id)}>
                    <Trash2 className="h-3 w-3 text-destructive" />
                  </Button>
                </div>
              </div>
            ))}
        </div>
      </div>
    </AdminLayout>
  )
}
