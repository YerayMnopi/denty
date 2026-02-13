import { useMutation } from '@tanstack/react-query'
import { createFileRoute, Link } from '@tanstack/react-router'
import {
  ArrowLeft,
  CalendarCheck,
  Check,
  ChevronRight,
  Clock,
  Loader2,
  MessageCircle,
  User,
} from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { CreatedAppointment } from '@/adapters/types'
import { BookingCalendar } from '@/components/booking-calendar'
import { BookingForm, type PatientInfo } from '@/components/booking-form'
import { Button } from '@/components/ui/button'
import { mockClinics, mockDoctors } from '@/data/mock'
import { createAppointment } from '@/server/appointments'

interface BookingSearch {
  doctor?: string
}

export const Route = createFileRoute('/book/$clinicSlug')({
  component: BookingPage,
  validateSearch: (search: Record<string, unknown>): BookingSearch => ({
    doctor: typeof search.doctor === 'string' ? search.doctor : undefined,
  }),
  head: ({ params }) => {
    const clinic = mockClinics.find((c) => c.slug === params.clinicSlug)
    return {
      meta: [
        {
          title: clinic ? `${clinic.name} — Denty` : 'Book Appointment — Denty',
        },
      ],
    }
  },
})

type Step = 'doctor' | 'service' | 'datetime' | 'info' | 'confirm' | 'success'

const STEPS: Step[] = ['doctor', 'service', 'datetime', 'info', 'confirm', 'success']

