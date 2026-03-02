import { createFileRoute } from '@tanstack/react-router'
import {
  CheckCircle,
  ChevronDown,
  Clock,
  CreditCard,
  Globe,
  MessageCircle,
  Settings,
  Shield,
  Star,
  Zap,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export const Route = createFileRoute('/')({
  component: LandingPage,
  head: () => ({
    meta: [
      {
        title: 'Denty - Asistente IA para Clínicas Dentales | WhatsApp 24/7',
      },
    ],
  }),
})

function LandingPage() {
  const { t } = useTranslation()
  const [openFaq, setOpenFaq] = useState<number | null>(null)

  const scrollToOffer = () => {
    document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' })
  }

  const valueItems = [
    {
      icon: <MessageCircle className="h-6 w-6" />,
      title: t('landing.whatsappAssistant'),
      value: t('landing.whatsappValue'),
    },
    {
      icon: <Globe className="h-6 w-6" />,
      title: t('landing.professionalWebsite'),
      value: t('landing.websiteValue'),
    },
    {
      icon: <Clock className="h-6 w-6" />,
      title: t('landing.automaticReminders'),
      value: t('landing.remindersValue'),
    },
    {
      icon: <Settings className="h-6 w-6" />,
      title: t('landing.appointmentPanel'),
      value: t('landing.panelValue'),
    },
  ]

  const riskEliminators = [
    {
      icon: <CheckCircle className="h-5 w-5" />,
      text: t('landing.noContract'),
    },
    {
      icon: <CreditCard className="h-5 w-5" />,
      text: t('landing.noCard'),
    },
    {
      icon: <Shield className="h-5 w-5" />,
      text: t('landing.noReplacement'),
    },
    {
      icon: <Zap className="h-5 w-5" />,
      text: t('landing.easyRemoval'),
    },
  ]

  const steps = [
    {
      number: 1,
      title: t('landing.step1Title'),
      description: t('landing.step1Description'),
    },
    {
      number: 2,
      title: t('landing.step2Title'),
      description: t('landing.step2Description'),
    },
    {
      number: 3,
      title: t('landing.step3Title'),
      description: t('landing.step3Description'),
    },
  ]

  const faqs = [
    {
      question: t('landing.faq1Question'),
      answer: t('landing.faq1Answer'),
    },
    {
      question: t('landing.faq2Question'),
      answer: t('landing.faq2Answer'),
    },
    {
      question: t('landing.faq3Question'),
      answer: t('landing.faq3Answer'),
    },
    {
      question: t('landing.faq4Question'),
      answer: t('landing.faq4Answer'),
    },
  ]

  return (
    <div className="bg-slate-950 text-white min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-950 to-slate-900 py-20 sm:py-28">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(34,197,94,0.1),transparent_70%)]" />
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8 relative">
          <span className="mb-6 inline-block text-6xl" role="img" aria-label="tooth">
            🦷
          </span>
          <h1 className="mx-auto max-w-4xl text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl leading-tight">
            {t('landing.heroTitle')}
          </h1>
          <p className="mx-auto mt-8 max-w-3xl text-xl text-slate-300 leading-relaxed">
            {t('landing.heroSubtitle')}
          </p>
          <Button
            onClick={scrollToOffer}
            size="lg"
            className="mt-8 bg-green-600 hover:bg-green-700 text-white font-semibold px-8 py-4 text-lg"
          >
            {t('landing.heroCta')}
          </Button>
        </div>
      </section>

      {/* Urgency Section */}
      <section className="py-8 bg-orange-600/20 border-y border-orange-600/30">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <div className="inline-flex items-center gap-2 bg-orange-600 px-4 py-2 rounded-full text-white font-semibold">
            <Star className="h-4 w-4" />
            {t('landing.urgencyBadge')}
          </div>
        </div>
      </section>

      {/* Value Stack Section */}
      <section id="offer" className="py-20 bg-slate-900/50">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {t('landing.valueStackTitle')}
          </h2>

          <div className="space-y-6 mb-12">
            {valueItems.map((item, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-6 bg-slate-800/50 rounded-xl border border-slate-700"
              >
                <div className="flex items-center gap-4">
                  <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600/20 text-green-400">
                    {item.icon}
                  </div>
                  <span className="text-lg font-medium">{item.title}</span>
                </div>
                <div className="text-right">
                  <span className="text-xl font-bold text-slate-400 line-through">
                    {item.value}
                  </span>
                </div>
              </div>
            ))}
          </div>

          <div className="text-center border-t border-slate-700 pt-8">
            <div className="mb-4">
              <span className="text-2xl text-slate-400 line-through mr-4">
                {t('landing.totalValue')}
              </span>
            </div>
            <div className="mb-8">
              <span className="text-4xl font-bold text-green-400 bg-green-400/10 px-6 py-3 rounded-lg">
                {t('landing.currentPrice')}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Risk Eliminators */}
      <section className="py-16 bg-slate-800/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h3 className="mb-8 text-center text-2xl font-bold text-green-400">
            {t('landing.riskEliminatorsTitle')}
          </h3>
          <div className="grid gap-4 sm:grid-cols-2">
            {riskEliminators.map((item, index) => (
              <div key={index} className="flex items-center gap-3 p-4 bg-slate-800/50 rounded-lg">
                <div className="text-green-400">{item.icon}</div>
                <span className="text-slate-200">{item.text}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it Works */}
      <section className="py-20 bg-slate-900/30">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {t('landing.howItWorksTitle')}
          </h2>
          <div className="space-y-8">
            {steps.map((step, index) => (
              <div key={index} className="flex items-start gap-6 p-6 bg-slate-800/50 rounded-xl">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-green-600 text-white text-xl font-bold flex-shrink-0">
                  {step.number}
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                  <p className="text-slate-300">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-20 bg-slate-800/20">
        <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8">
          <h2 className="mb-12 text-center text-3xl font-bold tracking-tight">
            {t('landing.faqTitle')}
          </h2>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800/50 rounded-lg overflow-hidden">
                <button
                  onClick={() => setOpenFaq(openFaq === index ? null : index)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-slate-800/70 transition-colors"
                >
                  <span className="font-semibold">{faq.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 transition-transform ${
                      openFaq === index ? 'rotate-180' : ''
                    }`}
                  />
                </button>
                {openFaq === index && <div className="px-6 pb-6 text-slate-300">{faq.answer}</div>}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="py-20 bg-gradient-to-r from-green-600 to-green-700">
        <div className="mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold mb-4">{t('landing.finalCtaTitle')}</h2>
          <p className="text-green-100 mb-8 text-lg">{t('landing.finalCtaSubtitle')}</p>
          <Button
            size="lg"
            className="bg-white hover:bg-gray-100 text-green-700 font-bold px-8 py-4 text-xl"
          >
            {t('landing.finalCtaButton')}
          </Button>
        </div>
      </section>
    </div>
  )
}
