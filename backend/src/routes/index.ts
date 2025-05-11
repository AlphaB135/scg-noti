// 📁 backend/src/routes/index.ts
import { Router } from 'express'
import { login, logout, me } from '../modules/auth/auth.controller'
import { verifyToken } from '../middleware/authMiddleware' 
import dashboardRouter from './dashboard'
import notificationsRouter from './notifications'
/* import approvalsRouter from './approvals'
import rpaRouter from './rpa'
import auditLogsRouter from './audit-logs'
import settingsRouter from './settings'
 */
const router = Router()

// ─── Auth routes ────────────────────────────────────────────────────────────────
// Public: login
router.post('/auth/login', login)
// Protected: logout & clear session
router.post('/auth/logout', verifyToken, logout)
// Protected: current user info
router.get('/me', verifyToken, me)

// ─── Dashboard (overview) ───────────────────────────────────────────────────────
router.use('/dashboard', verifyToken, dashboardRouter)

// ─── Notifications ─────────────────────────────────────────────────────────────
router.use('/notifications', verifyToken, notificationsRouter)// ─── Approvals ─────────────────────────────────────────────────────────────────
/* router.use('/approvals', jwtGuard, approvalsRouter)

// ─── RPA Trigger ────────────────────────────────────────────────────────────────
router.use('/rpa', jwtGuard, rpaRouter)

// ─── Audit Logs ────────────────────────────────────────────────────────────────
router.use('/audit-logs', jwtGuard, auditLogsRouter)

// ─── Settings ──────────────────────────────────────────────────────────────────
router.use('/settings', jwtGuard, settingsRouter) */

export default router
