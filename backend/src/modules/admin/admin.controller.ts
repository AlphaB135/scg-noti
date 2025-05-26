import { Request, Response } from 'express'
import AdminService from './admin.service'

/** GET /api/admin/overview */
export const getOverview = async (_req: Request, res: Response) => {
  try {
    const data = await AdminService.getOverview()
    res.json(data)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch admin overview' })
  }
}
