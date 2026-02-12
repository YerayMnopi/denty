import { useNavigate, Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import { Search, Building2, UserRound, Stethoscope, X } from 'lucide-react'
import { useState, useMemo, useRef, useEffect } from 'react'
import { mockClinics, mockDoctors, mockTreatments } from '@/data/mock'

interface SearchResult {
  type: 'clinic' | 'doctor' | 'treatment'
  label: string
  sublabel?: string
  href: string
}

export function HeroSearch() {
  const { t, i18n } = useTranslation()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lang = i18n.language

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsFocused(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const results = useMemo<SearchResult[]>(() => {
    const q = query.trim().toLowerCase()
    if (q.length < 2) return []

    const matched: SearchResult[] = []

    // Search clinics
    for (const clinic of mockClinics) {
      const haystack = [
        clinic.name,
        clinic.city,
        ...clinic.services,
        clinic.description.es,
        clinic.description.en,
      ]
        .join(' ')
        .toLowerCase()

      if (haystack.includes(q)) {
        matched.push({
          type: 'clinic',
          label: clinic.name,
          sublabel: clinic.city,
          href: `/clinics/${clinic.slug}`,
        })
      }
    }

    // Search doctors
    for (const doctor of mockDoctors) {
      const haystack = [
        doctor.name,
        doctor.clinicName,
        doctor.specialization.es,
        doctor.specialization.en,
      ]
        .join(' ')
        .toLowerCase()

      if (haystack.includes(q)) {
        matched.push({
          type: 'doctor',
          label: doctor.name,
          sublabel: doctor.specialization[lang] ?? doctor.specialization.es,
          href: `/doctors/${doctor.slug}`,
        })
      }
    }

    // Search treatments
    for (const treatment of mockTreatments) {
      const haystack = [treatment.name.es, treatment.name.en].join(' ').toLowerCase()

      if (haystack.includes(q)) {
        matched.push({
          type: 'treatment',
          label: treatment.name[lang] ?? treatment.name.es,
          sublabel: treatment.priceRange,
          href: `/treatments/${treatment.slug}`,
        })
      }
    }

    return matched.slice(0, 8)
  }, [query, lang])

  const showDropdown = isFocused && query.trim().length >= 2

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsFocused(false)
    const trimmed = query.trim()
    if (trimmed) {
      navigate({ to: '/search', search: { q: trimmed } })
    } else {
      navigate({ to: '/search' })
    }
  }

  const handleResultClick = () => {
    setIsFocused(false)
    setQuery('')
  }

  const clearQuery = () => {
    setQuery('')
    inputRef.current?.focus()
  }

  const iconForType = (type: SearchResult['type']) => {
    switch (type) {
      case 'clinic':
        return <Building2 className="h-4 w-4 shrink-0 text-primary" />
      case 'doctor':
        return <UserRound className="h-4 w-4 shrink-0 text-primary" />
      case 'treatment':
        return <Stethoscope className="h-4 w-4 shrink-0 text-primary" />
    }
  }

  const labelForType = (type: SearchResult['type']) => {
    switch (type) {
      case 'clinic':
        return t('common.clinics')
      case 'doctor':
        return t('common.doctors')
      case 'treatment':
        return t('common.services')
    }
  }

  // Group results by type
  const grouped = useMemo(() => {
    const groups: Record<string, SearchResult[]> = {}
    for (const r of results) {
      if (!groups[r.type]) groups[r.type] = []
      groups[r.type].push(r)
    }
    return groups
  }, [results])

  return (
    <div ref={containerRef} className="relative z-50 mx-auto mt-10 w-full max-w-xl">
      <form
        onSubmit={handleSubmit}
        className={`flex items-center gap-0 rounded-full border bg-card shadow-lg transition-all ${
          showDropdown
            ? 'rounded-b-none rounded-t-2xl ring-2 ring-primary/30 shadow-xl'
            : 'focus-within:shadow-xl focus-within:ring-2 focus-within:ring-primary/30'
        }`}
      >
        <Search className="ml-5 h-5 w-5 shrink-0 text-muted-foreground" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsFocused(true)}
          placeholder={t('landing.searchPlaceholder')}
          className="flex-1 bg-transparent px-4 py-4 text-base outline-none placeholder:text-muted-foreground/70"
          aria-label={t('common.search')}
          aria-expanded={showDropdown}
          aria-haspopup="listbox"
          role="combobox"
          autoComplete="off"
        />
        {query.length > 0 && (
          <button
            type="button"
            onClick={clearQuery}
            className="mr-1 rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
            aria-label="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}
        <button
          type="submit"
          className="mr-2 rounded-full bg-primary px-6 py-2.5 text-sm font-semibold text-primary-foreground transition-colors hover:bg-primary/90"
        >
          {t('common.search')}
        </button>
      </form>

      {/* Dropdown results */}
      {showDropdown && (
        <div
          className="absolute left-0 right-0 z-50 overflow-hidden rounded-b-2xl border border-t-0 bg-card shadow-xl"
          role="listbox"
        >
          {results.length === 0 ? (
            <div className="px-5 py-4 text-sm text-muted-foreground">
              {t('common.noResults')}
            </div>
          ) : (
            <div className="max-h-80 overflow-y-auto py-2">
              {Object.entries(grouped).map(([type, items]) => (
                <div key={type}>
                  <div className="px-5 pb-1 pt-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                    {labelForType(type as SearchResult['type'])}
                  </div>
                  {items.map((result, i) => (
                    <Link
                      key={`${type}-${i}`}
                      to={result.href}
                      onClick={handleResultClick}
                      className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-accent"
                    >
                      {iconForType(result.type)}
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{result.label}</div>
                        {result.sublabel && (
                          <div className="truncate text-xs text-muted-foreground">
                            {result.sublabel}
                          </div>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
