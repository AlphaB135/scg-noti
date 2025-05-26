/**
 * @fileoverview เส้นทางการเรียก API สำหรับการยืนยันตัวตนในระบบ
 * รองรับการเข้าสู่ระบบ ออกจากระบบ ดูข้อมูลผู้ใช้ปัจจุบัน และรีเฟรชโทเค็น
 * 
 * เส้นทางที่รองรับ:
 * - POST /login - เข้าสู่ระบบ (สาธารณะ)
 * - POST /logout - ออกจากระบบ (ต้องยืนยันตัวตน)
 * - GET /me - ดูข้อมูลผู้ใช้ปัจจุบัน (ต้องยืนยันตัวตน)
 * - POST /refresh - รีเฟรชโทเค็น (สาธารณะ, ใช้ refresh token)
 */

import { Router } from 'express'
import { login, logout, me , refresh} from '../modules/auth/auth.controller'
import { jwtGuard } from '../modules/auth/jwtGuard'

const router = Router()

/**
 * เข้าสู่ระบบ
 * @route POST /login
 * @body {Object} credentials - ข้อมูลการเข้าสู่ระบบ
 * @body {string} credentials.email - อีเมลผู้ใช้
 * @body {string} credentials.password - รหัสผ่าน
 * @returns {Object} โทเค็นและข้อมูลผู้ใช้
 */
router.post('/login', login)

/**
 * ออกจากระบบ - ยกเลิกการใช้งานเซสชันปัจจุบัน
 * @route POST /logout
 * @security JWT
 */
router.post('/logout', jwtGuard, logout)

/**
 * ดูข้อมูลผู้ใช้ที่เข้าสู่ระบบ
 * @route GET /me
 * @security JWT
 * @returns {Object} ข้อมูลผู้ใช้
 */
router.get('/me', jwtGuard, me)

/**
 * รีเฟรชโทเค็น
 * @route POST /refresh
 * @body {string} refreshToken - Refresh token เดิม
 * @returns {Object} โทเค็นใหม่
 */
router.post('/refresh', refresh)

export default router
