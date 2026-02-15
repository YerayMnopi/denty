import { createFileRoute } from '@tanstack/react-router'
import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { mockClinicSettings } from '@/data/admin-mock'

export const Route = createFileRoute('/admin/_authenticated/settings')({
  component: AdminSettingsPage,
})

function AdminSettingsPage() {
  const { t } = useTranslation()
  const [clinic, setClinic] = useState(mockClinicSettings)
  const [saved, setSaved] = useState(false)
  const [newService, setNewService] = useState({ nameEs: '', nameEn: '', duration: 30, price: 0 })

  const handleSave = () => {
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const addService = () => {
    if (!newService.nameEs) return
    setClinic({
      ...clinic,
      services: [
        ...clinic.services,
        {
          name: { es: newService.nameEs, en: newService.nameEn },
          duration: newService.duration,
          price: newService.price,
        },
      ],
    })
    setNewService({ nameEs: '', nameEn: '', duration: 30, price: 0 })
  }

  const removeService = (index: number) => {
    setClinic({ ...clinic, services: clinic.services.filter((_, i) => i !== index) })
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('admin.settings.title')}</h2>

        {/* Clinic info */}
        <div className="rounded-xl border bg-background p-6">
          <h3 className="mb-4 font-semibold">{t('admin.settings.clinicInfo')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">
                {t('admin.settings.clinicName')}
              </span>
              <input
                value={clinic.name}
                onChange={(e) => setClinic({ ...clinic, name: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('common.phone')}</span>
              <input
                value={clinic.phone}
                onChange={(e) => setClinic({ ...clinic, phone: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('common.email')}</span>
              <input
                value={clinic.email}
                onChange={(e) => setClinic({ ...clinic, email: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('common.address')}</span>
              <input
                value={clinic.address}
                onChange={(e) => setClinic({ ...clinic, address: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">
                {t('admin.settings.descriptionEs')}
              </span>
              <textarea
                value={clinic.description.es}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    description: { ...clinic.description, es: e.target.value },
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={2}
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="mb-1 block text-sm font-medium">
                {t('admin.settings.descriptionEn')}
              </span>
              <textarea
                value={clinic.description.en}
                onChange={(e) =>
                  setClinic({
                    ...clinic,
                    description: { ...clinic.description, en: e.target.value },
                  })
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
                rows={2}
              />
            </label>
          </div>
        </div>

        {/* Services */}
        <div className="rounded-xl border bg-background p-6">
          <h3 className="mb-4 font-semibold">{t('admin.settings.manageServices')}</h3>
          <div className="space-y-2">
            {clinic.services.map((svc, i) => (
              <div
                key={`${svc.name.es}-${i}`}
                className="flex items-center gap-3 rounded-lg border px-4 py-2"
              >
                <span className="flex-1 text-sm font-medium">{svc.name.es}</span>
                <span className="text-sm text-muted-foreground">
                  {svc.duration} {t('common.minutes')}
                </span>
                <span className="text-sm text-muted-foreground">{svc.price}€</span>
                <Button size="icon-xs" variant="ghost" onClick={() => removeService(i)}>
                  <Trash2 className="h-3 w-3 text-destructive" />
                </Button>
              </div>
            ))}
          </div>
          <div className="mt-4 flex flex-wrap items-end gap-2">
            <label className="block">
              <span className="mb-1 block text-xs font-medium">
                {t('admin.settings.serviceNameEs')}
              </span>
              <input
                value={newService.nameEs}
                onChange={(e) => setNewService({ ...newService, nameEs: e.target.value })}
                className="w-40 rounded-md border bg-background px-2 py-1 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">
                {t('admin.settings.serviceNameEn')}
              </span>
              <input
                value={newService.nameEn}
                onChange={(e) => setNewService({ ...newService, nameEn: e.target.value })}
                className="w-40 rounded-md border bg-background px-2 py-1 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">{t('common.duration')}</span>
              <input
                type="number"
                value={newService.duration}
                onChange={(e) => setNewService({ ...newService, duration: Number(e.target.value) })}
                className="w-20 rounded-md border bg-background px-2 py-1 text-sm"
              />
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-medium">{t('common.price')}</span>
              <input
                type="number"
                value={newService.price}
                onChange={(e) => setNewService({ ...newService, price: Number(e.target.value) })}
                className="w-20 rounded-md border bg-background px-2 py-1 text-sm"
              />
            </label>
            <Button size="sm" onClick={addService}>
              <Plus className="mr-1 h-3 w-3" />
              {t('admin.settings.addService')}
            </Button>
          </div>
        </div>

        {/* Management system */}
        <div className="rounded-xl border bg-background p-6">
          <h3 className="mb-4 font-semibold">{t('admin.settings.managementSystem')}</h3>
          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-sm font-medium">{t('admin.settings.adapter')}</span>
              <select
                value={clinic.managementSystem}
                onChange={(e) => setClinic({ ...clinic, managementSystem: e.target.value })}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              >
                <option value="manual">Manual</option>
                <option value="gesden">Gesden</option>
                <option value="klinicare">Klinicare</option>
              </select>
            </label>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Button onClick={handleSave}>{t('common.save')}</Button>
          {saved && <span className="text-sm text-green-600">{t('admin.settings.saved')}</span>}
        </div>
      </div>
    </AdminLayout>
  )
}
