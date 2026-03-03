import { useQuery } from '@tanstack/react-query'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { useMemo, useState } from 'react'
import { useTranslation } from 'react-i18next'
import type { TimeSlot } from '@/adapters/types'
import { getAvailableSlots } from '@/server/availability'
import { Button } from './ui/button'

interface BookingCalendarProps {
  clinicSlug: string
  doctorSlug: string
  serviceDuration: number
  selectedDate: string | null
  selectedTime: string | null
  onSelectDate: (date: string) => void
  onSelectTime: (time: string) => void
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month + 1, 0).getDate()
}

function getFirstDayOfMonth(year: number, month: number): number {
  // 0 = Sunday, convert to Monday-first (0 = Monday)
  const day = new Date(year, month, 1).getDay()
  return day === 0 ? 6 : day - 1
}

function formatDateStr(year: number, month: number, day: number): string {
  return `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
}

export function BookingCalendar({
  clinicSlug,
  doctorSlug,
  serviceDuration,
  selectedDate,
  selectedTime,
  onSelectDate,
  onSelectTime,
}: BookingCalendarProps) {
  const { t } = useTranslation()
  const today = new Date()
  const [currentMonth, setCurrentMonth] = useState(today.getMonth())
  const [currentYear, setCurrentYear] = useState(today.getFullYear())

  const todayStr = formatDateStr(today.getFullYear(), today.getMonth(), today.getDate())

  const { data: slots, isLoading: slotsLoading } = useQuery({
    queryKey: ['availableSlots', clinicSlug, doctorSlug, selectedDate, serviceDuration],
    queryFn: () => {
      if (!selectedDate) {
        throw new Error('Selected date is required')
      }
      return getAvailableSlots({
        data: {
          clinicSlug,
          doctorSlug,
          date: selectedDate,
          serviceDuration,
        },
      })
    },
    enabled: !!selectedDate && !!doctorSlug,
  })

  const daysInMonth = getDaysInMonth(currentYear, currentMonth)
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth)

  const dayLabels = useMemo(
    () => [
      t('days.1').slice(0, 3),
      t('days.2').slice(0, 3),
      t('days.3').slice(0, 3),
      t('days.4').slice(0, 3),
      t('days.5').slice(0, 3),
      t('days.6').slice(0, 3),
      t('days.0').slice(0, 3),
    ],
    [t],
  )

  const monthNames = useMemo(
    () => [
      t('booking.months.january'),
      t('booking.months.february'),
      t('booking.months.march'),
      t('booking.months.april'),
      t('booking.months.may'),
      t('booking.months.june'),
      t('booking.months.july'),
      t('booking.months.august'),
      t('booking.months.september'),
      t('booking.months.october'),
      t('booking.months.november'),
      t('booking.months.december'),
    ],
    [t],
  )

  const goToPrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11)
      setCurrentYear((y) => y - 1)
    } else {
      setCurrentMonth((m) => m - 1)
    }
  }

  const goToNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0)
      setCurrentYear((y) => y + 1)
    } else {
      setCurrentMonth((m) => m + 1)
    }
  }

  const isPastMonth =
    currentYear < today.getFullYear() ||
    (currentYear === today.getFullYear() && currentMonth <= today.getMonth())

  return (
    <div className="space-y-6">
      {/* Calendar */}
      <div className="rounded-lg border bg-white p-4">
        {/* Month navigation */}
        <div className="mb-4 flex items-center justify-between">
          <Button variant="ghost" size="sm" onClick={goToPrevMonth} disabled={isPastMonth}>
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <h3 className="font-semibold text-lg">
            {monthNames[currentMonth]} {currentYear}
          </h3>
          <Button variant="ghost" size="sm" onClick={goToNextMonth}>
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Day headers */}
        <div className="mb-2 grid grid-cols-7 gap-1">
          {dayLabels.map((label) => (
            <div key={label} className="text-center font-medium text-muted-foreground text-xs">
              {label}
            </div>
          ))}
        </div>

        {/* Days grid */}
        <div className="grid grid-cols-7 gap-1">
          {/* Empty cells for days before first of month */}
          {Array.from({ length: firstDay }).map((_, i) => (
            <div key={`empty-${i.toString()}`} />
          ))}

          {Array.from({ length: daysInMonth }).map((_, i) => {
            const day = i + 1
            const dateStr = formatDateStr(currentYear, currentMonth, day)
            const isPast = dateStr < todayStr
            const isSelected = dateStr === selectedDate
            const isToday = dateStr === todayStr

            return (
              <button
                type="button"
                key={dateStr}
                onClick={() => !isPast && onSelectDate(dateStr)}
                disabled={isPast}
                className={`flex h-10 w-full items-center justify-center rounded-md text-sm transition-colors ${
                  isSelected
                    ? 'bg-primary font-semibold text-primary-foreground'
                    : isPast
                      ? 'cursor-not-allowed text-muted-foreground opacity-40'
                      : isToday
                        ? 'border border-primary font-semibold text-primary hover:bg-primary/10'
                        : 'hover:bg-muted'
                }`}
              >
                {day}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slots */}
      {selectedDate && (
        <div>
          <h4 className="mb-3 font-semibold">{t('booking.availableSlots')}</h4>
          {slotsLoading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : slots && slots.length > 0 ? (
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
              {slots.map((slot: TimeSlot) => (
                <button
                  type="button"
                  key={slot.start}
                  onClick={() => onSelectTime(slot.start)}
                  className={`rounded-md border px-3 py-2 text-center text-sm transition-colors ${
                    selectedTime === slot.start
                      ? 'border-primary bg-primary font-semibold text-primary-foreground'
                      : 'hover:border-primary hover:bg-primary/5'
                  }`}
                >
                  {slot.start}
                </button>
              ))}
            </div>
          ) : (
            <p className="py-4 text-center text-muted-foreground">
              {t('booking.noSlotsAvailable')}
            </p>
          )}
        </div>
      )}
    </div>
  )
}
