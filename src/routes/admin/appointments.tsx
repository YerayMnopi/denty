import { createFileRoute } from '@tanstack/react-router'
import { Check, Mail, MessageCircle, X } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin/admin-layout'
import { Button } from '@/components/ui/button'
import { type MockAppointment, mockAppointments } from '@/data/admin-mock'

export const Route = createFileRoute('/admin/appointments')({
  component: AdminAppointmentsPage,
})

function AdminAppointmentsPage() {
  const { t } = useTranslation()
  const [appointments, setAppointments] = useState<MockAppointment[]>(mockAppointments)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [doctorFilter, setDoctorFilter] = useState<string>('all')

  const doctors = [...new Set(mockAppointments.map((a) => a.doctorName))]
  const filtered = appointments.filter((a) => {
    if (statusFilter !== 'all' && a.status !== statusFilter) return false
    if (doctorFilter !== 'all' && a.doctorName !== doctorFilter) return false
    return true
  })

  const updateStatus = (id: string, status: MockAppointment['status']) => {
    setAppointments((prev) => prev.map((a) => (a.id === id ? { ...a, status } : a)))
  }

  const statusBadge = (status: string) => {
    const colors: Record<string, string> = {
      confirmed: 'bg-green-100 text-green-800',
      pending: 'bg-yellow-100 text-yellow-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800',
    }
    return (
      <span
        className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${colors[status] || 'bg-gray-100 text-gray-800'}`}
      >
        {t(`admin.status.${status}`)}
      </span>
    )
  }

  return (
    <AdminLayout>
      <div className="space-y-6">
        <h2 className="text-2xl font-bold">{t('admin.appointments.title')}</h2>

        {/* Filters */}
        <div className="flex flex-wrap gap-3">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">{t('admin.appointments.allStatuses')}</option>
            <option value="pending">{t('admin.status.pending')}</option>
            <option value="confirmed">{t('admin.status.confirmed')}</option>
            <option value="cancelled">{t('admin.status.cancelled')}</option>
            <option value="completed">{t('admin.status.completed')}</option>
          </select>
          <select
            value={doctorFilter}
            onChange={(e) => setDoctorFilter(e.target.value)}
            className="rounded-md border bg-background px-3 py-2 text-sm"
          >
            <option value="all">{t('admin.appointments.allDoctors')}</option>
            {doctors.map((d) => (
              <option key={d} value={d}>
                {d}
              </option>
            ))}
          </select>
        </div>

        {/* Table */}
        <div className="rounded-xl border bg-background overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b bg-muted/50">
                <th className="px-4 py-3 text-left font-medium">
                  {t('admin.appointments.patient')}
                </th>
                <th className="px-4 py-3 text-left font-medium">{t('common.doctors')}</th>
                <th className="px-4 py-3 text-left font-medium">{t('common.services')}</th>
                <th className="px-4 py-3 text-left font-medium">
                  {t('admin.appointments.dateTime')}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {t('admin.appointments.status')}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {t('admin.appointments.notifications')}
                </th>
                <th className="px-4 py-3 text-left font-medium">
                  {t('admin.appointments.actions')}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filtered.map((apt) => (
                <tr key={apt.id}>
                  <td className="px-4 py-3">
                    <p className="font-medium">{apt.patientName}</p>
                    <p className="text-xs text-muted-foreground">{apt.patientPhone}</p>
                  </td>
                  <td className="px-4 py-3">{apt.doctorName}</td>
                  <td className="px-4 py-3">{apt.service}</td>
                  <td className="px-4 py-3">
                    {apt.date} {apt.time}
                  </td>
                  <td className="px-4 py-3">{statusBadge(apt.status)}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <MessageCircle
                        className={`h-4 w-4 ${apt.whatsappSent ? 'text-green-600' : 'text-gray-300'}`}
                      />
                      <Mail
                        className={`h-4 w-4 ${apt.emailSent ? 'text-green-600' : 'text-gray-300'}`}
                      />
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex gap-1">
                      {apt.status === 'pending' && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => updateStatus(apt.id, 'confirmed')}
                          title={t('common.confirm')}
                        >
                          <Check className="h-3 w-3 text-green-600" />
                        </Button>
                      )}
                      {apt.status !== 'cancelled' && (
                        <Button
                          size="xs"
                          variant="ghost"
                          onClick={() => updateStatus(apt.id, 'cancelled')}
                          title={t('common.cancel')}
                        >
                          <X className="h-3 w-3 text-red-600" />
                        </Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </AdminLayout>
  )
}
