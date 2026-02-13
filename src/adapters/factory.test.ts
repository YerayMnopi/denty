import { describe, expect, it } from 'vitest'
import { getAdapter } from './factory'
import { GesdenAdapter } from './gesden'
import { KlinicareAdapter } from './klinicare'
import { ManualAdapter } from './manual'

describe('getAdapter', () => {
  it('returns ManualAdapter for "manual"', () => {
    expect(getAdapter('manual')).toBeInstanceOf(ManualAdapter)
  })

  it('returns GesdenAdapter for "gesden"', () => {
    expect(getAdapter('gesden')).toBeInstanceOf(GesdenAdapter)
  })

  it('returns KlinicareAdapter for "klinicare"', () => {
    expect(getAdapter('klinicare')).toBeInstanceOf(KlinicareAdapter)
  })

  it('defaults to ManualAdapter for unknown systems', () => {
    expect(getAdapter('unknown')).toBeInstanceOf(ManualAdapter)
    expect(getAdapter('')).toBeInstanceOf(ManualAdapter)
  })
})
