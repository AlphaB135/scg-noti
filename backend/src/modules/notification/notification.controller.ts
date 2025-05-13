// 📁 backend/src/modules/notification/notification.controller.ts
import { Request, Response, NextFunction } from 'express'
import * as svc from './notification.service'
import { listQuerySchema, updateStatusSchema, rescheduleSchema } from './notification.dto'

export async function list(req: Request, res: Response, next: NextFunction) {
  try {
    const opts = listQuerySchema.parse(req.query)
    const data = await svc.list(opts)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function updateStatus(req: Request, res: Response, next: NextFunction) {
  try {
    const { status } = updateStatusSchema.parse(req.body)
    const data = await svc.updateStatus(req.params.id, status)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function reschedule(req: Request, res: Response, next: NextFunction) {
  try {
    const { dueDate, reason } = rescheduleSchema.parse(req.body)
    const userId = (req as any).user.id
    const data = await svc.reschedule(req.params.id, dueDate, userId, reason)
    res.json(data)
  } catch (err) {
    next(err)
  }
}

export async function listCycle(req: Request, res: Response, next: NextFunction) {
  try {
    const opts = dto.listQuerySchema.parse(req.query)
    const data = await svc.listCycle(opts)
    res.json(data)
  } catch (err) {
    next(err)
  }
}
