/**
 * Example plugin demonstrating the plugin system
 *
 * This plugin logs all arc-related events and adds metadata to created arcs
 */

import { createPlugin } from './registry'
import { logger } from '../logger'

export const examplePlugin = createPlugin(
  {
    name: 'example-logger',
    version: '1.0.0',
    description: 'Example plugin that logs arc events and adds metadata',
    author: 'Narrative Arc Team',
  },
  {
    onInit: async () => {
      logger.info('Example plugin initialized')
    },

    onShutdown: async () => {
      logger.info('Example plugin shutting down')
    },

    beforeArcCreate: async (data) => {
      logger.info('Example plugin: Before arc create', undefined, { title: data.title })

      // Add plugin metadata to the arc
      return {
        ...data,
        metadataJson: JSON.stringify({
          ...(data.metadataJson ? JSON.parse(data.metadataJson) : {}),
          processedBy: 'example-logger-plugin',
          processedAt: new Date().toISOString(),
        }),
      }
    },

    afterArcCreate: async (arc) => {
      logger.info('Example plugin: After arc create', undefined, {
        arcId: arc.id,
        title: arc.title,
      })
    },

    onEvent: async (event) => {
      if (event.type.startsWith('arc.')) {
        logger.debug('Example plugin: Arc event received', undefined, {
          type: event.type,
          timestamp: event.timestamp,
        })
      }
    },
  }
)

// Usage:
// import { examplePlugin } from './lib/plugins/example-plugin'
// import { pluginRegistry } from './lib/plugins/registry'
//
// pluginRegistry.register(examplePlugin)
// await pluginRegistry.initialize()
