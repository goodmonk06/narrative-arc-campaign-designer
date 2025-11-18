/**
 * Integration module exports
 *
 * Provides a unified interface for all external system integrations
 */

export * from './ritual-event-orchestrator'
export * from './content-calendar'

/**
 * Available external systems
 */
export const EXTERNAL_SYSTEMS = [
  'ritual-event-orchestrator',
  'content-calendar',
  'other',
] as const

export type ExternalSystem = typeof EXTERNAL_SYSTEMS[number]

/**
 * Helper to validate external system type
 */
export function isValidExternalSystem(system: string): system is ExternalSystem {
  return EXTERNAL_SYSTEMS.includes(system as ExternalSystem)
}
