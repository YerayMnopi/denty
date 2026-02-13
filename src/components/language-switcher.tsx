import { Globe } from 'lucide-react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'

export function LanguageSwitcher() {
  const { i18n } = useTranslation()

  const toggleLanguage = () => {
    const next = i18n.language === 'es' ? 'en' : 'es'
    i18n.changeLanguage(next)
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={toggleLanguage}
      className="gap-1.5 text-muted-foreground hover:text-foreground"
      aria-label="Switch language"
    >
      <Globe className="h-4 w-4" />
      <span className="uppercase text-xs font-semibold">
        {i18n.language === 'es' ? 'EN' : 'ES'}
      </span>
    </Button>
  )
}
