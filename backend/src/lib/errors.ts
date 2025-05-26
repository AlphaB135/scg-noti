/**
 * Custom application error class with additional properties for error handling
 */
export class AppError extends Error {
  public status: number
  public code?: string
  public details?: any

  constructor(
    message: string,
    status: number = 500,
    code?: string,
    details?: any
  ) {
    super(message)
    this.name = this.constructor.name
    this.status = status
    this.code = code
    this.details = details

    // Capture stack trace
    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor)
    }
  }
}

/**
 * HTTP 400 Bad Request Error
 */
export class BadRequestError extends AppError {
  constructor(message: string = 'Bad Request', code?: string, details?: any) {
    super(message, 400, code, details)
  }
}

/**
 * HTTP 401 Unauthorized Error
 */
export class UnauthorizedError extends AppError {
  constructor(message: string = 'Unauthorized', code?: string, details?: any) {
    super(message, 401, code, details)
  }
}

/**
 * HTTP 403 Forbidden Error
 */
export class ForbiddenError extends AppError {
  constructor(message: string = 'Forbidden', code?: string, details?: any) {
    super(message, 403, code, details)
  }
}

/**
 * HTTP 404 Not Found Error
 */
export class NotFoundError extends AppError {
  constructor(message: string = 'Not Found', code?: string, details?: any) {
    super(message, 404, code, details)
  }
}

/**
 * HTTP 409 Conflict Error
 */
export class ConflictError extends AppError {
  constructor(message: string = 'Conflict', code?: string, details?: any) {
    super(message, 409, code, details)
  }
}

/**
 * HTTP 429 Too Many Requests Error
 */
export class TooManyRequestsError extends AppError {
  constructor(message: string = 'Too Many Requests', code?: string, details?: any) {
    super(message, 429, code, details)
  }
}

/**
 * HTTP 500 Internal Server Error
 */
export class InternalServerError extends AppError {
  constructor(message: string = 'Internal Server Error', code?: string, details?: any) {
    super(message, 500, code, details)
  }
}

/**
 * Helper function to determine if an error is a known AppError
 */
export function isAppError(error: any): error is AppError {
  return error instanceof AppError
}

/**
 * Convert an unknown error to an AppError
 */
export function toAppError(error: any): AppError {
  if (isAppError(error)) {
    return error
  }

  if (error instanceof Error) {
    return new AppError(error.message)
  }

  return new AppError(String(error))
}
