// 📁 backend/src/routes/index.ts
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import notificationRoutes from './notifications'
import authRoutes from './auth'
import timelineRoutes from './timeline'

const router = Router()

// Public routes
router.use('/auth', authRoutes)

// Protected routes
router.use('/notifications', notificationRoutes)
router.use('/timeline', timelineRoutes)

export default router
