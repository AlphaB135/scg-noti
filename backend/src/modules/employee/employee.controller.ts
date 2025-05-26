import { Request, Response } from 'express'
import { validateRequest } from '../../middleware/validate'
import { searchEmployeeQuerySchema } from './employee.dto'
import { z } from 'zod'
import EmployeeService from './employee.service'

/** GET /api/employees/search?query=kw&page=1&size=20 */
export const searchEmployees = async (req: Request, res: Response) => {
  try {
    const searchOpts = searchEmployeeQuerySchema.parse(req.query)
    const result = await EmployeeService.searchEmployees(searchOpts)
    res.json(result)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to search employees' })
  }
}

/** POST /api/employees/check-duplicates */
export const checkDuplicateEmployees = async (req: Request, res: Response) => {
  try {
    const { employeeCodes, emails } = checkDuplicatesSchema.parse(req.body)
    const duplicates = await EmployeeService.checkDuplicates(employeeCodes, emails)
    res.json({ duplicates })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to check duplicate employees' })
  }
}

// Create express router to handle employee routes
export const employeeRouter = require('express').Router()

// Add validation schema
const checkDuplicatesSchema = z.object({
  employeeCodes: z.array(z.string()),
  emails: z.array(z.string().email())
})

employeeRouter.get(
  '/search',
  validateRequest({ query: searchEmployeeQuerySchema }),
  searchEmployees
)

employeeRouter.post(
  '/check-duplicates',
  validateRequest({ body: checkDuplicatesSchema }),
  checkDuplicateEmployees
)
