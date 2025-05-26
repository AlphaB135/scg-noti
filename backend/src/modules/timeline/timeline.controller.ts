// File: backend/src/modules/timeline/timeline.controller.ts
import { Request, Response, NextFunction } from 'express'
import { getTeamTimelineService } from './timeline.service'

/**
 * GET /api/teams/:teamId/timeline
 * ส่งคืน timeline ของกิจกรรม (login, approval) ของสมาชิกในทีม
 * 
 * @param {Request} req - Express Request object พร้อมด้วย teamId ใน params
 * @param {Response} res - Express Response object
 * @param {NextFunction} next - Express NextFunction
 * @returns {Promise<void>}
 * 
 * @throws {Error} เมื่อไม่สามารถดึงข้อมูล timeline ได้
 * 
 * @example
 * // ตัวอย่างการเรียกใช้งาน
 * GET /api/teams/123/timeline
 * 
 * // ตัวอย่าง Response
 * {
 *   "timeline": [
 *     {
 *       "type": "login",
 *       "timestamp": "2023-01-01T00:00:00Z", 
 *       "actor": {
 *         "id": "1",
 *         "email": "user@example.com",
 *         "firstName": "John",
 *         "nickname": "Johnny"
 *       },
 *       "details": {...}
 *     }
 *   ]
 * }
 */
export async function getTeamTimeline(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {    
    const { teamId } = req.params
    const timeline = await getTeamTimelineService(teamId)
    res.json({ timeline })
    return
  } catch (err) {
    next(err)
  }
}


