import type { FormEvent } from 'react'
import { useTranslation } from 'react-i18next'
import { Button } from './ui/button'

export interface PatientInfo {
  name: string
  phone: string
  email: string
  notes: string
}

interface BookingFormProps {
  value: PatientInfo
  onChange: (info: PatientInfo) => void
  onSubmit: () => void
  errors: Partial<Record<keyof PatientInfo, string>>
}

export function BookingForm({ value, onChange, onSubmit, errors }: BookingFormProps) {
  const { t } = useTranslation()

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    onSubmit()
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Name */}
      <div>
        <label htmlFor="patient-name" className="mb-1 block font-medium text-sm">
          {t('booking.patientName')} <span className="text-destructive">*</span>
        </label>
        <input
          id="patient-name"
          type="text"
          value={value.name}
          onChange={(e) => onChange({ ...value, name: e.target.value })}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.name ? 'border-destructive' : 'border-input'
          }`}
          placeholder={t('booking.patientName')}
        />
        {errors.name && <p className="mt-1 text-destructive text-xs">{errors.name}</p>}
      </div>

      {/* Phone */}
      <div>
        <label htmlFor="patient-phone" className="mb-1 block font-medium text-sm">
          {t('booking.patientPhone')} <span className="text-destructive">*</span>
        </label>
        <input
          id="patient-phone"
          type="tel"
          value={value.phone}
          onChange={(e) => onChange({ ...value, phone: e.target.value })}
          className={`w-full rounded-md border px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary ${
            errors.phone ? 'border-destructive' : 'border-input'
          }`}
          placeholder="+34 600 000 000"
        />
        {errors.phone && <p className="mt-1 text-destructive text-xs">{errors.phone}</p>}
      </div>

      {/* Email */}
      <div>
        <label htmlFor="patient-email" className="mb-1 block font-medium text-sm">
          {t('booking.patientEmail')}
        </label>
        <input
          id="patient-email"
          type="email"
          value={value.email}
          onChange={(e) => onChange({ ...value, email: e.target.value })}
          className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('booking.patientEmail')}
        />
      </div>

      {/* Notes */}
      <div>
        <label htmlFor="patient-notes" className="mb-1 block font-medium text-sm">
          {t('booking.notes')}
        </label>
        <textarea
          id="patient-notes"
          value={value.notes}
          onChange={(e) => onChange({ ...value, notes: e.target.value })}
          rows={3}
          className="w-full rounded-md border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary"
          placeholder={t('booking.notes')}
        />
      </div>

      <Button type="submit" className="w-full">
        {t('common.next')}
      </Button>
    </form>
  )
}
