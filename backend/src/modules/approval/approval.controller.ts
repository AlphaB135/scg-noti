import { Request, Response, NextFunction } from 'express'
import * as svc from './approval.service'
import { listApprovalQuerySchema, createApprovalSchema } from './approval.dto'

/**
 * GET /api/notifications/:id/approvals?page=&size=&status=
 * คืนรายการ Approval พร้อม pagination, filtering และ meta
 */
export async function listApprovals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notificationId = req.params.id
    const opts = listApprovalQuerySchema.parse(req.query)
    const result = await svc.listApprovals(notificationId, opts)
    res.json(result)
    return
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/notifications/:id/approvals
 * สร้าง Approval ใหม่ (approve/reject) พร้อมคอมเมนต์
 */
export async function createApproval(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notificationId = req.params.id
    if (!req.user?.id) {
      res.status(401).json({ error: 'Unauthorized - User not authenticated' })
      return
    }
    const userId = req.user.id
    const input = createApprovalSchema.parse(req.body)
    const data = await svc.createApproval(notificationId, userId, input)
    res.status(201).json(data)
    return
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/notifications/:id/approvals/metrics
 * คืนสถิติ approvals แยกตามสถานะ
 */
export async function getMetrics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const notificationId = req.params.id
    const metrics = await svc.getApprovalMetrics(notificationId)
    res.json(metrics)
    return
  } catch (err) {
    next(err)
  }
}
