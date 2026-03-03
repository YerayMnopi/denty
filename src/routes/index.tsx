import { createFileRoute, Link } from '@tanstack/react-router'
import { CalendarCheck, Check, Search, UserRound } from 'lucide-react'
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

  const plans = [
    {
      name: t('pricing.starter.name'),
      price: '€199',
      period: t('pricing.period'),
      features: t('pricing.starter.features', { returnObjects: true }) as string[],
      popular: false,
    },
    {
      name: t('pricing.professional.name'),
      price: '€349',
      period: t('pricing.period'),
      features: t('pricing.professional.features', { returnObjects: true }) as string[],
      popular: true,
    },
    {
      name: t('pricing.enterprise.name'),
      price: '€499',
      period: t('pricing.period'),
      features: t('pricing.enterprise.features', { returnObjects: true }) as string[],
      popular: false,
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

      {/* Pricing */}
      <section className="py-20 bg-muted/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">
              {t('pricing.title')}
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              {t('pricing.subtitle')}
            </p>
          </div>
          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto">
            {plans.map((plan, i) => (
              <div
                key={i}
                className={`relative rounded-xl border bg-card p-8 shadow-sm transition-all hover:shadow-md ${
                  plan.popular ? 'border-primary ring-2 ring-primary/20 scale-105' : ''
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                    <span className="bg-primary text-primary-foreground px-3 py-1 rounded-full text-sm font-medium">
                      {t('pricing.popular')}
                    </span>
                  </div>
                )}
                <div className="text-center">
                  <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                  <div className="mb-6">
                    <span className="text-4xl font-bold">{plan.price}</span>
                    <span className="text-muted-foreground">/{plan.period}</span>
                  </div>
                  <ul className="space-y-3 mb-8 text-left">
                    {plan.features.map((feature, fi) => (
                      <li key={fi} className="flex items-center gap-2 text-sm">
                        <Check className="h-4 w-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold tracking-tight sm:text-4xl mb-4">{t('trial.title')}</h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            {t('trial.subtitle')}
          </p>
          <Link to="/onboarding">
            <Button size="lg" className="text-lg px-8 py-3">
              {t('trial.cta')}
            </Button>
          </Link>
          <p className="text-sm text-muted-foreground mt-4">{t('trial.terms')}</p>
        </div>
      </section>
    </div>
  )
}
