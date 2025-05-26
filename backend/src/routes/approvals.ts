import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import {
  listApprovals,
  createApproval,
  getMetrics
} from '../modules/approval/approval.controller'

const router = Router({ mergeParams: true })

// Import company auth middleware
import { companyAuth } from '../middleware/company-auth'

// GET  /api/notifications/:id/approvals
router.get('/', 
  authMiddleware,
  authorize(['USER', 'ADMIN','SUPERADMIN']),
  companyAuth(true),
  listApprovals
)

// POST /api/notifications/:id/approvals
router.post('/', 
  authMiddleware,
  authorize(['USER']),
  companyAuth(true),
  createApproval
)

// GET /api/notifications/:id/approvals/metrics
router.get('/metrics',
  authMiddleware,
  authorize(['ADMIN','SUPERADMIN']),
  companyAuth(false), // Allow SUPERADMIN to see all metrics
  getMetrics
)

export default router
