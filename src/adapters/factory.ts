// Adapter factory — returns the correct adapter based on clinic's managementSystem field

import { GesdenAdapter } from './gesden'
import { KlinicareAdapter } from './klinicare'
import { ManualAdapter } from './manual'
import type { ClinicManagementAdapter } from './types'

export function getAdapter(managementSystem: string): ClinicManagementAdapter {
  switch (managementSystem) {
    case 'manual':
      return new ManualAdapter()
    case 'gesden':
      return new GesdenAdapter()
    case 'klinicare':
      return new KlinicareAdapter()
    default:
      // Default to manual adapter for unknown systems
      return new ManualAdapter()
  }
}
