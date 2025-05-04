// 📁 backend/src/middleware/auth/jwtGuard.ts

import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'
import { prisma } from '../../config/prismaClient'
import { JWT_SECRET } from '../../config/env'

// ใช้ RequestHandler เพื่อให้ TypeScript รู้ว่า return type ต้องเป็น void|Promise<void>
export const jwtGuard: RequestHandler = async (req, res, next) => {
  const token = req.cookies?.token as string | undefined
  if (!token) {
    res.status(401).json({ message: 'Unauthorized: No token provided' })
    return
  }

  let payload: { sessionId: string }
  try {
    payload = jwt.verify(token, JWT_SECRET!) as any
  } catch {
    res.status(401).json({ message: 'Unauthorized: Invalid token' })
    return
  }

  const session = await prisma.session.findUnique({
    where: { id: payload.sessionId },
    include: { user: true }
  })
  if (!session) {
    res.status(401).json({ message: 'Unauthorized: Session not found' })
    return
  }

  // เช็ค fingerprint และ expires
  const currentFp = `${req.ip}|${req.headers['user-agent']}`
  if (session.fingerprint !== currentFp) {
    res.status(401).json({ message: 'Unauthorized: Session fingerprint mismatch' })
    return
  }
  if (session.expiresAt < new Date()) {
    res.status(401).json({ message: 'Unauthorized: Session expired' })
    return
  }

  // attach user แล้วไปต่อ
  req.user = { id: session.user.id, role: session.user.role }
  next()
}
