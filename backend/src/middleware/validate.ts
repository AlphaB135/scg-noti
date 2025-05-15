import { Request, Response, NextFunction } from 'express'
import { z } from 'zod'

type ValidateSchema = {
  body?: z.ZodType<any, any>
  query?: z.ZodType<any, any>
  params?: z.ZodType<any, any>
}

export const validateRequest = (schema: ValidateSchema) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      if (schema.body) {
        req.body = await schema.body.parseAsync(req.body)
      }
      if (schema.query) {
        req.query = await schema.query.parseAsync(req.query)
      }
      if (schema.params) {
        req.params = await schema.params.parseAsync(req.params)
      }
      next()
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({
          error: 'Validation failed',
          details: error.errors
        })
      }
      return res.status(500).json({ error: 'Internal server error' })
    }
  }
}
