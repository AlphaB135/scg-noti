import { Request, Response, NextFunction } from 'express'
import { overviewQuerySchema, metricsQuerySchema } from './dashboard.dto'
import * as dashboardService from './dashboard.service'

/**
 * GET /api/dashboard/overview
 * ดึงข้อมูล Overview แยกตามบริษัท
 */
export async function overview(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const opts = overviewQuerySchema.parse(req.query)
    const data = await dashboardService.getOverview(opts)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/dashboard/metrics
 * ดึงข้อมูล Metrics ย้อนหลัง X วัน
 */
export async function metrics(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const opts = metricsQuerySchema.parse(req.query)
    const data = await dashboardService.getMetrics(opts)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
