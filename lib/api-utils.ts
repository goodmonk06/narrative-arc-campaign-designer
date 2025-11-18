/**
 * API utility functions for consistent request/response handling
 */

import { NextRequest, NextResponse } from 'next/server'
import { formatErrorResponse, isAppError } from './errors'
import { logger, createRequestLogger } from './logger'
import { metrics, METRICS } from './metrics'
import { randomUUID } from 'crypto'

/**
 * Generate a unique request ID
 */
export function generateRequestId(): string {
  return randomUUID()
}

/**
 * Extract request ID from headers or generate a new one
 */
export function getRequestId(request: NextRequest): string {
  return request.headers.get('x-request-id') || generateRequestId()
}

/**
 * Wrap an API route handler with error handling, logging, and metrics
 */
export function withErrorHandler(
  handler: (request: NextRequest, context?: any) => Promise<NextResponse>
) {
  return async (request: NextRequest, context?: any): Promise<NextResponse> => {
    const requestId = getRequestId(request)
    const startTime = Date.now()
    const requestLogger = createRequestLogger(requestId)

    try {
      // Log incoming request
      requestLogger.info('API request received', {
        method: request.method,
        path: request.nextUrl.pathname,
      })

      // Record request count
      metrics.counter(METRICS.HTTP_REQUEST_COUNT, 1, {
        method: request.method || 'UNKNOWN',
        path: request.nextUrl.pathname,
      })

      // Execute handler
      const response = await handler(request, context)

      // Calculate duration
      const duration = Date.now() - startTime

      // Log response
      requestLogger.info('API request completed', {
        method: request.method,
        path: request.nextUrl.pathname,
        status: response.status,
        duration,
      })

      // Record metrics
      metrics.histogram(METRICS.HTTP_REQUEST_DURATION, duration, {
        method: request.method || 'UNKNOWN',
        path: request.nextUrl.pathname,
        status: String(response.status),
      })

      // Add request ID to response headers
      response.headers.set('x-request-id', requestId)

      return response
    } catch (error) {
      const duration = Date.now() - startTime

      // Log error
      requestLogger.error(
        'API request failed',
        error instanceof Error ? error : new Error(String(error)),
        {
          method: request.method,
          path: request.nextUrl.pathname,
          duration,
        }
      )

      // Record error metrics
      metrics.counter(METRICS.HTTP_REQUEST_COUNT, 1, {
        method: request.method || 'UNKNOWN',
        path: request.nextUrl.pathname,
        status: 'error',
      })

      metrics.histogram(METRICS.HTTP_REQUEST_DURATION, duration, {
        method: request.method || 'UNKNOWN',
        path: request.nextUrl.pathname,
        status: 'error',
      })

      // Format error response
      const errorResponse = formatErrorResponse(
        error,
        request.nextUrl.pathname,
        requestId
      )

      const statusCode = isAppError(error) ? error.statusCode : 500

      const response = NextResponse.json(errorResponse, { status: statusCode })
      response.headers.set('x-request-id', requestId)

      return response
    }
  }
}

/**
 * Success response helper
 */
export function successResponse<T>(data: T, status: number = 200): NextResponse {
  return NextResponse.json(data, { status })
}

/**
 * Created response helper
 */
export function createdResponse<T>(data: T): NextResponse {
  return NextResponse.json(data, { status: 201 })
}

/**
 * No content response helper
 */
export function noContentResponse(): NextResponse {
  return new NextResponse(null, { status: 204 })
}

/**
 * Paginated response helper
 */
export interface PaginationMeta {
  page: number
  limit: number
  total: number
  totalPages: number
  hasNext: boolean
  hasPrev: boolean
}

export interface PaginatedResponse<T> {
  data: T[]
  meta: PaginationMeta
}

export function paginatedResponse<T>(
  data: T[],
  page: number,
  limit: number,
  total: number
): NextResponse {
  const totalPages = Math.ceil(total / limit)

  const meta: PaginationMeta = {
    page,
    limit,
    total,
    totalPages,
    hasNext: page < totalPages,
    hasPrev: page > 1,
  }

  const response: PaginatedResponse<T> = {
    data,
    meta,
  }

  return NextResponse.json(response)
}

/**
 * Extract pagination params from request
 */
export interface PaginationParams {
  page: number
  limit: number
  skip: number
}

export function getPaginationParams(request: NextRequest): PaginationParams {
  const { searchParams } = new URL(request.url)

  const page = Math.max(1, parseInt(searchParams.get('page') || '1', 10))
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20', 10)))
  const skip = (page - 1) * limit

  return { page, limit, skip }
}
