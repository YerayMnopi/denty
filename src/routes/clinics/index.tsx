import { createFileRoute } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'

export const Route = createFileRoute('/clinics/')({
  component: ClinicsPage,
  head: () => ({
    meta: [{ title: 'Clinics - Denty' }],
  }),
})

function ClinicsPage() {
  const { t } = useTranslation()

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
      <h1 className="mb-8 text-3xl font-bold tracking-tight">{t('common.clinics')}</h1>
      <p className="text-muted-foreground">{t('common.noResults')}</p>
    </div>
  )
}
