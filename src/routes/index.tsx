import { createFileRoute, Link } from '@tanstack/react-router'
import { CalendarCheck, Check, Search, Star, UserRound } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { HeroSearch } from '@/components/hero-search'
import { Button } from '@/components/ui/button'

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
          <div className="mt-8">
            <Link to="/register">
              <Button size="lg" className="mx-auto text-lg px-8 py-3">
                {t('registration.tryDentyFree')}
              </Button>
            </Link>
          </div>
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

      {/* Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold tracking-tight mb-4">{t('pricing.title')}</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                name: t('pricing.starter.name'),
                price: '€199',
                description: t('pricing.starter.description'),
                features: [
                  t('pricing.starter.feature1'),
                  t('pricing.starter.feature2'),
                  t('pricing.starter.feature3'),
                  t('pricing.starter.feature4'),
                ],
              },
              {
                name: t('pricing.professional.name'),
                price: '€349',
                description: t('pricing.professional.description'),
                features: [
                  t('pricing.professional.feature1'),
                  t('pricing.professional.feature2'),
                  t('pricing.professional.feature3'),
                  t('pricing.professional.feature4'),
                  t('pricing.professional.feature5'),
                ],
                popular: true,
              },
              {
                name: t('pricing.enterprise.name'),
                price: '€499',
                description: t('pricing.enterprise.description'),
                features: [
                  t('pricing.enterprise.feature1'),
                  t('pricing.enterprise.feature2'),
                  t('pricing.enterprise.feature3'),
                  t('pricing.enterprise.feature4'),
                  t('pricing.enterprise.feature5'),
                  t('pricing.enterprise.feature6'),
                ],
              },
            ].map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-2xl border p-8 shadow-sm ${
                  plan.popular
                    ? 'border-primary bg-background ring-1 ring-primary/10'
                    : 'bg-background'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary px-3 py-1 text-sm font-medium text-primary-foreground">
                      <Star className="h-3 w-3" />
                      {t('pricing.popular')}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold">{plan.name}</h3>
                  <p className="mt-2 text-sm text-muted-foreground">{plan.description}</p>
                  <div className="mt-4">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/mes</span>
                  </div>
                </div>
                <ul className="mt-8 space-y-3">
                  {plan.features.map((feature, j) => (
                    <li key={j} className="flex items-start gap-3">
                      <Check className="h-4 w-4 text-primary flex-shrink-0 mt-1" />
                      <span className="text-sm text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <Link to="/register">
                    <Button
                      className={`w-full ${plan.popular ? '' : 'variant-outline'}`}
                      variant={plan.popular ? 'default' : 'outline'}
                    >
                      {t('registration.startTrial')}
                    </Button>
                  </Link>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center mt-12">
            <Link to="/register">
              <Button size="lg" className="text-lg px-8 py-3">
                {t('registration.registerClinic')}
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
