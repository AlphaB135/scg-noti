// 📁 backend/src/routes/index.ts
import { Router } from 'express'
import { login, logout, me } from '../modules/auth/auth.controller'
import { jwtGuard } from '../modules/auth/jwtGuard'
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
router.post('/auth/logout', jwtGuard, logout)
// Protected: current user info
router.get('/me', jwtGuard, me)

// ─── Dashboard (overview) ───────────────────────────────────────────────────────
router.use('/dashboard', jwtGuard, dashboardRouter)

// ─── Notifications ─────────────────────────────────────────────────────────────
router.use('/notifications', jwtGuard, notificationsRouter)

// ─── Approvals ─────────────────────────────────────────────────────────────────
/* router.use('/approvals', jwtGuard, approvalsRouter)

// ─── RPA Trigger ────────────────────────────────────────────────────────────────
router.use('/rpa', jwtGuard, rpaRouter)

// ─── Audit Logs ────────────────────────────────────────────────────────────────
router.use('/audit-logs', jwtGuard, auditLogsRouter)

// ─── Settings ──────────────────────────────────────────────────────────────────
router.use('/settings', jwtGuard, settingsRouter) */

export default router
