import { Router } from 'express'
import {
  list,
  listCycle,
  listMyNotifications,
  createNotification,
  updateStatus,
  reschedule,
} from '../modules/notification/notification.controller'
import * as approvalController from '../modules/approval/approval.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

router.use(authMiddleware)

// Notification routes - แก้ไขตำแหน่งของ routes ให้ถูกต้อง
router.get('/cycles', listCycle)
router.get('/mine', listMyNotifications)
router.get('/', list)
router.post('/', createNotification)
router.patch('/:id', updateStatus)
router.post('/:id/reschedule', reschedule)

// Approval routes
router.get('/:id/approvals', approvalController.listApprovals)
router.post('/:id/approvals', approvalController.createApproval)

export default router
