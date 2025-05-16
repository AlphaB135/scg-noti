/**
 * @fileoverview เส้นทางการเรียก API สำหรับจัดการข้อมูลพนักงาน
 */

import { Router } from 'express'
import type { RequestHandler } from 'express'
import { Request, Response, NextFunction } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { prisma } from '../prisma'
import { validateRequest } from '../middleware/validate'
import { listEmployeesQuerySchema, employeeSafeOutputSchema, searchEmployeeQuerySchema } from '../modules/employee/employee.dto'
import { employeeApiLimiter } from '../middleware/rate-limit'
import { CacheService } from '../services/cache.service'
import crypto from 'crypto'

const router = Router()

// Apply auth middleware to all routes
router.use(authMiddleware as RequestHandler)

// Employee list endpoint with caching and rate limiting
router.get('/',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  employeeApiLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate and parse query params
      const params = listEmployeesQuerySchema.parse(req.query)
      const { skip, take, page, size } = params
      const sortBy = req.query.sortBy as string || 'firstName'
      const sortOrder = req.query.sortOrder as 'asc' | 'desc' || 'asc'

      // Try cache first
      const cacheKey = `employees:list:${page}:${size}:${sortBy}:${sortOrder}`
      const cached = await CacheService.getEmployeeList(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      // Database query with type safety
      const [total, employees] = await Promise.all([
        prisma.user.count({
          where: {
            employeeProfile: { isNot: null },
            status: 'ACTIVE'
          }
        }),
        prisma.user.findMany({
          where: {
            employeeProfile: { isNot: null },
            status: 'ACTIVE'
          },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            employeeProfile: {
              select: {
                employeeCode: true,
                firstName: true,
                lastName: true,
                position: true,
                nickname: true
              }
            }
          },
          skip,
          take,
          orderBy: {
            employeeProfile: {
              [sortBy]: sortOrder
            }
          }
        })
      ])

      // Validate response data
      const safeEmployees = employees.map(emp => employeeSafeOutputSchema.parse(emp))

      const result = {
        data: safeEmployees,
        meta: {
          total,
          page,
          size,
          pages: Math.ceil(total / size)
        }
      }

      // Cache result
      await CacheService.setEmployeeList(cacheKey, result)

      // Security logging
      await prisma.securityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: (req.user as any).id,
          action: 'LIST_EMPLOYEES',
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          details: JSON.stringify({ 
            page, 
            size, 
            sortBy, 
            total,
            query: req.query 
          })
        }
      }).catch(err => console.error('Security log failed:', err))

      return res.json(result)
    } catch (error) {
      next(error)
    }
  }
)

// Search employees endpoint
router.get('/search',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  employeeApiLimiter,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const opts = searchEmployeeQuerySchema.parse(req.query)
      
      // Try cache
      const cacheKey = `employees:search:${opts.query}:${opts.page}:${opts.size}`
      const cached = await CacheService.getEmployeeList(cacheKey)
      if (cached) {
        return res.json(cached)
      }

      const [total, employees] = await Promise.all([
        prisma.user.count({
          where: {
            employeeProfile: {
              OR: [
                { firstName: { contains: opts.query, mode: 'insensitive' } },
                { lastName: { contains: opts.query, mode: 'insensitive' } },
                { employeeCode: { contains: opts.query, mode: 'insensitive' } }
              ]
            },
            status: 'ACTIVE'
          }
        }),
        prisma.user.findMany({
          where: {
            employeeProfile: {
              OR: [
                { firstName: { contains: opts.query, mode: 'insensitive' } },
                { lastName: { contains: opts.query, mode: 'insensitive' } },
                { employeeCode: { contains: opts.query, mode: 'insensitive' } }
              ]
            },
            status: 'ACTIVE'
          },
          select: {
            id: true,
            email: true,
            role: true,
            status: true,
            employeeProfile: {
              select: {
                employeeCode: true,
                firstName: true,
                lastName: true,
                position: true,
                nickname: true
              }
            }
          },
          skip: opts.skip,
          take: opts.take,
          orderBy: {
            employeeProfile: {
              firstName: 'asc'
            }
          }
        })
      ])

      // Validate output
      const safeEmployees = employees.map(emp => employeeSafeOutputSchema.parse(emp))

      const result = {
        data: safeEmployees,
        meta: {
          total,
          query: opts.query,
          page: opts.page,
          size: opts.size,
          pages: Math.ceil(total / opts.size)
        }
      }

      // Cache results
      await CacheService.setEmployeeList(cacheKey, result)

      // Security logging
      await prisma.securityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: (req.user as any).id, 
          action: 'SEARCH_EMPLOYEES',
          ipAddress: req.ip || 'unknown',
          userAgent: req.headers['user-agent'] || 'unknown',
          details: JSON.stringify({
            query: opts.query,
            page: opts.page,
            size: opts.size,
            total
          })
        }
      }).catch(err => console.error('Security log failed:', err))

      res.json(result)
    } catch (error) {
      next(error)
    }
  }
)

export default router
