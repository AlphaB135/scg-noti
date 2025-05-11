import { Router } from 'express'
import * as ctrl from '../modules/notification/notification.controller'
import { verifyToken } from '../middleware/authMiddleware'

const router = Router()

// GET /api/notifications
router.get('/', verifyToken, ctrl.list)

// PATCH /api/notifications/:id  { status }
router.patch('/:id', verifyToken, ctrl.updateStatus)

// POST /api/notifications/:id/reschedule  { dueDate, reason }
router.post('/:id/reschedule', verifyToken, ctrl.reschedule)

export default router
