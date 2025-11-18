/**
 * Event bus implementation for domain events
 *
 * Provides pub/sub mechanism for decoupled event handling
 */

import { DomainEvent, EventType } from './types'
import { logger } from '../logger'

export type EventHandler<T = unknown> = (event: DomainEvent<T>) => void | Promise<void>

class EventBus {
  private handlers: Map<string, Set<EventHandler>> = new Map()
  private wildcardHandlers: Set<EventHandler> = new Set()

  /**
   * Subscribe to a specific event type
   */
  on<T = unknown>(eventType: EventType | string, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventType)) {
      this.handlers.set(eventType, new Set())
    }
    this.handlers.get(eventType)!.add(handler as EventHandler)

    logger.debug('Event handler registered', { eventType }, {
      handlerCount: this.handlers.get(eventType)!.size,
    })
  }

  /**
   * Subscribe to all events
   */
  onAll(handler: EventHandler): void {
    this.wildcardHandlers.add(handler)
    logger.debug('Wildcard event handler registered', undefined, {
      wildcardHandlerCount: this.wildcardHandlers.size,
    })
  }

  /**
   * Unsubscribe from a specific event type
   */
  off<T = unknown>(eventType: EventType | string, handler: EventHandler<T>): void {
    const handlers = this.handlers.get(eventType)
    if (handlers) {
      handlers.delete(handler as EventHandler)
      logger.debug('Event handler unregistered', { eventType }, {
        handlerCount: handlers.size,
      })
    }
  }

  /**
   * Unsubscribe from all events
   */
  offAll(handler: EventHandler): void {
    this.wildcardHandlers.delete(handler)
    logger.debug('Wildcard event handler unregistered', undefined, {
      wildcardHandlerCount: this.wildcardHandlers.size,
    })
  }

  /**
   * Emit an event to all registered handlers
   */
  async emit<T = unknown>(event: DomainEvent<T>): Promise<void> {
    logger.info('Event emitted', undefined, {
      type: event.type,
      timestamp: event.timestamp,
    })

    // Get handlers for this specific event type
    const typeHandlers = this.handlers.get(event.type) || new Set()
    const allHandlers = [...typeHandlers, ...this.wildcardHandlers]

    if (allHandlers.length === 0) {
      logger.debug('No handlers for event', undefined, { type: event.type })
      return
    }

    // Execute all handlers
    const promises = allHandlers.map(async (handler) => {
      try {
        await handler(event)
      } catch (error) {
        logger.error(
          'Event handler error',
          error instanceof Error ? error : new Error(String(error)),
          { eventType: event.type }
        )
      }
    })

    await Promise.all(promises)

    logger.debug('Event handlers executed', undefined, {
      type: event.type,
      handlerCount: allHandlers.length,
    })
  }

  /**
   * Clear all handlers (useful for testing)
   */
  clear(): void {
    this.handlers.clear()
    this.wildcardHandlers.clear()
    logger.debug('All event handlers cleared')
  }

  /**
   * Get handler count for an event type
   */
  getHandlerCount(eventType: EventType | string): number {
    return (this.handlers.get(eventType)?.size || 0) + this.wildcardHandlers.size
  }
}

// Export singleton instance
export const eventBus = new EventBus()

// Export helper function to create events
export function createEvent<T>(
  type: EventType | string,
  payload: T,
  metadata?: DomainEvent['metadata']
): DomainEvent<T> {
  return {
    type,
    timestamp: new Date(),
    payload,
    metadata,
  }
}
