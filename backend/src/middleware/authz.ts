import { Request, Response, NextFunction } from 'express'

export function authorize(roles: string[]) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const userRole = (req.user as any)?.role

    if (!userRole || !roles.includes(userRole)) {
      res.status(403).json({
        error: 'Forbidden',
        message: 'You do not have permission to access this resource'
      })
      return
    }

    next()
  }
}
