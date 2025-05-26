import { Request, Response, NextFunction } from 'express'
import { boxesQuerySchema, calendarQuerySchema, notifSettingsSchema } from './mobile.dto'
import * as mobileService from './mobile.service'

/**
 * GET /mobile/dashboard/boxes
 * ดึงข้อมูล Boxes สำหรับหน้า Dashboard ในแอพมือถือ
 * 
 * @param {Request} req - Express Request object พร้อมด้วย query params สำหรับกรองข้อมูล
 * @param {Response} res - Express Response object 
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @example
 * // ตัวอย่างการเรียกใช้งาน
 * GET /mobile/dashboard/boxes?companyCode=SCG001
 * 
 * // ตัวอย่าง Response
 * {
 *   "data": {
 *     "notifications": 10,
 *     "approvals": 5,
 *     "teamUpdates": 3
 *   }
 * }
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
 * ดึงข้อมูลปฏิทินสำหรับแสดงในแอพมือถือ
 * 
 * @param {Request} req - Express Request object พร้อมด้วย query params สำหรับเดือนและปีที่ต้องการ
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @example
 * // ตัวอย่างการเรียกใช้งาน
 * GET /mobile/dashboard/calendar?month=1&year=2024&companyCode=SCG001
 * 
 * // ตัวอย่าง Response
 * {
 *   "data": [
 *     {
 *       "id": "1",
 *       "title": "ประชุมทีม",
 *       "dueDate": "2024-01-15T09:00:00Z",
 *       "status": "PENDING",
 *       "type": "notification"
 *     }
 *   ]
 * }
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
 * ดึงการตั้งค่าการแจ้งเตือนของผู้ใช้บนแอพมือถือ
 * 
 * @param {Request} req - Express Request object พร้อมด้วย user ที่ login เข้าระบบ
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @example
 * // ตัวอย่าง Response
 * {
 *   "data": {
 *     "pushEnabled": true,
 *     "emailEnabled": false,
 *     "quietHours": {
 *       "start": "22:00",
 *       "end": "07:00"
 *     }
 *   }
 * }
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
 * อัพเดทการตั้งค่าการแจ้งเตือนของผู้ใช้บนแอพมือถือ
 * 
 * @param {Request} req - Express Request object พร้อมด้วย user และการตั้งค่าใหม่ในตัว body
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @example
 * // ตัวอย่าง Request Body
 * {
 *   "pushEnabled": true,
 *   "emailEnabled": false,
 *   "quietHours": {
 *     "start": "22:00",
 *     "end": "07:00"
 *   }
 * }
 * 
 * // ตัวอย่าง Response
 * {
 *   "data": {
 *     "pushEnabled": true,
 *     "emailEnabled": false,
 *     "quietHours": {
 *       "start": "22:00",  
 *       "end": "07:00"
 *     }
 *   }
 * }
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
 * ดึงประวัติการทำรายการของผู้ใช้บนแอพมือถือ
 * 
 * @param {Request} req - Express Request object พร้อมด้วย user ที่ login เข้าระบบ
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @example
 * // ตัวอย่าง Response
 * {
 *   "data": [
 *     {
 *       "id": "1",
 *       "type": "LOGIN",
 *       "description": "เข้าสู่ระบบผ่านแอพมือถือ",
 *       "timestamp": "2024-01-15T09:00:00Z",
 *       "device": {
 *         "type": "MOBILE",
 *         "os": "iOS",
 *         "version": "15.0"
 *       }
 *     }
 *   ]
 * }
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
