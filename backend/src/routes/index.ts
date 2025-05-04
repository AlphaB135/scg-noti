// 📁 backend/src/routes/index.ts
import { Router } from 'express'
import { login, logout, me } from '../modules/auth/auth.controller'
import { jwtGuard } from '../middleware/auth/jwtGuard'
import dashboardRouter from './dashboard'

const r = Router()

// Auth routes
r.post('/auth/login', login)
// Logout และลบ session
r.post('/auth/logout', jwtGuard, logout)
// ดึงข้อมูลผู้ใช้งานปัจจุบัน
r.get('/me', jwtGuard, me)

// Dashboard routes (ต้อง authenticated ก่อน)
r.use('/dashboard', jwtGuard, dashboardRouter)

export default r
