import { Request, Response, NextFunction } from 'express'
import { boxesQuerySchema, calendarQuerySchema, notifSettingsSchema } from './mobile.dto'
import * as mobileService from './mobile.service'

/**
 * GET /mobile/dashboard/boxes
 * ดึงข้อมูล Boxes สำหรับหน้า Dashboard
 */
export async function getDashboardBoxes(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const opts = boxesQuerySchema.parse(req.query)
    const data = await mobileService.getBoxes(opts)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /mobile/dashboard/calendar
 * ดึงข้อมูลปฏิทิน
 */
export async function getCalendar(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const opts = calendarQuerySchema.parse(req.query)
    const data = await mobileService.getCalendar(opts)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /mobile/settings/notifications
 * ดึงการตั้งค่าการแจ้งเตือน
 */
export async function getNotificationSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const data = await mobileService.getNotificationSettings(userId)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

/**
 * PUT /mobile/settings/notifications
 * อัพเดทการตั้งค่าการแจ้งเตือน
 */
export async function updateNotificationSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const settings = notifSettingsSchema.parse(req.body)
    const data = await mobileService.updateNotificationSettings(userId, settings)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}

/**
 * GET /mobile/history/actions
 * ดึงประวัติการทำรายการ
 */
export async function getActionHistory(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id
    const data = await mobileService.getActionHistory(userId)
    res.json({ data })
  } catch (err) {
    next(err)
  }
}
