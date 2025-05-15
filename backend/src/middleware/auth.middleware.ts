import { Request, Response, NextFunction } from 'express'
import jwt, { JwtPayload, Secret, verify } from 'jsonwebtoken'
import { prisma } from '../prisma'
import { rateLimit } from 'express-rate-limit'
import { LRUCache } from 'lru-cache'
import crypto from 'crypto'

// กำหนดค่าคงที่สำหรับการตั้งค่าต่างๆ
const CONSTANTS = {
  SESSION_CACHE_SIZE: 500,
  SESSION_CACHE_TTL: 15 * 60 * 1000, // 15 นาที
  TOKEN_BLACKLIST_SIZE: 1000,
  TOKEN_BLACKLIST_TTL: 24 * 60 * 60 * 1000, // 24 ชั่วโมง
  MAX_FAILED_ATTEMPTS: 5,
  LOCK_TIME: 15 * 60 * 1000, // 15 นาที
  MAX_REQUESTS_PER_USER: 50,
  RATE_LIMIT_WINDOW: 5 * 60 * 1000, // 5 นาที
  MAX_ACTIVE_SESSIONS: 5
} as const

// สร้าง LRU Cache สำหรับจัดการข้อมูลแคช
const caches = {
  sessions: new LRUCache<string, any>({
    max: CONSTANTS.SESSION_CACHE_SIZE,
    ttl: CONSTANTS.SESSION_CACHE_TTL,
    updateAgeOnGet: true // อัพเดท TTL เมื่อมีการเรียกใช้
  }),
  blacklist: new LRUCache<string, boolean>({
    max: CONSTANTS.TOKEN_BLACKLIST_SIZE,
    ttl: CONSTANTS.TOKEN_BLACKLIST_TTL
  }),
  rateLimiter: new LRUCache<string, number>({
    max: 10000,
    ttl: CONSTANTS.RATE_LIMIT_WINDOW
  }),
  failedAttempts: new LRUCache<string, { count: number, lockUntil: number }>({
    max: 10000,
    ttl: CONSTANTS.LOCK_TIME
  })
}

// Rate limiting ต่อ IP
export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true
})

// JWT configuration
const JWT_SECRET = process.env.JWT_SECRET as Secret
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable is required')
}

interface CustomJWTPayload extends JwtPayload {
  sessionId: string
  fingerprint?: string
  userId: string
}

// เช็ค rate limit ต่อผู้ใช้
function checkUserRateLimit(userId: string): boolean {
  const count = caches.rateLimiter.get(userId) || 0
  if (count >= CONSTANTS.MAX_REQUESTS_PER_USER) {
    return false
  }
  caches.rateLimiter.set(userId, count + 1)
  return true
}

// เช็คและบันทึกความพยายามเข้าสู่ระบบที่ล้มเหลว
function handleFailedAttempt(identifier: string): boolean {
  const attempt = caches.failedAttempts.get(identifier) || { count: 0, lockUntil: 0 }
  const now = Date.now()

  if (now < attempt.lockUntil) {
    return false
  }

  attempt.count++
  if (attempt.count >= CONSTANTS.MAX_FAILED_ATTEMPTS) {
    attempt.lockUntil = now + CONSTANTS.LOCK_TIME
  }

  caches.failedAttempts.set(identifier, attempt)
  return attempt.count < CONSTANTS.MAX_FAILED_ATTEMPTS
}

