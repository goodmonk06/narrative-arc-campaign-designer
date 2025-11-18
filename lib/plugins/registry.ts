/**
 * Plugin registry for extending the Narrative Arc Campaign Designer
 *
 * Enables dynamic loading and management of plugins
 */

import { logger } from '../logger'
import { DomainEvent, EventHandler, eventBus } from '../events'

export interface PluginMetadata {
  name: string
  version: string
  description?: string
  author?: string
}

export interface PluginHooks {
  // Lifecycle hooks
  onInit?: () => void | Promise<void>
  onShutdown?: () => void | Promise<void>

  // Arc hooks
  beforeArcCreate?: (data: any) => any | Promise<any>
  afterArcCreate?: (arc: any) => void | Promise<void>
  beforeArcUpdate?: (id: string, data: any) => any | Promise<any>
  afterArcUpdate?: (arc: any) => void | Promise<void>
  beforeArcDelete?: (id: string) => void | Promise<void>
  afterArcDelete?: (id: string) => void | Promise<void>

  // Beat hooks
  beforeBeatCreate?: (data: any) => any | Promise<any>
  afterBeatCreate?: (beat: any) => void | Promise<void>
  beforeBeatUpdate?: (id: string, data: any) => any | Promise<any>
  afterBeatUpdate?: (beat: any) => void | Promise<void>

  // Template hooks
  beforeTemplateInstantiate?: (templateId: string, data: any) => any | Promise<any>
  afterTemplateInstantiate?: (arc: any) => void | Promise<void>

  // Event hooks
  onEvent?: EventHandler
}

export interface Plugin {
  metadata: PluginMetadata
  hooks: PluginHooks
}

class PluginRegistry {
  private plugins: Map<string, Plugin> = new Map()
  private initialized: boolean = false

  /**
   * Register a plugin
   */
  register(plugin: Plugin): void {
    if (this.plugins.has(plugin.metadata.name)) {
      logger.warn('Plugin already registered, replacing', undefined, {
        name: plugin.metadata.name,
      })
    }

    this.plugins.set(plugin.metadata.name, plugin)

    // Register event handler if provided
    if (plugin.hooks.onEvent) {
      eventBus.onAll(plugin.hooks.onEvent)
    }

    logger.info('Plugin registered', undefined, {
      name: plugin.metadata.name,
      version: plugin.metadata.version,
    })

    // Initialize if registry is already initialized
    if (this.initialized && plugin.hooks.onInit) {
      plugin.hooks.onInit()
    }
  }

  /**
   * Unregister a plugin
   */
  unregister(name: string): void {
    const plugin = this.plugins.get(name)
    if (!plugin) {
      logger.warn('Plugin not found for unregistration', undefined, { name })
      return
    }

    // Unregister event handler
    if (plugin.hooks.onEvent) {
      eventBus.offAll(plugin.hooks.onEvent)
    }

    // Call shutdown hook
    if (plugin.hooks.onShutdown) {
      plugin.hooks.onShutdown()
    }

    this.plugins.delete(name)

    logger.info('Plugin unregistered', undefined, { name })
  }

  /**
   * Get a registered plugin
   */
  get(name: string): Plugin | undefined {
    return this.plugins.get(name)
  }

  /**
   * Get all registered plugins
   */
  getAll(): Plugin[] {
    return Array.from(this.plugins.values())
  }

  /**
   * Initialize all plugins
   */
  async initialize(): Promise<void> {
    logger.info('Initializing plugin registry')

    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onInit) {
        try {
          await plugin.hooks.onInit()
          logger.debug('Plugin initialized', undefined, { name: plugin.metadata.name })
        } catch (error) {
          logger.error(
            'Plugin initialization failed',
            error instanceof Error ? error : new Error(String(error)),
            { name: plugin.metadata.name }
          )
        }
      }
    }

    this.initialized = true
    logger.info('Plugin registry initialized', undefined, {
      pluginCount: this.plugins.size,
    })
  }

  /**
   * Shutdown all plugins
   */
  async shutdown(): Promise<void> {
    logger.info('Shutting down plugin registry')

    for (const plugin of this.plugins.values()) {
      if (plugin.hooks.onShutdown) {
        try {
          await plugin.hooks.onShutdown()
          logger.debug('Plugin shut down', undefined, { name: plugin.metadata.name })
        } catch (error) {
          logger.error(
            'Plugin shutdown failed',
            error instanceof Error ? error : new Error(String(error)),
            { name: plugin.metadata.name }
          )
        }
      }
    }

    this.initialized = false
    logger.info('Plugin registry shut down')
  }

  /**
   * Execute a hook across all plugins
   */
  async executeHook<T = any>(hookName: keyof PluginHooks, ...args: any[]): Promise<T[]> {
    const results: T[] = []

    for (const plugin of this.plugins.values()) {
      const hook = plugin.hooks[hookName] as any
      if (hook && typeof hook === 'function') {
        try {
          const result = await hook(...args)
          if (result !== undefined) {
            results.push(result)
          }
        } catch (error) {
          logger.error(
            'Plugin hook execution failed',
            error instanceof Error ? error : new Error(String(error)),
            { plugin: plugin.metadata.name, hook: hookName }
          )
        }
      }
    }

    return results
  }

  /**
   * Clear all plugins (useful for testing)
   */
  clear(): void {
    for (const name of this.plugins.keys()) {
      this.unregister(name)
    }
  }
}

// Export singleton instance
export const pluginRegistry = new PluginRegistry()

// Helper function to create plugins
export function createPlugin(metadata: PluginMetadata, hooks: PluginHooks): Plugin {
  return { metadata, hooks }
}
