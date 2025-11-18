/**
 * Structured logging utility for the Narrative Arc Campaign Designer
 *
 * Provides contextual, leveled logging with metadata support.
 */

export enum LogLevel {
  DEBUG = 'debug',
  INFO = 'info',
  WARN = 'warn',
  ERROR = 'error',
}

export interface LogContext {
  requestId?: string
  userId?: string
  arcId?: string
  beatId?: string
  [key: string]: unknown
}

export interface LogEntry {
  level: LogLevel
  message: string
  timestamp: string
  context?: LogContext
  error?: Error
  metadata?: Record<string, unknown>
}

class Logger {
  private minLevel: LogLevel

  constructor() {
    this.minLevel = this.getMinLevelFromEnv()
  }

  private getMinLevelFromEnv(): LogLevel {
    const envLevel = process.env.LOG_LEVEL?.toLowerCase()
    switch (envLevel) {
      case 'debug':
        return LogLevel.DEBUG
      case 'info':
        return LogLevel.INFO
      case 'warn':
        return LogLevel.WARN
      case 'error':
        return LogLevel.ERROR
      default:
        return process.env.NODE_ENV === 'production' ? LogLevel.INFO : LogLevel.DEBUG
    }
  }

  private shouldLog(level: LogLevel): boolean {
    const levels = [LogLevel.DEBUG, LogLevel.INFO, LogLevel.WARN, LogLevel.ERROR]
    const minLevelIndex = levels.indexOf(this.minLevel)
    const currentLevelIndex = levels.indexOf(level)
    return currentLevelIndex >= minLevelIndex
  }

  private formatLogEntry(entry: LogEntry): string {
    if (process.env.NODE_ENV === 'production') {
      // JSON format for production (for log aggregation)
      return JSON.stringify(entry)
    } else {
      // Human-readable format for development
      const parts = [
        `[${entry.timestamp}]`,
        `[${entry.level.toUpperCase()}]`,
        entry.message,
      ]

      if (entry.context && Object.keys(entry.context).length > 0) {
        parts.push(`Context: ${JSON.stringify(entry.context)}`)
      }

      if (entry.metadata && Object.keys(entry.metadata).length > 0) {
        parts.push(`Metadata: ${JSON.stringify(entry.metadata)}`)
      }

      if (entry.error) {
        parts.push(`Error: ${entry.error.stack || entry.error.message}`)
      }

      return parts.join(' ')
    }
  }

  private log(
    level: LogLevel,
    message: string,
    context?: LogContext,
    metadata?: Record<string, unknown>,
    error?: Error
  ) {
    if (!this.shouldLog(level)) {
      return
    }

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date().toISOString(),
      context,
      metadata,
      error,
    }

    const formatted = this.formatLogEntry(entry)

    switch (level) {
      case LogLevel.ERROR:
        console.error(formatted)
        break
      case LogLevel.WARN:
        console.warn(formatted)
        break
      case LogLevel.INFO:
        console.info(formatted)
        break
      case LogLevel.DEBUG:
        console.debug(formatted)
        break
    }
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, unknown>) {
    this.log(LogLevel.DEBUG, message, context, metadata)
  }

  info(message: string, context?: LogContext, metadata?: Record<string, unknown>) {
    this.log(LogLevel.INFO, message, context, metadata)
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, unknown>) {
    this.log(LogLevel.WARN, message, context, metadata)
  }

  error(message: string, error?: Error, context?: LogContext, metadata?: Record<string, unknown>) {
    this.log(LogLevel.ERROR, message, context, metadata, error)
  }

  /**
   * Create a child logger with inherited context
   */
  child(context: LogContext): ChildLogger {
    return new ChildLogger(this, context)
  }
}

class ChildLogger {
  constructor(
    private parent: Logger,
    private inheritedContext: LogContext
  ) {}

  private mergeContext(context?: LogContext): LogContext {
    return { ...this.inheritedContext, ...context }
  }

  debug(message: string, context?: LogContext, metadata?: Record<string, unknown>) {
    this.parent.debug(message, this.mergeContext(context), metadata)
  }

  info(message: string, context?: LogContext, metadata?: Record<string, unknown>) {
    this.parent.info(message, this.mergeContext(context), metadata)
  }

  warn(message: string, context?: LogContext, metadata?: Record<string, unknown>) {
    this.parent.warn(message, this.mergeContext(context), metadata)
  }

  error(message: string, error?: Error, context?: LogContext, metadata?: Record<string, unknown>) {
    this.parent.error(message, error, this.mergeContext(context), metadata)
  }
}

// Export singleton instance
export const logger = new Logger()

// Export convenience function for creating request-scoped loggers
export function createRequestLogger(requestId: string, userId?: string): ChildLogger {
  return logger.child({ requestId, userId })
}
