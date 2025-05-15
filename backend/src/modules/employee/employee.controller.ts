import { Request, Response } from 'express'
import { validateRequest } from '../../middleware/validate'
import { searchEmployeeQuerySchema } from './employee.dto'
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

// Create express router to handle employee routes
export const employeeRouter = require('express').Router()

employeeRouter.get(
  '/search',
  validateRequest({ query: searchEmployeeQuerySchema }),
  searchEmployees
)
