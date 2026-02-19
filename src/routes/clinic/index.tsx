import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Building2, MapPin, Search, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockClinics, mockDoctors } from '@/data/mock'

export const Route = createFileRoute('/clinic/')({
  component: ClinicsPage,
  head: () => ({
    meta: [{ title: 'Clinics - Denty' }],
  }),
})

function ClinicsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [query, setQuery] = useState('')

  const filtered = mockClinics.filter((c) => {
    if (!query) return true
    const q = query.toLowerCase()
    return c.name.toLowerCase().includes(q) || c.city.toLowerCase().includes(q)
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('common.clinics')}</h1>
      <p className="mb-8 text-muted-foreground">{t('clinic.subtitle')}</p>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('clinic.searchPlaceholder')}
          aria-label={t('clinic.searchPlaceholder')}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t('common.noResults')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((clinic) => {
            const doctorCount = mockDoctors.filter((d) => d.clinicSlug === clinic.slug).length
            return (
              <Link
                key={clinic.slug}
                to="/clinic/$clinicSlug"
                params={{ clinicSlug: clinic.slug }}
                className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Building2 className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold group-hover:text-primary">{clinic.name}</h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
                  {clinic.description[lang] ?? clinic.description.es}
                </p>
                <div className="mt-3 flex items-center gap-4 text-xs text-muted-foreground">
                  <span className="flex items-center gap-1">
                    <MapPin className="h-3.5 w-3.5" />
                    {clinic.city}
                  </span>
                  <span className="flex items-center gap-1">
                    <UserRound className="h-3.5 w-3.5" />
                    {doctorCount} {t('common.doctors').toLowerCase()}
                  </span>
                </div>
              </Link>
            )
          })}
        </div>
      )}
    </div>
  )
}
