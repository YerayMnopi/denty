import { describe, it, expect } from 'vitest'
import { cn } from './utils'

describe('cn', () => {
  it('merges class names', () => {
    expect(cn('px-2', 'py-1')).toBe('px-2 py-1')
  })

  it('handles conditional classes', () => {
    expect(cn('px-2', false && 'py-1', 'mt-4')).toBe('px-2 mt-4')
  })

  it('merges conflicting tailwind classes (last wins)', () => {
    expect(cn('px-2', 'px-4')).toBe('px-4')
  })

  it('handles undefined and null inputs', () => {
    expect(cn('px-2', undefined, null, 'py-1')).toBe('px-2 py-1')
  })

  it('handles empty input', () => {
    expect(cn()).toBe('')
  })
})
