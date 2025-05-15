// 📁 backend/src/routes/index.ts
import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import notificationRoutes from './notifications'
import authRoutes from './auth'

const router = Router()

// Public routes
router.use('/auth', authRoutes)

// Protected routes
router.use('/notifications', notificationRoutes)

export default router
