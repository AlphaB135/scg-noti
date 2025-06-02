import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { getBulkMemberStats } from '../modules/member/member.controller'

const router = Router()

// Apply authentication to all member routes
router.use(authMiddleware)

// GET /api/members/bulk-stats
router.post('/bulk-stats',
  authorize(['USER', 'ADMIN', 'SUPERADMIN']),
  getBulkMemberStats
)

export default router