export async function authMiddleware(
  req: Request, 
  res: Response, 
  next: NextFunction
) {
  const clientIP = req.ip || req.connection.remoteAddress || 'unknown'
  const userAgent = req.headers['user-agent'] || 'unknown'
  
  try {
    // ตรวจสอบ token
    let token = req.headers.authorization?.split(' ')[1] 
    if (!token) {
      token = req.cookies?.token
    }
    
    if (!token) {
      return res.status(401).json({ 
        error: 'Unauthorized',
        detail: 'No token provided'
      })
    }

    // ตรวจสอบ token ใน blacklist
    if (caches.blacklist.get(token)) {
      return res.status(401).json({
        error: 'Unauthorized',
        detail: 'Token has been revoked'
      })
    }

    // ตรวจสอบรูปแบบ token ก่อน verify
    if (token.split('.').length !== 3) {
      handleFailedAttempt(clientIP)
      return res.status(401).json({
        error: 'Unauthorized',
        detail: 'Invalid token format: malformed JWT structure'
      })
    }

    // verify token
    let decoded: CustomJWTPayload
    try {
      decoded = verify(token, JWT_SECRET) as CustomJWTPayload
      
      // ตรวจสอบโครงสร้างข้อมูลที่จำเป็น
      const requiredFields = ['sessionId', 'userId', 'exp']
      const missingFields = requiredFields.filter(field => !decoded[field])
      
      if (missingFields.length > 0) {
        throw new Error(`Token is missing required fields: ${missingFields.join(', ')}`)
      }

      // Validate token expiration explicitly
      const now = Math.floor(Date.now() / 1000)
      if (decoded.exp && decoded.exp < now) {
        throw new Error('Token has expired')
      }
    } catch (error) {
      // บันทึก failed attempt
      handleFailedAttempt(clientIP)
      
      let failedUserId: string | undefined
      let errorDetail = 'Invalid token format'
      
      try {
        const decodedPayload = jwt.decode(token) as CustomJWTPayload
        failedUserId = decodedPayload?.userId
        
        if (error instanceof Error) {
          if (error.message === 'Token has expired') {
            errorDetail = 'Token has expired'
          } else if (error.message === 'Token is missing required fields') {
            errorDetail = 'Token is missing required fields'
          } else if (error.message.includes('jwt malformed')) {
            errorDetail = 'Malformed token'
          } else if (error.message.includes('invalid signature')) {
            errorDetail = 'Invalid token signature'
          }
        }
      } catch (e) {
        console.warn('Cannot decode invalid token:', e)
      }

      // บันทึก security log เฉพาะเมื่อมี userId
      if (failedUserId) {
        try {
          await prisma.securityLog.create({
            data: {
              id: crypto.randomUUID(),
              userId: failedUserId,
              action: 'TOKEN_INVALID',
              ipAddress: clientIP,
              userAgent,
              createdAt: new Date()
            }
          })
        } catch (logError) {
          console.error('Failed to create security log:', logError)
        }
      }

      return res.status(401).json({
        error: 'Unauthorized',
        detail: errorDetail
      })
    }

    // ตรวจสอบ rate limit ต่อผู้ใช้
    if (!checkUserRateLimit(decoded.userId)) {
      return res.status(429).json({
        error: 'Too Many Requests',
        detail: 'Rate limit exceeded'
      })
    }

    let session = caches.sessions.get(decoded.sessionId)

    // ถ้าไม่มีใน cache ดึงจาก database
    if (!session) {
      session = await prisma.session.findUnique({
        where: { 
          id: decoded.sessionId,
          status: 'ACTIVE'
        },
        include: { user: true }
      })

      if (session) {
        // เก็บลง cache
        caches.sessions.set(decoded.sessionId, session)
      }
    }

    if (!session?.user) {
      handleFailedAttempt(clientIP)
      return res.status(401).json({
        error: 'Unauthorized',
        detail: 'Invalid session'
      })
    }

    // ตรวจสอบ fingerprint
    if (decoded.fingerprint && session.fingerprint && 
        decoded.fingerprint !== session.fingerprint) {
      await prisma.securityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          action: 'FINGERPRINT_MISMATCH',
          ipAddress: clientIP,
          userAgent,
          createdAt: new Date()
        }
      }).catch(error => {
        console.error('Failed to create security log:', error)
      })
      return res.status(401).json({
        error: 'Unauthorized',
        detail: 'Invalid device fingerprint'
      })
    }

    // ตรวจสอบ User Agent
    if (session.userAgent && session.userAgent !== userAgent) {
      await prisma.securityLog.create({
        data: {
          id: crypto.randomUUID(),
          userId: session.user.id,
          action: 'USER_AGENT_CHANGED',
          ipAddress: clientIP,
          userAgent,
          createdAt: new Date()
        }
      }).catch(error => {
        console.error('Failed to create security log:', error)
      })
    }

    // ตรวจสอบการหมดอายุ
    if (new Date() > new Date(session.expiresAt)) {
      caches.sessions.delete(decoded.sessionId)
      return res.status(401).json({
        error: 'Unauthorized',
        detail: 'Session expired'
      })
    }

    // บันทึก security log
    await prisma.securityLog.create({
      data: {
        id: crypto.randomUUID(),
        userId: session.user.id,
        action: 'AUTH_SUCCESS',
        ipAddress: clientIP,
        userAgent,
        createdAt: new Date()
      }
    }).catch(error => {
      console.error('Failed to create security log:', error)
    })

    // ล้างการนับความพยายามที่ล้มเหลว
    caches.failedAttempts.delete(clientIP)

    req.user = session.user
    next()
  } catch (error) {
    console.error('Auth error:', error)
    return res.status(401).json({
      error: 'Unauthorized',
      detail: 'Authentication failed'
    })
  }
}

// ทำความสะอาด expired sessions
async function cleanupExpiredSessions() {
  const now = new Date()
  const CHUNK_SIZE = 100
  
  try {
    while (true) {
      const expiredSessions = await prisma.session.findMany({
        where: {
          OR: [
            { expiresAt: { lt: now } },
            { status: 'EXPIRED' }
          ]
        },
        select: { id: true },
        take: CHUNK_SIZE
      })
      
      if (expiredSessions.length === 0) break
      
      // อัพเดทสถานะ
      await prisma.session.updateMany({
        where: {
          id: {
            in: expiredSessions.map(s => s.id)
          }
        },
        data: {
          status: 'EXPIRED'
        }
      })
      
      // ล้าง cache
      expiredSessions.forEach(session => {
        caches.sessions.delete(session.id)
      })
      
      if (expiredSessions.length < CHUNK_SIZE) break
    }
  } catch (error) {
    console.error('Session cleanup failed:', error)
  }
}

// เรียกใช้ cleanup ทุก 1 ชั่วโมง
setInterval(cleanupExpiredSessions, 60 * 60 * 1000)