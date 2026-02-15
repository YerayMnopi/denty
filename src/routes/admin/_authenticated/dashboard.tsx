import { createFileRoute } from '@tanstack/react-router'
import { CalendarDays, Clock, Stethoscope } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { AdminLayout } from '@/components/admin/admin-layout'
import { mockAdminDoctors, mockAppointments } from '@/data/admin-mock'

export const Route = createFileRoute('/admin/_authenticated/dashboard')({
  component: AdminDashboardPage,
})

function AdminDashboardPage() {
  const { t } = useTranslation()

  const today = new Date().toISOString().split('T')[0]
  const todayAppointments = mockAppointments.filter((a) => a.date === today)

  const weekFromNow = new Date()
  weekFromNow.setDate(weekFromNow.getDate() + 7)
  const weekEnd = weekFromNow.toISOString().split('T')[0]
  const weekAppointments = mockAppointments.filter((a) => a.date >= today && a.date <= weekEnd)
  const pendingCount = mockAppointments.filter((a) => a.status === 'pending').length

  const stats = [
    {
      label: t('admin.dashboard.weekAppointments'),
      value: weekAppointments.length,
      icon: CalendarDays,
    },
    { label: t('admin.dashboard.pendingConfirmations'), value: pendingCount, icon: Clock },
    {
      label: t('admin.dashboard.totalDoctors'),
      value: mockAdminDoctors.filter((d) => d.active).length,
      icon: Stethoscope,
    },
  ]

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
        <h2 className="text-2xl font-bold">{t('admin.dashboard.title')}</h2>

        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          {stats.map((stat) => (
            <div key={stat.label} className="rounded-xl border bg-background p-6">
              <div className="flex items-center justify-between">
                <p className="text-sm text-muted-foreground">{stat.label}</p>
                <stat.icon className="h-5 w-5 text-muted-foreground" />
              </div>
              <p className="mt-2 text-3xl font-bold">{stat.value}</p>
            </div>
          ))}
        </div>

        {/* Today's appointments */}
        <div className="rounded-xl border bg-background">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold">{t('admin.dashboard.todayAppointments')}</h3>
          </div>
          <div className="divide-y">
            {todayAppointments.length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground">
                {t('admin.dashboard.noAppointmentsToday')}
              </p>
            ) : (
              todayAppointments.map((apt) => (
                <div key={apt.id} className="flex items-center justify-between px-6 py-3">
                  <div>
                    <p className="font-medium">{apt.patientName}</p>
                    <p className="text-sm text-muted-foreground">
                      {apt.doctorName} · {apt.service}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-muted-foreground">{apt.time}</span>
                    {statusBadge(apt.status)}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Upcoming appointments */}
        <div className="rounded-xl border bg-background">
          <div className="border-b px-6 py-4">
            <h3 className="font-semibold">{t('admin.dashboard.upcomingAppointments')}</h3>
          </div>
          <div className="divide-y">
            {weekAppointments.filter((a) => a.date > today).length === 0 ? (
              <p className="px-6 py-8 text-center text-muted-foreground">
                {t('admin.dashboard.noUpcoming')}
              </p>
            ) : (
              weekAppointments
                .filter((a) => a.date > today)
                .map((apt) => (
                  <div key={apt.id} className="flex items-center justify-between px-6 py-3">
                    <div>
                      <p className="font-medium">{apt.patientName}</p>
                      <p className="text-sm text-muted-foreground">
                        {apt.doctorName} · {apt.service}
                      </p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">
                        {apt.date} {apt.time}
                      </span>
                      {statusBadge(apt.status)}
                    </div>
                  </div>
                ))
            )}
          </div>
        </div>
      </div>
    </AdminLayout>
  )
}
