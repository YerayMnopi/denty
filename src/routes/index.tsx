import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Search, CalendarCheck, UserRound } from 'lucide-react'
import { HeroSearch } from '@/components/hero-search'

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: 'Denty - Book your dental appointment online',
      },
    ],
  }),
})

function LandingPage() {
  const { t } = useTranslation()

  const steps = [
    {
      icon: <Search className="h-8 w-8" />,
      title: t('landing.step1Title'),
      description: t('landing.step1Description'),
    },
    {
      icon: <UserRound className="h-8 w-8" />,
      title: t('landing.step2Title'),
      description: t('landing.step2Description'),
    },
    {
      icon: <CalendarCheck className="h-8 w-8" />,
      title: t('landing.step3Title'),
      description: t('landing.step3Description'),
    },
  ]

  return (
    <div>
      {/* Hero */}
      <section className="relative overflow-visible bg-linear-to-br from-primary/5 via-background to-primary/10 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
          <span className="mb-4 inline-block text-6xl" role="img" aria-label="tooth">
            🦷
          </span>
          <h1 className="mx-auto max-w-3xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            {t('landing.heroTitle')}
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg text-muted-foreground">
            {t('landing.heroSubtitle')}
          </p>
          <HeroSearch />
        </div>
      </section>

      {/* How it works */}
      <section className="py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {t('landing.howItWorks')}
          </h2>
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {steps.map((step, i) => (
              <div
                key={i}
                className="group relative rounded-xl border bg-card p-8 text-center shadow-sm transition-all hover:shadow-md"
              >
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                  {step.icon}
                </div>
                <div className="mb-2 text-sm font-semibold text-muted-foreground">
                  {String(i + 1).padStart(2, '0')}
                </div>
                <h3 className="mb-2 text-lg font-semibold">{step.title}</h3>
                <p className="text-sm text-muted-foreground">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
