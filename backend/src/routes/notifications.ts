// 📁 backend/src/routes/notifications.ts
import { Router } from 'express'
import * as ctrl from '../modules/notification/notification.controller'
import { verifyToken } from '../middleware/authMiddleware'

const router = Router()

// POST /api/notifications — สร้าง notification ใหม่
router.post('/', verifyToken, ctrl.create)

// GET /api/notifications
router.get('/', verifyToken, ctrl.list)

// PATCH /api/notifications/:id  { status }
router.patch('/:id', verifyToken, ctrl.updateStatus)

// POST /api/notifications/:id/reschedule  { dueDate, reason }
router.post('/:id/reschedule', verifyToken, ctrl.reschedule)

// GET /api/notifications/cycles  — ดึงรายการแจ้งเตือนแบบ cycle
router.get('/cycles', verifyToken, ctrl.listCycle)

export default router
