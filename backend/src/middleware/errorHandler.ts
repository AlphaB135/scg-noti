// File: backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'
import { ZodError } from 'zod'
import { PrismaClientKnownRequestError, PrismaClientValidationError } from '@prisma/client/runtime/library'

/**
 * Centralized error handling middleware
 * Place this in 'backend/src/middleware/errorHandler.ts'
 */
export default function errorHandler(
  err: unknown,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  // Log all errors
  console.error('❌ Error:', err)

  // Zod validation errors
  if (err instanceof ZodError) {
    return res.status(422).json({
      error: 'Validation Error',
      details: err.errors,
    })
  }

  // Prisma "Not Found" errors
  if (err instanceof PrismaClientKnownRequestError && err.code === 'P2025') {
    return res.status(404).json({ error: 'Resource not found' })
  }

  // Other Prisma known errors
  if (err instanceof PrismaClientKnownRequestError) {
    return res.status(400).json({ error: err.message })
  }

  // Prisma validation errors
  if (err instanceof PrismaClientValidationError) {
    return res.status(400).json({ error: err.message })
  }

  // Default to 500
  res.status(500).json({ error: 'Internal Server Error' })
}
