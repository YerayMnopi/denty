import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowRight, Building2, Search, UserRound } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { mockDoctors } from '@/data/mock'

export const Route = createFileRoute('/doctors/')({
  component: DoctorsPage,
  head: () => ({
    meta: [{ title: 'Doctors - Denty' }],
  }),
})

function DoctorsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language
  const [query, setQuery] = useState('')

  const filtered = mockDoctors.filter((d) => {
    if (!query) return true
    const q = query.toLowerCase()
    return (
      d.name.toLowerCase().includes(q) ||
      (d.specialization[lang] ?? d.specialization.es).toLowerCase().includes(q)
    )
  })

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">{t('common.doctors')}</h1>
      <p className="mb-8 text-muted-foreground">{t('doctor.subtitle')}</p>

      {/* Search */}
      <div className="relative mb-8 max-w-md">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('doctor.searchPlaceholder')}
          aria-label={t('doctor.searchPlaceholder')}
          className="w-full rounded-lg border bg-background py-2 pl-10 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
        />
      </div>

      {filtered.length === 0 ? (
        <p className="text-muted-foreground">{t('common.noResults')}</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((doctor) => (
            <Link
              key={doctor.slug}
              to="/doctors/$doctorSlug"
              params={{ doctorSlug: doctor.slug }}
              className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                    <UserRound className="h-4 w-4" />
                  </div>
                  <div>
                    <h3 className="font-semibold group-hover:text-primary">{doctor.name}</h3>
                    <p className="text-xs text-muted-foreground">
                      {doctor.specialization[lang] ?? doctor.specialization.es}
                    </p>
                  </div>
                </div>
                <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
              </div>
              <div className="mt-3 flex items-center gap-1 text-sm text-muted-foreground">
                <Building2 className="h-3.5 w-3.5" />
                {doctor.clinicName}
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
