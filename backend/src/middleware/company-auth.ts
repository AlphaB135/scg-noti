import { Request, Response, NextFunction } from 'express'
import { prisma } from '../prisma'

/**
 * Middleware to enforce company-based access control
 * - SUPERADMIN can access all companies' data
 * - ADMIN can only access their own company's data
 * - Regular users can only access their own company's data
 */
export function companyAuth(requireCompanyMatch = true) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const user = req.user as any
      if (!user) {
        return res.status(401).json({
          error: 'Unauthorized',
          message: 'Authentication required'
        })
      }

      // SUPERADMIN can access all company data
      if (user.role === 'SUPERADMIN') {
        return next()
      }

      // Get user's company code
      const employeeProfile = await prisma.employeeProfile.findUnique({
        where: { userId: user.id },
        select: { companyCode: true }
      })

      if (!employeeProfile) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'No associated employee profile found'
        })
      }

      // Store company code on request for use in controllers
      req.companyCode = employeeProfile.companyCode

      if (!requireCompanyMatch) {
        return next()
      }

      // Check if requested company matches user's company
      const requestedCompanyCode = 
        req.params.companyCode || 
        req.query.companyCode || 
        req.body.companyCode

      if (requestedCompanyCode && requestedCompanyCode !== employeeProfile.companyCode) {
        return res.status(403).json({
          error: 'Forbidden',
          message: 'You do not have permission to access data from other companies'
        })
      }

      next()
    } catch (error) {
      console.error('Company auth error:', error)
      res.status(500).json({
        error: 'Internal server error',
        message: 'Failed to verify company access'
      })
    }
  }
}

// Type declaration to add companyCode to Request
declare global {
  namespace Express {
    interface Request {
      companyCode?: string
    }
  }
}
