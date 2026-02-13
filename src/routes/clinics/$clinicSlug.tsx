import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  Banknote,
  Building2,
  CalendarCheck,
  Clock,
  Globe,
  Mail,
  MapPin,
  Phone,
  UserRound,
} from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { mockClinics, mockDoctors } from '@/data/mock'

export const Route = createFileRoute('/clinics/$clinicSlug')({
  component: ClinicDetailPage,
  head: ({ params }) => {
    const clinic = mockClinics.find((c) => c.slug === params.clinicSlug)
    return {
      meta: [{ title: clinic ? `${clinic.name} - Denty` : 'Clinic - Denty' }],
    }
  },
})

function ClinicDetailPage() {
  const { clinicSlug } = Route.useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const clinic = mockClinics.find((c) => c.slug === clinicSlug)

  if (!clinic) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">{t('common.noResults')}</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/clinics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
      </div>
    )
  }

  const doctors = mockDoctors.filter((d) => d.clinicSlug === clinic.slug)
  const dayNames = [0, 1, 2, 3, 4, 5, 6]

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          {t('common.home')}
        </Link>
        <span>/</span>
        <Link to="/clinics" className="hover:text-foreground">
          {t('common.clinics')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{clinic.name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Building2 className="h-6 w-6" />
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{clinic.name}</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">
          {clinic.description[lang] ?? clinic.description.es}
        </p>
        <div className="mt-4">
          <Button asChild>
            <Link to="/clinics">
              <CalendarCheck className="mr-2 h-4 w-4" />
              {t('common.bookAppointment')}
            </Link>
          </Button>
        </div>
      </div>

      {/* Contact Info & Working Hours */}
      <div className="mb-12 grid gap-6 lg:grid-cols-2">
        {/* Contact */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('clinic.contactInfo')}</h2>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              <span>{clinic.address}</span>
            </div>
            <div className="flex items-center gap-3">
              <Phone className="h-4 w-4 text-muted-foreground" />
              <a href={`tel:${clinic.phone}`} className="hover:text-primary">
                {clinic.phone}
              </a>
            </div>
            <div className="flex items-center gap-3">
              <Mail className="h-4 w-4 text-muted-foreground" />
              <a href={`mailto:${clinic.email}`} className="hover:text-primary">
                {clinic.email}
              </a>
            </div>
            {clinic.website && (
              <div className="flex items-center gap-3">
                <Globe className="h-4 w-4 text-muted-foreground" />
                <a
                  href={clinic.website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-primary"
                >
                  {clinic.website}
                </a>
              </div>
            )}
          </div>
        </div>

        {/* Working Hours */}
        <div className="rounded-xl border bg-card p-6">
          <h2 className="mb-4 text-lg font-semibold">{t('clinic.workingHours')}</h2>
          <table className="w-full text-sm">
            <tbody>
              {dayNames.map((day) => {
                const hours = clinic.workingHours.find((h) => h.day === day)
                return (
                  <tr key={day} className="border-b last:border-0">
                    <td className="py-2 font-medium">{t(`days.${day}`)}</td>
                    <td className="py-2 text-right text-muted-foreground">
                      {hours ? `${hours.open} - ${hours.close}` : t('clinic.closed')}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Services */}
      <section className="mb-12">
        <div className="mb-4 flex items-center gap-2">
          <Banknote className="h-5 w-5 text-primary" />
          <h2 className="text-xl font-semibold">{t('clinic.ourServices')}</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {clinic.serviceDetails.map((service) => (
            <div key={service.name.es} className="rounded-xl border bg-card p-5">
              <h3 className="font-semibold">{service.name[lang] ?? service.name.es}</h3>
              <div className="mt-2 flex items-center gap-4 text-sm text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  {service.duration} {t('common.minutes')}
                </span>
                <span className="flex items-center gap-1">
                  <Banknote className="h-3.5 w-3.5" />
                  {service.price}
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Doctors */}
      {doctors.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('clinic.ourDoctors')}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {doctors.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctors.map((doctor) => (
              <Link
                key={doctor.slug}
                to={`/doctors/${doctor.slug}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">{doctor.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {doctor.specialization[lang] ?? doctor.specialization.es}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
