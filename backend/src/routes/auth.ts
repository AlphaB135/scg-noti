// 📁 backend/src/routes/auth.ts
import { Router } from 'express'
import { login, logout, me , refresh} from '../modules/auth/auth.controller'
// ตรงนี้ import jwtGuard จากโฟลเดอร์ modules/auth
import { jwtGuard } from '../modules/auth/jwtGuard'

const router = Router()

// Public login route
router.post('/login', login)

// Logout (protected)
router.post('/logout', jwtGuard, logout)

// Get current user (protected)
router.get('/me', jwtGuard, me)

router.post('/refresh', refresh)
export default router
