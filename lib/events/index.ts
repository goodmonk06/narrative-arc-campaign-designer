/**
 * Event system exports
 */

export * from './types'
export * from './event-bus'

// Re-export commonly used items
export { eventBus, createEvent } from './event-bus'
export { EVENT_TYPES } from './types'
export type { DomainEvent, EventHandler } from './event-bus'
