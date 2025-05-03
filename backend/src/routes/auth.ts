// src/routes/auth.ts
import express from 'express'
import { login, logout, me } from '../modules/auth/auth.controller'
import { authenticateToken } from '../middleware/authMiddleware'

const router = express.Router()

router.post('/login', login)
router.post('/logout', logout)
router.get('/me', authenticateToken, me)

export default router
