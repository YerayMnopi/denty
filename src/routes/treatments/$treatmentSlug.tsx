import { createFileRoute, Link } from '@tanstack/react-router'
import { ArrowLeft, Banknote, Building2, Clock, Stethoscope, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { mockClinics, mockDoctors, mockTreatments } from '@/data/mock'

export const Route = createFileRoute('/treatments/$treatmentSlug')({
  component: TreatmentPage,
  head: ({ params }) => {
    const treatment = mockTreatments.find((t) => t.slug === params.treatmentSlug)
    return {
      meta: [
        {
          title: treatment ? `${treatment.name.en} - Denty` : 'Treatment - Denty',
        },
      ],
    }
  },
})

function TreatmentPage() {
  const { treatmentSlug } = Route.useParams()
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const treatment = mockTreatments.find((tr) => tr.slug === treatmentSlug)

  if (!treatment) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">{t('common.noResults')}</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
      </div>
    )
  }

  const name = treatment.name[lang] ?? treatment.name.es
  const description = treatment.description[lang] ?? treatment.description.es

  // Find clinics that offer this treatment (match by service name in either language)
  const relatedClinics = mockClinics.filter((c) =>
    c.services.some(
      (s) =>
        s.toLowerCase().includes(treatment.name.es.toLowerCase()) ||
        s.toLowerCase().includes(treatment.name.en.toLowerCase()),
    ),
  )

  // Find doctors whose specialization matches
  const relatedDoctors = mockDoctors.filter(
    (d) =>
      d.specialization.es.toLowerCase().includes(treatment.name.es.toLowerCase()) ||
      d.specialization.en.toLowerCase().includes(treatment.name.en.toLowerCase()) ||
      treatment.name.es.toLowerCase().includes(d.specialization.es.toLowerCase()) ||
      treatment.name.en.toLowerCase().includes(d.specialization.en.toLowerCase()),
  )

  const categoryLabels: Record<string, Record<string, string>> = {
    preventive: { es: 'Preventivo', en: 'Preventive' },
    cosmetic: { es: 'Estético', en: 'Cosmetic' },
    orthodontics: { es: 'Ortodoncia', en: 'Orthodontics' },
    surgery: { es: 'Cirugía', en: 'Surgery' },
    restorative: { es: 'Restaurador', en: 'Restorative' },
    pediatric: { es: 'Pediátrico', en: 'Pediatric' },
  }

  const categoryLabel =
    categoryLabels[treatment.category]?.[lang] ??
    categoryLabels[treatment.category]?.es ??
    treatment.category

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-muted-foreground">
        <Link to="/" className="hover:text-foreground">
          {t('common.home')}
        </Link>
        <span>/</span>
        <span className="text-foreground">{name}</span>
      </nav>

      {/* Header */}
      <div className="mb-10">
        <div className="mb-3 flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
            <Stethoscope className="h-6 w-6" />
          </div>
          <div>
            <span className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground">
              {categoryLabel}
            </span>
          </div>
        </div>
        <h1 className="text-3xl font-bold tracking-tight sm:text-4xl">{name}</h1>
        <p className="mt-4 max-w-3xl text-lg text-muted-foreground">{description}</p>
      </div>

      {/* Info cards */}
      <div className="mb-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-xl border bg-card p-6">
          <div className="mb-2 flex items-center gap-2 text-muted-foreground">
            <Clock className="h-4 w-4" />
            <span className="text-sm font-medium">{t('common.duration')}</span>
          </div>
          <p className="text-2xl font-semibold">
            {treatment.duration} {t('common.minutes')}
          </p>
        </div>
        {treatment.priceRange && (
          <div className="rounded-xl border bg-card p-6">
            <div className="mb-2 flex items-center gap-2 text-muted-foreground">
              <Banknote className="h-4 w-4" />
              <span className="text-sm font-medium">{t('common.price')}</span>
            </div>
            <p className="text-2xl font-semibold">{treatment.priceRange}</p>
          </div>
        )}
      </div>

      {/* Related clinics */}
      {relatedClinics.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <Building2 className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('treatment.clinicsOffering')}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {relatedClinics.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedClinics.map((clinic) => (
              <Link
                key={clinic.slug}
                to={`/clinics/${clinic.slug}`}
                className="group rounded-xl border bg-card p-5 transition-all hover:border-primary/30 hover:shadow-md"
              >
                <h3 className="font-semibold group-hover:text-primary">{clinic.name}</h3>
                <p className="mt-1 text-sm text-muted-foreground">{clinic.city}</p>
                <p className="mt-2 line-clamp-2 text-sm text-muted-foreground">
                  {clinic.description[lang] ?? clinic.description.es}
                </p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Related doctors */}
      {relatedDoctors.length > 0 && (
        <section className="mb-12">
          <div className="mb-4 flex items-center gap-2">
            <UserRound className="h-5 w-5 text-primary" />
            <h2 className="text-xl font-semibold">{t('treatment.specialistsIn')}</h2>
            <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-medium text-primary">
              {relatedDoctors.length}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {relatedDoctors.map((doctor) => (
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
    </div>
  )
}
