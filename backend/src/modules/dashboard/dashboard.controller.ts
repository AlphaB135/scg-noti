import { Request, Response, NextFunction } from 'express'
import { overviewQuerySchema, metricsQuerySchema } from './dashboard.dto'
import * as dashboardService from './dashboard.service'

/**
 * GET /api/dashboard/overview
 * ดึงข้อมูล Overview แยกตามบริษัท
 * 
 * @param {Request} req - Express Request object พร้อมด้วย query params สำหรับกรองข้อมูล
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @example
 * // ตัวอย่างการเรียกใช้งาน
 * GET /api/dashboard/overview?companyCode=SCG001
 * 
 * // ตัวอย่าง Response
 * {
 *   "data": {
 *     "notifications": {
 *       "total": 100,
 *       "pending": 20,
 *       "approved": 80,
 *       "approvedPercentage": 80
 *     },
 *     "approvals": {
 *       "total": 50,
 *       "pending": 10,
 *       "completed": 40,
 *       "completedPercentage": 80
 *     },
 *     "users": {
 *       "total": 30,
 *       "active": 25,
 *       "activePercentage": 83
 *     },
 *     "recentActivity": [...]
 *   }
 * }
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
 * ดึงข้อมูล Metrics ย้อนหลัง X วันเพื่อแสดงในกราฟ
 * 
 * @param {Request} req - Express Request object พร้อมด้วย query params สำหรับกำหนดช่วงเวลา
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @example
 * // ตัวอย่างการเรียกใช้งาน
 * GET /api/dashboard/metrics?days=30&companyCode=SCG001
 * 
 * // ตัวอย่าง Response
 * {
 *   "data": {
 *     "notifications": [
 *       { "date": "2023-01-01", "count": 10 },
 *       { "date": "2023-01-02", "count": 15 }
 *     ],
 *     "approvals": [
 *       { "date": "2023-01-01", "count": 5 },
 *       { "date": "2023-01-02", "count": 8 }
 *     ]
 *   }
 * }
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
