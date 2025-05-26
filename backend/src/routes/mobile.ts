import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import * as mobileController from '../modules/mobile/mobile.controller'

const router = Router()

// ต้อง login ก่อนถึงจะใช้งาน mobile endpoints ได้
router.use(authMiddleware)

// Dashboard endpoints
router.get('/dashboard/boxes', mobileController.getDashboardBoxes)
router.get('/dashboard/calendar', mobileController.getCalendar)

// Settings endpoints
router.get('/settings/notifications', mobileController.getNotificationSettings)
router.put('/settings/notifications', mobileController.updateNotificationSettings)

// History endpoints
router.get('/history/actions', mobileController.getActionHistory)

export default router
