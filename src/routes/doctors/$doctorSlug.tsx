import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { mockDoctors, mockClinics } from '@/data/mock'
import { Button } from '@/components/ui/button'
import {
  UserRound,
  Building2,
  ArrowLeft,
  Clock,
  CalendarCheck,
  Stethoscope,
} from 'lucide-react'

export const Route = createFileRoute('/doctors/$doctorSlug')({
  component: DoctorDetailPage,
  head: ({ params }) => {
    const doctor = mockDoctors.find((d) => d.slug === params.doctorSlug)
    return {
      meta: [
        { title: doctor ? `${doctor.name} - Denty` : 'Doctor - Denty' },
      ],
    }
  },
})

function DoctorDetailPage() {
  const { doctorSlug } = Route.useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const doctor = mockDoctors.find((d) => d.slug === doctorSlug)

  if (!doctor) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">{t('common.noResults')}</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/doctors">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
      </div>
    )
  }

  const clinic = mockClinics.find((c) => c.slug === doctor.clinicSlug)
  const dayNames = [0, 1, 2, 3, 4, 5, 6]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          {t('common.home')}
        </Link>
        <span>/</span>
        <Link to="/doctors" className="hover:text-foreground">
          {t('common.doctors')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{doctor.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10 flex flex-col gap-6 sm:flex-row sm:items-start">
        <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <UserRound className="h-10 w-10" />
        </div>
        <div>
          <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">
            {doctor.name}
          </h1>
          <p className="mt-1 text-lg text-muted-foreground">
            {doctor.specialization[lang] ?? doctor.specialization.es}
          </p>
          {clinic && (
            <Link
              to={`/clinics/${clinic.slug}`}
              className="mt-2 inline-flex items-center gap-1 text-sm text-primary hover:underline"
            >
              <Building2 className="h-3.5 w-3.5" />
              {t('doctor.worksAt')} {clinic.name}
            </Link>
          )}
          <div className="mt-4">
            <Button>
              <CalendarCheck className="mr-2 h-4 w-4" />
              {t('common.bookAppointment')}
            </Button>
          </div>
        </div>
      </div>

      {/* Bio */}
      <section className="mb-12">
        <h2 className="mb-3 text-xl font-semibold">{t('doctor.biography')}</h2>
        <p className="max-w-3xl text-muted-foreground">
          {doctor.bio[lang] ?? doctor.bio.es}
        </p>
      </section>

      {/* Schedule & Services */}
      <div className="mb-12 grid gap-6 lg:grid-cols-2">
        {/* Weekly Schedule */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {t('doctor.weeklySchedule')}
          </h2>
          <table className="w-full text-sm">
            <tbody>
              {dayNames.map((day) => {
                const slot = doctor.schedule.find((s) => s.day === day)
                return (
                  <tr key={day} className="border-b last:border-0">
                    <td className="py-2 font-medium">{t(`days.${day}`)}</td>
                    <td className="py-2 text-right text-muted-foreground">
                      {slot ? (
                        <span className="flex items-center justify-end gap-1">
                          <Clock className="h-3.5 w-3.5" />
                          {slot.startTime} - {slot.endTime}
                        </span>
                      ) : (
                        t('clinic.closed')
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>

        {/* Services */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">
            {t('doctor.servicesProvided')}
          </h2>
          <div className="space-y-3">
            {doctor.services.map((service) => (
              <div
                key={service}
                className="flex items-center gap-3 text-sm"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10 text-primary">
                  <Stethoscope className="h-4 w-4" />
                </div>
                <span>{service}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
