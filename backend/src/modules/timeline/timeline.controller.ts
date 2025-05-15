// File: backend/src/modules/timeline/timeline.controller.ts
import { Request, Response, NextFunction } from 'express'
import { getTeamTimelineService } from './timeline.service'

/**
 * GET /api/teams/:teamId/timeline
 * ส่งคืน timeline ของกิจกรรม (login, approval) ของสมาชิกในทีม
 */
export async function getTeamTimeline(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {    const { teamId } = req.params
    const timeline = await getTeamTimelineService(teamId)
    res.json({ timeline })
    return
  } catch (err) {
    next(err)
  }
}


