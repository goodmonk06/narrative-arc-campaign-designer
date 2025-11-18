/**
 * Centralized error handling for the Narrative Arc Campaign Designer
 *
 * This module defines custom error classes and utilities for consistent
 * error handling across the application.
 */

/**
 * Base application error class
 */
export class AppError extends Error {
  constructor(
    message: string,
    public statusCode: number = 500,
    public code: string = 'INTERNAL_ERROR',
    public details?: unknown
  ) {
    super(message)
    this.name = this.constructor.name
    Error.captureStackTrace(this, this.constructor)
  }

  toJSON() {
    return {
      error: {
        name: this.name,
        message: this.message,
        code: this.code,
        statusCode: this.statusCode,
        details: this.details,
      },
    }
  }
}

/**
 * Validation error (400)
 */
export class ValidationError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 400, 'VALIDATION_ERROR', details)
  }
}

/**
 * Not found error (404)
 */
export class NotFoundError extends AppError {
  constructor(resource: string, identifier?: string) {
    const message = identifier
      ? `${resource} with identifier '${identifier}' not found`
      : `${resource} not found`
    super(message, 404, 'NOT_FOUND')
  }
}

/**
 * Unauthorized error (401)
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized') {
    super(message, 401, 'UNAUTHORIZED')
  }
}

/**
 * Forbidden error (403)
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden') {
    super(message, 403, 'FORBIDDEN')
  }
}

/**
 * Conflict error (409)
 */
export class ConflictError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 409, 'CONFLICT', details)
  }
}

/**
 * Rate limit error (429)
 */
export class RateLimitError extends AppError {
  constructor(message: string = 'Too many requests') {
    super(message, 429, 'RATE_LIMIT_EXCEEDED')
  }
}

/**
 * External service error (502)
 */
export class ExternalServiceError extends AppError {
  constructor(service: string, details?: unknown) {
    super(`External service '${service}' error`, 502, 'EXTERNAL_SERVICE_ERROR', details)
  }
}

/**
 * Database error (500)
 */
export class DatabaseError extends AppError {
  constructor(message: string, details?: unknown) {
    super(message, 500, 'DATABASE_ERROR', details)
  }
}

/**
 * Type guard to check if an error is an AppError
 */
export function isAppError(error: unknown): error is AppError {
  return error instanceof AppError
}

/**
 * Error response shape for API responses
 */
export interface ErrorResponse {
  error: {
    name: string
    message: string
    code: string
    statusCode: number
    details?: unknown
    timestamp?: string
    path?: string
    requestId?: string
  }
}

/**
 * Format an error into a consistent API response
 */
export function formatErrorResponse(
  error: unknown,
  path?: string,
  requestId?: string
): ErrorResponse {
  if (isAppError(error)) {
    return {
      error: {
        name: error.name,
        message: error.message,
        code: error.code,
        statusCode: error.statusCode,
        details: error.details,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
    }
  }

  // Handle Zod validation errors
  if (error && typeof error === 'object' && 'name' in error && error.name === 'ZodError') {
    return {
      error: {
        name: 'ValidationError',
        message: 'Validation failed',
        code: 'VALIDATION_ERROR',
        statusCode: 400,
        details: error,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
    }
  }

  // Handle Prisma errors
  if (error && typeof error === 'object' && 'code' in error) {
    const prismaError = error as { code: string; meta?: unknown }
    let message = 'Database operation failed'
    let statusCode = 500

    switch (prismaError.code) {
      case 'P2002':
        message = 'A record with this value already exists'
        statusCode = 409
        break
      case 'P2025':
        message = 'Record not found'
        statusCode = 404
        break
    }

    return {
      error: {
        name: 'DatabaseError',
        message,
        code: 'DATABASE_ERROR',
        statusCode,
        details: prismaError.meta,
        timestamp: new Date().toISOString(),
        path,
        requestId,
      },
    }
  }

  // Generic error
  const message = error instanceof Error ? error.message : 'An unexpected error occurred'
  return {
    error: {
      name: 'InternalServerError',
      message,
      code: 'INTERNAL_ERROR',
      statusCode: 500,
      timestamp: new Date().toISOString(),
      path,
      requestId,
    },
  }
}
