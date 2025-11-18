/**
 * Metrics abstraction for the Narrative Arc Campaign Designer
 *
 * Provides a simple interface for recording metrics that can be
 * implemented with various backends (in-memory, Prometheus, Datadog, etc.)
 */

import { logger } from './logger'

export interface MetricLabels {
  [key: string]: string | number
}

export interface CounterMetric {
  name: string
  value: number
  labels?: MetricLabels
  timestamp: number
}

export interface GaugeMetric {
  name: string
  value: number
  labels?: MetricLabels
  timestamp: number
}

export interface HistogramMetric {
  name: string
  value: number
  labels?: MetricLabels
  timestamp: number
}

/**
 * Metrics adapter interface
 * Implement this to send metrics to external systems
 */
export interface IMetricsAdapter {
  recordCounter(name: string, value: number, labels?: MetricLabels): void
  recordGauge(name: string, value: number, labels?: MetricLabels): void
  recordHistogram(name: string, value: number, labels?: MetricLabels): void
  flush(): Promise<void>
}

/**
 * In-memory metrics adapter (default)
 * Stores metrics in memory and logs them
 */
class InMemoryMetricsAdapter implements IMetricsAdapter {
  private counters: Map<string, CounterMetric[]> = new Map()
  private gauges: Map<string, GaugeMetric[]> = new Map()
  private histograms: Map<string, HistogramMetric[]> = new Map()

  recordCounter(name: string, value: number = 1, labels?: MetricLabels): void {
    const metric: CounterMetric = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    }

    const existing = this.counters.get(name) || []
    this.counters.set(name, [...existing, metric])

    logger.debug('Counter recorded', { metric: name }, { value, labels })
  }

  recordGauge(name: string, value: number, labels?: MetricLabels): void {
    const metric: GaugeMetric = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    }

    const existing = this.gauges.get(name) || []
    this.gauges.set(name, [...existing, metric])

    logger.debug('Gauge recorded', { metric: name }, { value, labels })
  }

  recordHistogram(name: string, value: number, labels?: MetricLabels): void {
    const metric: HistogramMetric = {
      name,
      value,
      labels,
      timestamp: Date.now(),
    }

    const existing = this.histograms.get(name) || []
    this.histograms.set(name, [...existing, metric])

    logger.debug('Histogram recorded', { metric: name }, { value, labels })
  }

  async flush(): Promise<void> {
    logger.info('Flushing metrics', undefined, {
      counters: this.counters.size,
      gauges: this.gauges.size,
      histograms: this.histograms.size,
    })
    // In-memory adapter doesn't need to flush anywhere
  }

  /**
   * Get all recorded metrics (useful for testing and debugging)
   */
  getMetrics() {
    return {
      counters: Object.fromEntries(this.counters),
      gauges: Object.fromEntries(this.gauges),
      histograms: Object.fromEntries(this.histograms),
    }
  }

  /**
   * Clear all metrics
   */
  clear(): void {
    this.counters.clear()
    this.gauges.clear()
    this.histograms.clear()
  }
}

/**
 * Metrics manager class
 */
class MetricsManager {
  private adapter: IMetricsAdapter

  constructor() {
    this.adapter = new InMemoryMetricsAdapter()
  }

  /**
   * Set a custom metrics adapter
   */
  setAdapter(adapter: IMetricsAdapter): void {
    this.adapter = adapter
  }

  /**
   * Record a counter metric (monotonically increasing value)
   * Use for: requests, events, operations
   */
  counter(name: string, value: number = 1, labels?: MetricLabels): void {
    this.adapter.recordCounter(name, value, labels)
  }

  /**
   * Record a gauge metric (value that can go up or down)
   * Use for: active connections, queue size, memory usage
   */
  gauge(name: string, value: number, labels?: MetricLabels): void {
    this.adapter.recordGauge(name, value, labels)
  }

  /**
   * Record a histogram metric (distribution of values)
   * Use for: request duration, response size, processing time
   */
  histogram(name: string, value: number, labels?: MetricLabels): void {
    this.adapter.recordHistogram(name, value, labels)
  }

  /**
   * Time a function execution and record as histogram
   */
  async time<T>(
    name: string,
    fn: () => Promise<T>,
    labels?: MetricLabels
  ): Promise<T> {
    const start = Date.now()
    try {
      const result = await fn()
      const duration = Date.now() - start
      this.histogram(name, duration, labels)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.histogram(name, duration, { ...labels, status: 'error' })
      throw error
    }
  }

  /**
   * Time a synchronous function execution
   */
  timeSync<T>(
    name: string,
    fn: () => T,
    labels?: MetricLabels
  ): T {
    const start = Date.now()
    try {
      const result = fn()
      const duration = Date.now() - start
      this.histogram(name, duration, labels)
      return result
    } catch (error) {
      const duration = Date.now() - start
      this.histogram(name, duration, { ...labels, status: 'error' })
      throw error
    }
  }

  /**
   * Flush metrics to external system
   */
  async flush(): Promise<void> {
    await this.adapter.flush()
  }
}

// Export singleton instance
export const metrics = new MetricsManager()

// Common metric names (constants for consistency)
export const METRICS = {
  // API metrics
  HTTP_REQUEST_DURATION: 'http.request.duration',
  HTTP_REQUEST_COUNT: 'http.request.count',
  HTTP_REQUEST_SIZE: 'http.request.size',
  HTTP_RESPONSE_SIZE: 'http.response.size',

  // Arc metrics
  ARC_CREATED: 'arc.created',
  ARC_UPDATED: 'arc.updated',
  ARC_DELETED: 'arc.deleted',
  ARC_VIEW: 'arc.view',

  // Beat metrics
  BEAT_CREATED: 'beat.created',
  BEAT_UPDATED: 'beat.updated',
  BEAT_DELETED: 'beat.deleted',
  BEAT_REORDERED: 'beat.reordered',

  // Template metrics
  TEMPLATE_CREATED: 'template.created',
  TEMPLATE_INSTANTIATED: 'template.instantiated',

  // Comment metrics
  COMMENT_CREATED: 'comment.created',
  COMMENT_RESOLVED: 'comment.resolved',

  // Database metrics
  DB_QUERY_DURATION: 'db.query.duration',
  DB_CONNECTION_COUNT: 'db.connection.count',

  // Cache metrics
  CACHE_HIT: 'cache.hit',
  CACHE_MISS: 'cache.miss',

  // External service metrics
  EXTERNAL_SERVICE_CALL: 'external.service.call',
  EXTERNAL_SERVICE_DURATION: 'external.service.duration',
} as const
