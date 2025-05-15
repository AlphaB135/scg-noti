import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import {
  listApprovals,
  createApproval,
  getMetrics
} from '../modules/approval/approval.controller'

const router = Router({ mergeParams: true })

// GET  /api/notifications/:id/approvals
router.get('/', 
  authMiddleware,
  authorize(['USER', 'ADMIN','SUPERADMIN']), 
  listApprovals
)

// POST /api/notifications/:id/approvals
router.post('/', 
  authMiddleware,
  authorize(['USER']), 
  createApproval
)

// GET /api/notifications/:id/approvals/metrics
router.get('/metrics',
  authMiddleware,
  authorize(['ADMIN','SUPERADMIN']),
  getMetrics
)

export default router
