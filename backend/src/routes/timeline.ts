// File: backend/src/routes/timeline.ts
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { getTeamTimeline } from '../modules/timeline/timeline.controller'

const router = Router({ mergeParams: true })

// GET /api/teams/:teamId/timeline
router.get(
  '/',
  authMiddleware,
  authorize(['USER','ADMIN','SUPERADMIN']),
  getTeamTimeline
)

export default router
