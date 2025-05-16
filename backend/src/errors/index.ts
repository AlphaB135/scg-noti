// Custom API error class with typed error properties
export class ApiError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code?: string,
    public details?: any
  ) {
    super(message)
    this.name = 'ApiError'
    
    // Maintain proper stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, ApiError)
    }
  }

  toJSON() {
    return {
      error: this.message,
      code: this.code,
      details: this.details,
      ...(process.env.NODE_ENV === 'development' && { stack: this.stack })
    }
  }
}

// Common error types
export class ValidationError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 400, 'VALIDATION_ERROR', details)
    this.name = 'ValidationError'
  }
}

export class AuthenticationError extends ApiError {
  constructor(message: string = 'Authentication failed', details?: any) {
    super(message, 401, 'AUTHENTICATION_ERROR', details)
    this.name = 'AuthenticationError'
  }
}

export class AuthorizationError extends ApiError {
  constructor(message: string = 'Not authorized', details?: any) {
    super(message, 403, 'AUTHORIZATION_ERROR', details)
    this.name = 'AuthorizationError'
  }
}

export class NotFoundError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 404, 'NOT_FOUND', details)
    this.name = 'NotFoundError'
  }
}

export class ConflictError extends ApiError {
  constructor(message: string, details?: any) {
    super(message, 409, 'CONFLICT', details)
    this.name = 'ConflictError'
  }
}

// Rate limit error
export class TooManyRequestsError extends ApiError {
  constructor(message: string = 'Too many requests', details?: any) {
    super(message, 429, 'RATE_LIMIT_EXCEEDED', details)
    this.name = 'TooManyRequestsError'
  }
}

// Database error wrapper
export class DatabaseError extends ApiError {
  constructor(message: string = 'Database operation failed', details?: any) {
    super(message, 500, 'DATABASE_ERROR', details)
    this.name = 'DatabaseError'
  }
}

// Create error helper functions
export const createError = {
  validation: (message: string, details?: any) => new ValidationError(message, details),
  authentication: (message?: string, details?: any) => new AuthenticationError(message, details),
  authorization: (message?: string, details?: any) => new AuthorizationError(message, details),
  notFound: (message: string, details?: any) => new NotFoundError(message, details),
  conflict: (message: string, details?: any) => new ConflictError(message, details),
  tooManyRequests: (message?: string, details?: any) => new TooManyRequestsError(message, details),
  database: (message?: string, details?: any) => new DatabaseError(message, details)
}
