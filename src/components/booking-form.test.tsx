import { fireEvent, render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { BookingForm, type PatientInfo } from './booking-form'

// Mock react-i18next
vi.mock('react-i18next', () => ({
  useTranslation: () => ({
    t: (key: string) => key,
  }),
}))

const defaultValue: PatientInfo = { name: '', phone: '', email: '', notes: '' }

describe('BookingForm', () => {
  it('renders all fields', () => {
    render(<BookingForm value={defaultValue} onChange={vi.fn()} onSubmit={vi.fn()} errors={{}} />)

    expect(screen.getByLabelText(/booking\.patientName/)).toBeTruthy()
    expect(screen.getByLabelText(/booking\.patientPhone/)).toBeTruthy()
    expect(screen.getByLabelText(/booking\.patientEmail/)).toBeTruthy()
    expect(screen.getByLabelText(/booking\.notes/)).toBeTruthy()
  })

  it('shows error messages when provided', () => {
    render(
      <BookingForm
        value={defaultValue}
        onChange={vi.fn()}
        onSubmit={vi.fn()}
        errors={{ name: 'Name required', phone: 'Phone required' }}
      />,
    )

    expect(screen.getByText('Name required')).toBeTruthy()
    expect(screen.getByText('Phone required')).toBeTruthy()
  })

  it('calls onChange when fields are updated', () => {
    const onChange = vi.fn()
    render(<BookingForm value={defaultValue} onChange={onChange} onSubmit={vi.fn()} errors={{}} />)

    fireEvent.change(screen.getByLabelText(/booking\.patientName/), {
      target: { value: 'John' },
    })
    expect(onChange).toHaveBeenCalledWith({ ...defaultValue, name: 'John' })
  })

  it('calls onSubmit when form is submitted', () => {
    const onSubmit = vi.fn()
    render(<BookingForm value={defaultValue} onChange={vi.fn()} onSubmit={onSubmit} errors={{}} />)

    fireEvent.click(screen.getByRole('button'))
    expect(onSubmit).toHaveBeenCalledOnce()
  })
})