function BookingPage() {
  const { clinicSlug } = Route.useParams()
  const { doctor: preselectedDoctor } = Route.useSearch()
  const { t, i18n } = useTranslation()
  const lang = i18n.language

  const clinic = mockClinics.find((c) => c.slug === clinicSlug)
  const clinicDoctors = mockDoctors.filter((d) => d.clinicSlug === clinicSlug)

  const [step, setStep] = useState<Step>(preselectedDoctor ? 'service' : 'doctor')
  const [selectedDoctor, setSelectedDoctor] = useState<string>(preselectedDoctor ?? '')
  const [selectedService, setSelectedService] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<string | null>(null)
  const [selectedTime, setSelectedTime] = useState<string | null>(null)
  const [patientInfo, setPatientInfo] = useState<PatientInfo>({
    name: '',
    phone: '',
    email: '',
    notes: '',
  })
  const [formErrors, setFormErrors] = useState<Partial<Record<keyof PatientInfo, string>>>({})
  const [confirmedAppointment, setConfirmedAppointment] = useState<CreatedAppointment | null>(null)

  const doctor = mockDoctors.find((d) => d.slug === selectedDoctor)
  const serviceDetail = clinic?.serviceDetails.find(
    (s) => s.name.es === selectedService || s.name.en === selectedService,
  )

  const bookMutation = useMutation({
    mutationFn: () =>
      createAppointment({
        data: {
          clinicSlug,
          doctorSlug: selectedDoctor,
          patientName: patientInfo.name,
          patientPhone: patientInfo.phone,
          patientEmail: patientInfo.email || undefined,
          service: selectedService,
          date: selectedDate!,
          time: selectedTime!,
          duration: serviceDetail?.duration ?? 30,
          notes: patientInfo.notes || undefined,
        },
      }),
    onSuccess: (data: CreatedAppointment) => {
      setConfirmedAppointment(data)
      setStep('success')
    },
  })

  if (!clinic) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-20 text-center sm:px-6 lg:px-8">
        <h1 className="text-2xl font-bold">{t('common.noResults')}</h1>
        <Button asChild variant="outline" className="mt-6">
          <Link to="/clinics">
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t('common.back')}
          </Link>
        </Button>
      </div>
    )
  }

  const currentStepIndex = STEPS.indexOf(step)

  const goBack = () => {
    if (currentStepIndex > 0) {
      setStep(STEPS[currentStepIndex - 1])
    }
  }

  const getStepLabel = (s: Step): string => {
    const labels: Record<Step, string> = {
      doctor: t('booking.selectDoctor'),
      service: t('booking.selectService'),
      datetime: t('booking.selectDateTime'),
      info: t('booking.yourInfo'),
      confirm: t('booking.confirmation'),
      success: t('booking.bookingConfirmed'),
    }
    return labels[s]
  }

  const validatePatientInfo = (): boolean => {
    const errors: Partial<Record<keyof PatientInfo, string>> = {}
    if (!patientInfo.name.trim()) {
      errors.name = t('booking.fieldRequired')
    }
    if (!patientInfo.phone.trim()) {
      errors.phone = t('booking.fieldRequired')
    }
    setFormErrors(errors)
    return Object.keys(errors).length === 0
  }

  // Get doctor's services that match clinic service details
  const doctorServices = doctor
    ? clinic.serviceDetails.filter(
        (sd) => doctor.services.includes(sd.name.es) || doctor.services.includes(sd.name.en),
      )
    : []

  return (
    <div className="mx-auto max-w-3xl px-4 py-8 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="mb-6">
        <Link
          to="/clinics/$clinicSlug"
          params={{ clinicSlug }}
          className="inline-flex items-center text-muted-foreground text-sm hover:text-foreground"
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          {clinic.name}
        </Link>
        <h1 className="mt-2 font-bold text-2xl sm:text-3xl">{t('common.bookAppointment')}</h1>
      </div>

      {/* Step indicator */}
      {step !== 'success' && (
        <div className="mb-8 flex items-center gap-1 overflow-x-auto text-sm">
          {STEPS.filter((s) => s !== 'success').map((s, i) => {
            const stepIdx = STEPS.indexOf(s)
            const isCurrent = s === step
            const isDone = stepIdx < currentStepIndex
            return (
              <div key={s} className="flex items-center">
                {i > 0 && <ChevronRight className="mx-1 h-4 w-4 text-muted-foreground" />}
                <span
                  className={`whitespace-nowrap ${
                    isCurrent
                      ? 'font-semibold text-primary'
                      : isDone
                        ? 'text-foreground'
                        : 'text-muted-foreground'
                  }`}
                >
                  {isDone && <Check className="mr-1 inline h-3 w-3" />}
                  {getStepLabel(s)}
                </span>
              </div>
            )
          })}
        </div>
      )}

      {/* Back button */}
      {step !== 'doctor' && step !== 'success' && !(step === 'service' && preselectedDoctor) && (
        <Button variant="ghost" size="sm" onClick={goBack} className="mb-4">
          <ArrowLeft className="mr-1 h-4 w-4" />
          {t('common.back')}
        </Button>
      )}

      {/* Step: Select Doctor */}
      {step === 'doctor' && (
        <div className="space-y-3">
          <h2 className="mb-4 font-semibold text-lg">{t('booking.selectDoctor')}</h2>
          {clinicDoctors.map((d) => (
            <button
              type="button"
              key={d.slug}
              onClick={() => {
                setSelectedDoctor(d.slug)
                setSelectedService('')
                setStep('service')
              }}
              className={`flex w-full items-center gap-4 rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5 ${
                selectedDoctor === d.slug ? 'border-primary bg-primary/5' : ''
              }`}
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                <User className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="font-semibold">{d.name}</p>
                <p className="text-muted-foreground text-sm">
                  {d.specialization[lang] || d.specialization.es}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Step: Select Service */}
      {step === 'service' && (
        <div className="space-y-3">
          <h2 className="mb-4 font-semibold text-lg">{t('booking.selectService')}</h2>
          {doctorServices.map((s) => {
            const serviceName = s.name[lang] || s.name.es
            return (
              <button
                type="button"
                key={s.name.es}
                onClick={() => {
                  setSelectedService(s.name.es)
                  setSelectedDate(null)
                  setSelectedTime(null)
                  setStep('datetime')
                }}
                className="flex w-full items-center justify-between rounded-lg border p-4 text-left transition-colors hover:border-primary hover:bg-primary/5"
              >
                <div>
                  <p className="font-semibold">{serviceName}</p>
                  <p className="flex items-center gap-2 text-muted-foreground text-sm">
                    <Clock className="h-3.5 w-3.5" />
                    {s.duration} {t('common.minutes')}
                  </p>
                </div>
                <span className="font-semibold text-primary">{s.price}</span>
              </button>
            )
          })}
        </div>
      )}

      {/* Step: Select Date & Time */}
      {step === 'datetime' && (
        <div>
          <h2 className="mb-4 font-semibold text-lg">{t('booking.selectDateTime')}</h2>
          <BookingCalendar
            clinicSlug={clinicSlug}
            doctorSlug={selectedDoctor}
            serviceDuration={serviceDetail?.duration ?? 30}
            selectedDate={selectedDate}
            selectedTime={selectedTime}
            onSelectDate={(date) => {
              setSelectedDate(date)
              setSelectedTime(null)
            }}
            onSelectTime={(time) => {
              setSelectedTime(time)
            }}
          />
          {selectedTime && (
            <Button className="mt-6 w-full" onClick={() => setStep('info')}>
              {t('common.next')}
            </Button>
          )}
        </div>
      )}

      {/* Step: Patient Information */}
      {step === 'info' && (
        <div>
          <h2 className="mb-4 font-semibold text-lg">{t('booking.yourInfo')}</h2>
          <BookingForm
            value={patientInfo}
            onChange={setPatientInfo}
            onSubmit={() => {
              if (validatePatientInfo()) {
                setStep('confirm')
              }
            }}
            errors={formErrors}
          />
        </div>
      )}

      {/* Step: Confirmation */}
      {step === 'confirm' && (
        <div>
          <h2 className="mb-6 font-semibold text-lg">{t('booking.confirmation')}</h2>
          <div className="space-y-4 rounded-lg border bg-white p-6">
            <div className="grid gap-3 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.clinics')}</span>
                <span className="font-medium">{clinic.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.doctors')}</span>
                <span className="font-medium">{doctor?.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.services')}</span>
                <span className="font-medium">
                  {serviceDetail?.name[lang] || serviceDetail?.name.es}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('booking.dateLabel')}</span>
                <span className="font-medium">{selectedDate}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('booking.timeLabel')}</span>
                <span className="font-medium">{selectedTime}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.duration')}</span>
                <span className="font-medium">
                  {serviceDetail?.duration} {t('common.minutes')}
                </span>
              </div>
              <hr />
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('booking.patientName')}</span>
                <span className="font-medium">{patientInfo.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">{t('common.phone')}</span>
                <span className="font-medium">{patientInfo.phone}</span>
              </div>
              {patientInfo.email && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('common.email')}</span>
                  <span className="font-medium">{patientInfo.email}</span>
                </div>
              )}
              {patientInfo.notes && (
                <div className="flex justify-between">
                  <span className="text-muted-foreground">{t('booking.notes')}</span>
                  <span className="max-w-[200px] text-right font-medium">{patientInfo.notes}</span>
                </div>
              )}
            </div>

            <Button
              className="mt-4 w-full"
              onClick={() => bookMutation.mutate()}
              disabled={bookMutation.isPending}
            >
              {bookMutation.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {t('common.loading')}
                </>
              ) : (
                <>
                  <CalendarCheck className="mr-2 h-4 w-4" />
                  {t('booking.confirmBooking')}
                </>
              )}
            </Button>

            {bookMutation.isError && (
              <p className="mt-2 text-center text-destructive text-sm">
                {bookMutation.error?.message || t('common.error')}
              </p>
            )}
          </div>
        </div>
      )}

      {/* Step: Success */}
      {step === 'success' && confirmedAppointment && (
        <div className="py-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
            <Check className="h-8 w-8 text-green-600" />
          </div>
          <h2 className="mb-2 font-bold text-2xl">{t('booking.bookingConfirmed')}</h2>
          <p className="mb-6 text-muted-foreground">{t('booking.bookingConfirmedMessage')}</p>

          <div className="mx-auto max-w-sm space-y-3 rounded-lg border bg-white p-6 text-left text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('common.doctors')}</span>
              <span className="font-medium">{doctor?.name}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('common.services')}</span>
              <span className="font-medium">
                {serviceDetail?.name[lang] || serviceDetail?.name.es}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('booking.dateLabel')}</span>
              <span className="font-medium">{confirmedAppointment.date}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">{t('booking.timeLabel')}</span>
              <span className="font-medium">{confirmedAppointment.time}</span>
            </div>
          </div>

          <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground text-sm">
            <MessageCircle className="h-4 w-4" />
            <span>{t('booking.whatsappNote')}</span>
          </div>

          <Button asChild className="mt-6">
            <Link to="/clinics/$clinicSlug" params={{ clinicSlug }}>
              {t('booking.backToClinic')}
            </Link>
          </Button>
        </div>
      )}
    </div>
  )
}
