import { createFileRoute, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { mockTreatments } from '@/data/mock'
import { Stethoscope, Clock, Banknote, ArrowRight } from 'lucide-react'

export const Route = createFileRoute('/treatments/')({
  component: TreatmentsPage,
  head: () => ({
    meta: [{ title: 'Treatments - Denty' }],
  }),
})

function TreatmentsPage() {
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const categoryLabels: Record<string, Record<string, string>> = {
    preventive: { es: 'Preventivo', en: 'Preventive' },
    cosmetic: { es: 'Estético', en: 'Cosmetic' },
    orthodontics: { es: 'Ortodoncia', en: 'Orthodontics' },
    surgery: { es: 'Cirugía', en: 'Surgery' },
    restorative: { es: 'Restaurador', en: 'Restorative' },
    pediatric: { es: 'Pediátrico', en: 'Pediatric' },
  }

  // Group treatments by category
  const grouped = mockTreatments.reduce<Record<string, typeof mockTreatments>>(
    (acc, treatment) => {
      if (!acc[treatment.category]) acc[treatment.category] = []
      acc[treatment.category].push(treatment)
      return acc
    },
    {},
  )

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-2 text-3xl font-bold tracking-tight">
        {t('common.treatments')}
      </h1>
      <p className="mb-10 text-muted-foreground">
        {lang === 'es'
          ? 'Explora los tratamientos dentales disponibles en nuestras clínicas.'
          : 'Explore the dental treatments available at our clinics.'}
      </p>

      {Object.entries(grouped).map(([category, treatments]) => (
        <section key={category} className="mb-10">
          <h2 className="mb-4 text-lg font-semibold">
            {categoryLabels[category]?.[lang] ?? category}
          </h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {treatments.map((treatment) => (
              <Link
                key={treatment.slug}
                to={`/treatments/${treatment.slug}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10 text-primary">
                      <Stethoscope className="h-4 w-4" />
                    </div>
                    <h3 className="font-semibold group-hover:text-primary">
                      {treatment.name[lang] ?? treatment.name.es}
                    </h3>
                  </div>
                  <ArrowRight className="h-4 w-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
                </div>
                <p className="mt-3 line-clamp-2 text-sm text-muted-foreground">
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
      ))}
    </div>
  )
}
