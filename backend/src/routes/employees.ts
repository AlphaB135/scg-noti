import { Router } from 'express'
import type { RequestHandler } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { prisma } from '../prisma'
import { validateRequest } from '../middleware/validate'
import { searchEmployeeQuerySchema } from '../modules/employee/employee.dto'
import employeeService from '../modules/employee/employee.service'

const router = Router()

// Protect all employee routes
router.use(authMiddleware as RequestHandler)

// Search employees with pagination and filtering
router.get('/search',
  validateRequest({ query: searchEmployeeQuerySchema }),
  async (req, res) => {
    try {
      const searchOpts = searchEmployeeQuerySchema.parse(req.query)
      const result = await employeeService.searchEmployees(searchOpts)
      res.json(result)
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Failed to search employees' })
    }
  }
)

// List all employees with pagination
router.get('/', 
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler, 
  (async (req, res, next) => {
    try {
      const page = Number(req.query.page) || 1
      const size = Number(req.query.size) || 20
      const skip = (page - 1) * size

      const [total, employees] = await Promise.all([
        prisma.user.count({
          where: {
            employeeProfile: {
              isNot: null
            }
          }
        }),
        prisma.user.findMany({
          where: {
            employeeProfile: {
              isNot: null
            }
          },
          include: {
            employeeProfile: true
          },
          skip,
          take: size,
          orderBy: {
            employeeProfile: {
              firstName: 'asc'
            }
          }
        })
      ])

      res.json({
        data: employees,
        meta: {
          total,
          page,
          size,
          pages: Math.ceil(total / size)
        }
      })
      return
    } catch (err) {
      next(err)
    }
  }) as RequestHandler
)

// Get single employee
router.get('/:id',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  (async (req, res, next) => {
    try {
      const employee = await prisma.user.findUnique({
        where: { id: req.params.id },
        include: {
          employeeProfile: true
        }
      })

      if (!employee?.employeeProfile) {
        res.status(404).json({ error: 'Employee not found' })
        return
      }

      // Get teams that employee is member of
      const teamMemberships = await prisma.teamMember.findMany({
        where: { employeeId: employee.id },
        include: {
          team: true
        }
      })

      res.json({
        ...employee,
        teams: teamMemberships.map(tm => tm.team)
      })
      return
    } catch (err) {
      next(err)
    }
  }) as RequestHandler
)

export default router
