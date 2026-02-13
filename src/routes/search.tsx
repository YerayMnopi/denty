import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowRight,
  Banknote,
  Building2,
  Clock,
  MapPin,
  Stethoscope,
  UserRound,
} from 'lucide-react'
import { useMemo } from 'react'
import { useTranslation } from 'react-i18next'
import { mockClinics, mockDoctors, mockTreatments } from '@/data/mock'

interface SearchParams {
  q?: string
}

export const Route = createFileRoute('/search')({
  component: SearchPage,
  validateSearch: (search: Record<string, unknown>): SearchParams => ({
    q: typeof search.q === 'string' ? search.q : undefined,
  }),
  head: (ctx) => {
    const search = (ctx as unknown as { search: SearchParams }).search
    return {
      meta: [
        {
          title: search?.q ? `"${search.q}" - Search - Denty` : 'Search - Denty',
        },
      ],
    }
  },
})

function SearchPage() {
  const { t, i18n } = useTranslation()
  const { q } = Route.useSearch()
  const lang = i18n.language
  const query = (q ?? '').trim().toLowerCase()

  const clinicResults = useMemo(() => {
    if (query.length < 1) return mockClinics
    return mockClinics.filter((c) => {
      const haystack = [c.name, c.city, ...c.services, c.description.es, c.description.en]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [query])

  const doctorResults = useMemo(() => {
    if (query.length < 1) return mockDoctors
    return mockDoctors.filter((d) => {
      const haystack = [d.name, d.clinicName, d.specialization.es, d.specialization.en]
        .join(' ')
        .toLowerCase()
      return haystack.includes(query)
    })
  }, [query])

  const treatmentResults = useMemo(() => {
    if (query.length < 1) return []
    return mockTreatments.filter((tr) => {
      const haystack = [tr.name.es, tr.name.en].join(' ').toLowerCase()
      return haystack.includes(query)
    })
  }, [query])

  const totalResults = clinicResults.length + doctorResults.length + treatmentResults.length
  const hasQuery = query.length > 0

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight">
          {hasQuery ? t('common.searchResultsFor', { query: q }) : t('common.searchResults')}
        </h1>
        {hasQuery && (
          <p className="mt-2 text-sm text-muted-foreground">
            {totalResults} {totalResults === 1 ? 'result' : 'results'}
          </p>
        )}
      </div>

      {totalResults === 0 && hasQuery && (
        <div className="rounded-xl border bg-card p-12 text-center">
          <p className="text-lg text-muted-foreground">{t('common.noResults')}</p>
        </div>
      )}

      {/* Clinics */}
      {clinicResults.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('common.clinics')}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {clinicResults.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {clinicResults.map((clinic) => (
              <Link
                key={clinic.slug}
                to={`/clinics/${clinic.slug}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <h3 className="font-semibold group-hover:text-primary">{clinic.name}</h3>
                <div className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <MapPin className="h-3.5 w-3.5" />
                  {clinic.city}
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {clinic.description[lang] ?? clinic.description.es}
                </p>
                <div className="mt-3 flex flex-wrap gap-1.5">
                  {clinic.services.slice(0, 3).map((s) => (
                    <span
                      key={s}
                      className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    >
                      {s}
                    </span>
                  ))}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Doctors */}
      {doctorResults.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('common.doctors')}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {doctorResults.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {doctorResults.map((doctor) => (
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
                <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                  <Building2 className="h-3.5 w-3.5" />
                  {doctor.clinicName}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Treatments */}
      {treatmentResults.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <Stethoscope className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('common.treatments')}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {treatmentResults.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {treatmentResults.map((treatment) => (
              <Link
                key={treatment.slug}
                to={`/treatments/${treatment.slug}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Stethoscope className="h-4 w-4 text-primary" />
                    <span className="font-semibold group-hover:text-primary">
                      {treatment.name[lang] ?? treatment.name.es}
                    </span>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {treatment.description[lang] ?? treatment.description.es}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <Clock className="h-3.5 w-3.5" />
                    {treatment.duration} {t('common.minutes')}
                  </span>
                  {treatment.priceRange && (
                    <span className="flex items-center gap-1">
                      <Banknote className="h-3.5 w-3.5" />
                      {treatment.priceRange}
                    </span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
