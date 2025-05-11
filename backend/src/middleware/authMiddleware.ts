// 📁 backend/src/middlewares/authMiddleware.ts
import { RequestHandler } from 'express'
import jwt from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET || 'dev-secret'

export const verifyToken: RequestHandler = (req, res, next) => {
  // ✅ รองรับ Bearer Token และ Cookies
  let token = req.headers.authorization?.split(' ')[1]
  if (!token) token = req.cookies.accessToken
  if (!token) token = req.cookies.token

  if (!token) {
    console.warn('⚠️ Token not found in Authorization header or cookies')
    res.sendStatus(401)
    return
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET)
    ;(req as any).user = decoded
    next()
  } catch (err) {
    console.error('❌ JWT VERIFY FAIL:', err)
    res.sendStatus(403)
    return
  }
}
