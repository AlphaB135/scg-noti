// 📁 backend/src/modules/notification/notification.controller.ts
import { Request, Response, NextFunction } from 'express'
import * as svc from './notification.service'
import {
  listQuerySchema,
  updateStatusSchema,
  rescheduleSchema,
  createNotificationSchema,
} from './notification.dto'

// List notifications with pagination
export async function list(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    // parse opts ก่อน
    const opts = listQuerySchema.parse(req.query)
    const result = await svc.list(opts)
    res.json(result)
    return
  } catch (err) {
    next(err)
  }
}

// List recurring (cycled) notifications
export async function listCycle(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opts = listQuerySchema.parse(req.query)
    const data = await svc.listCycle(opts)
    res.json({ data })
    return
  } catch (err) {
    next(err)
  }
}

// Update notification status
export async function updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { status } = updateStatusSchema.parse(req.body)
    const data = await svc.updateStatus(req.params.id, status)
    res.json(data)
    return
  } catch (err) {
    next(err)
  }
}

// Reschedule a notification
export async function reschedule(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { dueDate } = rescheduleSchema.parse(req.body)
    const data = await svc.reschedule(req.params.id, dueDate)
    res.json(data)
    return
  } catch (err) {
    next(err)
  }
}

// Create a new notification with recipients
export async function createNotification(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createNotificationSchema.parse(req.body)
    const userId = (req as any).user?.id
    if (!userId) {
      res.status(401).json({ error: 'Missing user ID' })
      return
    }
    const data = await svc.create(input, userId)
    res.status(201).json(data)
    return
  } catch (err) {
    next(err)
  }
}

// List notifications visible to the current user
export async function listMyNotifications(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = (req as any).user
    const data = await svc.listMine(
      user.id,
      user.profile.companyCode,
      user.profile.teamIds
    )
    res.json({ data })
    return
  } catch (err) {
    next(err)
  }
}
