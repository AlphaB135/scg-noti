// 📁 backend/src/routes/auth.ts
import { Router, RequestHandler } from 'express'
import { login, logout, me } from '../modules/auth/auth.controller'
import { jwtGuard } from '../middleware/auth/jwtGuard'

const router = Router()

// Public login route
router.post(
  '/login',
  // cast through unknown to satisfy RequestHandler signature
  (login as unknown) as RequestHandler
)

// Logout (protected) – invalidate session
router.post(
  '/logout',
  (jwtGuard as unknown) as RequestHandler,
  (logout as unknown) as RequestHandler
)

// Get current user (protected)
router.get(
  '/me',
  (jwtGuard as unknown) as RequestHandler,
  (me as unknown) as RequestHandler
)

export default router
