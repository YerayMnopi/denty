import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from '@/components/ui/button'
import { checkEmailAvailableFn, registerClinicFn } from '@/server/registration'

export const Route = createFileRoute('/register')({
  component: RegisterPage,
  head: () => ({
    meta: [
      {
        title: 'Registrar Clínica - Denty',
      },
    ],
  }),
})

function RegisterPage() {
  const { t } = useTranslation()
  const navigate = useNavigate()

  const [formData, setFormData] = useState({
    clinicName: '',
    ownerName: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
  })

  const [errors, setErrors] = useState<Record<string, string>>({})
  const [loading, setLoading] = useState(false)
  const [checkingEmail, setCheckingEmail] = useState(false)
  const [_checkingSubdomain, _setCheckingSubdomain] = useState(false)

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.clinicName.trim()) {
      newErrors.clinicName = t('registration.validation.clinicNameRequired')
    }

    if (!formData.ownerName.trim()) {
      newErrors.ownerName = t('registration.validation.ownerNameRequired')
    }

    if (!formData.email.trim()) {
      newErrors.email = t('registration.validation.emailRequired')
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = t('registration.validation.emailInvalid')
    }

    if (!formData.password) {
      newErrors.password = t('registration.validation.passwordRequired')
    } else if (formData.password.length < 6) {
      newErrors.password = t('registration.validation.passwordMinLength')
    }

    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = t('registration.validation.passwordsDoNotMatch')
    }

    if (!formData.phone.trim()) {
      newErrors.phone = t('registration.validation.phoneRequired')
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setLoading(true)
    try {
      const result = await registerClinicFn({
        data: {
          clinicName: formData.clinicName,
          ownerName: formData.ownerName,
          email: formData.email,
          password: formData.password,
          phone: formData.phone,
        },
      })

      if (result.success) {
        navigate({ to: '/onboarding' })
      } else {
        setErrors({ general: result.error || t('common.error') })
      }
    } catch {
      setErrors({ general: t('common.error') })
    } finally {
      setLoading(false)
    }
  }

  const checkEmailAvailability = async (email: string) => {
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return

    setCheckingEmail(true)
    try {
      const result = await checkEmailAvailableFn({ data: { email } })
      if (!result.available) {
        setErrors((prev) => ({ ...prev, email: t('registration.validation.emailTaken') }))
      } else {
        setErrors((prev) => ({ ...prev, email: '' }))
      }
    } catch {
      // Silently fail email check
    } finally {
      setCheckingEmail(false)
    }
  }

  return (
    <div className="min-h-screen bg-muted/30 py-12">
      <div className="mx-auto max-w-md px-4">
        <div className="rounded-xl border bg-background p-8 shadow-sm">
          <div className="mb-8 text-center">
            <span className="text-4xl">🦷</span>
            <h1 className="mt-4 text-2xl font-bold">{t('registration.title')}</h1>
            <p className="mt-2 text-sm text-muted-foreground">{t('registration.subtitle')}</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="clinicName" className="mb-1 block text-sm font-medium">
                {t('registration.clinicName')}
              </label>
              <input
                id="clinicName"
                type="text"
                required
                value={formData.clinicName}
                onChange={(e) => setFormData((prev) => ({ ...prev, clinicName: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('registration.clinicNamePlaceholder')}
              />
              {errors.clinicName && (
                <p className="mt-1 text-sm text-destructive">{errors.clinicName}</p>
              )}
            </div>

            <div>
              <label htmlFor="ownerName" className="mb-1 block text-sm font-medium">
                {t('registration.ownerName')}
              </label>
              <input
                id="ownerName"
                type="text"
                required
                value={formData.ownerName}
                onChange={(e) => setFormData((prev) => ({ ...prev, ownerName: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('registration.ownerNamePlaceholder')}
              />
              {errors.ownerName && (
                <p className="mt-1 text-sm text-destructive">{errors.ownerName}</p>
              )}
            </div>

            <div>
              <label htmlFor="email" className="mb-1 block text-sm font-medium">
                {t('common.email')}
              </label>
              <input
                id="email"
                type="email"
                required
                value={formData.email}
                onChange={(e) => {
                  setFormData((prev) => ({ ...prev, email: e.target.value }))
                  if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                }}
                onBlur={(e) => checkEmailAvailability(e.target.value)}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="admin@tuclínica.com"
              />
              {errors.email && <p className="mt-1 text-sm text-destructive">{errors.email}</p>}
              {checkingEmail && (
                <p className="mt-1 text-sm text-muted-foreground">
                  {t('registration.checkingEmail')}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="password" className="mb-1 block text-sm font-medium">
                {t('admin.login.password')}
              </label>
              <input
                id="password"
                type="password"
                required
                value={formData.password}
                onChange={(e) => setFormData((prev) => ({ ...prev, password: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('registration.passwordPlaceholder')}
              />
              {errors.password && (
                <p className="mt-1 text-sm text-destructive">{errors.password}</p>
              )}
            </div>

            <div>
              <label htmlFor="confirmPassword" className="mb-1 block text-sm font-medium">
                {t('registration.confirmPassword')}
              </label>
              <input
                id="confirmPassword"
                type="password"
                required
                value={formData.confirmPassword}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, confirmPassword: e.target.value }))
                }
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder={t('registration.confirmPasswordPlaceholder')}
              />
              {errors.confirmPassword && (
                <p className="mt-1 text-sm text-destructive">{errors.confirmPassword}</p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-medium">
                {t('common.phone')}
              </label>
              <input
                id="phone"
                type="tel"
                required
                value={formData.phone}
                onChange={(e) => setFormData((prev) => ({ ...prev, phone: e.target.value }))}
                className="w-full rounded-md border bg-background px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-primary"
                placeholder="+34 600 000 000"
              />
              {errors.phone && <p className="mt-1 text-sm text-destructive">{errors.phone}</p>}
            </div>

            {errors.general && <p className="text-sm text-destructive">{errors.general}</p>}

            <Button type="submit" className="w-full" disabled={loading || checkingEmail}>
              {loading ? t('common.loading') : t('registration.createAccount')}
            </Button>
          </form>

          <p className="mt-6 text-center text-sm text-muted-foreground">
            {t('registration.trialInfo')}
          </p>
        </div>
      </div>
    </div>
  )
}
