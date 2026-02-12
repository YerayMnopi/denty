import { useTranslation } from 'react-i18next'

export function Footer() {
  const { t } = useTranslation()
  const year = new Date().getFullYear()

  return (
    <footer className="border-t bg-muted/40">
      <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-8 sm:flex-row sm:justify-between sm:px-6 lg:px-8">
        <div className="flex items-center gap-2">
          <span className="text-lg" role="img" aria-label="tooth">
            🦷
          </span>
          <span className="text-sm font-semibold">{t('common.appName')}</span>
        </div>

        <p className="text-center text-xs text-muted-foreground">
          &copy; {year} {t('common.appName')}. {t('footer.rights')}
        </p>

        <div className="flex gap-4">
          <span className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            {t('footer.privacy')}
          </span>
          <span className="cursor-pointer text-xs text-muted-foreground hover:text-foreground">
            {t('footer.terms')}
          </span>
        </div>
      </div>
    </footer>
  )
}
