// 📁 backend/src/middleware/auth/jwtGuard.ts

import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prismaClient'
import { JWT_SECRET } from '../../config/env'

// ใช้ RequestHandler เพื่อให้ TypeScript รู้ว่า return type ต้องเป็น void|Promise<void>
export const jwtGuard: RequestHandler = async (req, res, next) => {
  // เพิ่ม log เบื้องต้น: เวลา, Method, URL, IP
  console.log(
    `🕒 [jwtGuard] ${new Date().toISOString()} | ${req.method} ${req.originalUrl} | IP: ${req.ip}`
  )
  console.log('🛡️ [jwtGuard] User-Agent:', req.headers['user-agent'])

  // ตรวจสอบ token จาก cookie หรือ Authorization header
  let token = req.cookies?.token as string | undefined
  
  // ถ้าไม่มี token ใน cookie ให้ลองดูจาก Authorization header
  if (!token) {
    const authHeader = req.headers.authorization
    if (authHeader && authHeader.startsWith('Bearer ')) {
      token = authHeader.substring(7) // เอาเฉพาะส่วนหลัง "Bearer "
    }
  }
  
  console.log('🛡️ [jwtGuard] Incoming token:', token)

  if (!token) {
    console.warn('🛡️ [jwtGuard] No token provided')
    res.status(401).json({ message: 'Unauthorized: No token provided' })
    return
  }

  let payload: { sessionId: string }
  try {
    payload = jwt.verify(token, JWT_SECRET!) as any
    console.log('🛡️ [jwtGuard] JWT payload:', payload)
  } catch (err) {
    console.error('🛡️ [jwtGuard] Invalid token / verify failed:', err)
    res.status(401).json({ message: 'Unauthorized: Invalid token' })
    return
  }

  console.log('🛡️ [jwtGuard] Looking up session:', payload.sessionId)
  const lookupStart = Date.now()
  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true },
  })
  console.log(
    `🛡️ [jwtGuard] Session lookup took ${Date.now() - lookupStart}ms`,
    session
  )

  if (!session) {
    console.warn('🛡️ [jwtGuard] Session not found in DB')
    res.status(401).json({ message: 'Unauthorized: Session not found' })
    return
  }

  // เช็ค fingerprint (ชั่วคราวปิดเพื่อทดสอบ)
  const currentFp = `${req.ip}|${req.headers['user-agent']}`
  console.log('🛡️ [jwtGuard] Fingerprint check:', {
    stored: session.fingerprint,
    current: currentFp,
  })
  /*
  if (session.fingerprint !== currentFp) {
    console.warn('🛡️ [jwtGuard] Fingerprint mismatch')
    res.status(401).json({
      message: 'Unauthorized: Session fingerprint mismatch',
    })
    return
  }
  */

  // เช็ค expiry
  console.log('🛡️ [jwtGuard] Session expires at:', session.expiresAt)
  if (session.expiresAt < new Date()) {
    console.warn('🛡️ [jwtGuard] Session expired')
    res.status(401).json({ message: 'Unauthorized: Session expired' })
    return
  }

  // attach user แล้วไปต่อ
  console.log(
    '🛡️ [jwtGuard] Authenticated userId:',
    session.user.id,
    '| role:',
    session.user.role
  )
  req.user = { id: session.user.id, role: session.user.role }

  // ผ่านทุกด่านแล้ว
  console.log('✅ [jwtGuard] Access granted\n')
  next()
}
