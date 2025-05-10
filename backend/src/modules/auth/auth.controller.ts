// 📁 backend/src/modules/auth/auth.controller.ts
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import crypto from 'crypto'
import { JWT_SECRET } from '../../config/env'
import { prisma } from '../../config/prismaClient'

// Helper เพื่อคืน options เดียวกันทั้ง access & refresh cookies
const cookieOptions = (maxAge: number) => ({
  httpOnly: true,
  sameSite: 'Strict',
  secure: process.env.NODE_ENV === 'production',
  maxAge,
  path: '/',
})

// Login handler
export async function login(req: Request, res: Response): Promise<void> {
  try {
    console.log('📥 [LOGIN] req.body:', req.body)

    const { employeeCode, email, password } =
      req.body as { employeeCode?: string; email?: string; password?: string }
    const code = employeeCode ?? email

    if (!code || !password) {
      console.warn('⚠️ Missing credentials:', { code, password })
      res.status(400).json({ message: 'Missing credentials' })
      return
    }

    const user = await prisma.user.findFirst({
      where: { employeeProfile: { employeeCode: code } },
      include: { employeeProfile: true },
    })
    if (!user) {
      console.warn('⚠️ ไม่พบผู้ใช้:', code)
      res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    const valid = await bcrypt.compare(password, user.passwordHash)
    if (!valid) {
      console.warn('⚠️ รหัสผ่านไม่ถูกต้อง:', code)
      res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' })
      return
    }

    // สร้าง session ใน DB
    const fingerprint = `${req.ip}|${req.headers['user-agent']}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 นาที
    const session = await prisma.session.create({
      data: { userId: user.id, fingerprint, expiresAt },
    })

    // เซ็น Access JWT (15m)
    const token = jwt.sign({ sessionId: session.id }, JWT_SECRET!, {
      expiresIn: '15m',
    })

    // สร้าง Refresh Token (7 วัน)
    const rawRefresh = crypto.randomBytes(64).toString('hex')
    const hashedRefresh = crypto.createHash('sha256').update(rawRefresh).digest('hex')
    const refreshExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: hashedRefresh, refreshExpires },
    })

    console.log(
      '✅ Authenticated:',
      code,
      '| Role:',
      user.role,
      '| SessionID:',
      session.id
    )

    // เซ็ต Cookies ทั้งสองตัว
    res
      .cookie('token', token, cookieOptions(15 * 60 * 1000))
      .cookie('refreshToken', rawRefresh, cookieOptions(7 * 24 * 60 * 60 * 1000))
      .json({ ok: true, role: user.role })
  } catch (err) {
    console.error('❌ [LOGIN ERROR]', err)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์' })
  }
}

// Logout handler
export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token as string | undefined
  if (token) {
    try {
      const { sessionId } = jwt.verify(token, JWT_SECRET!) as any
      await prisma.session.delete({ where: { id: sessionId } })
    } catch (er) {
      console.error('❌ [LOGOUT ERROR]', er)
    }
  }

  console.log('🔓 Logged out session')
  res
    .clearCookie('token', { ...cookieOptions(0) })
    .clearCookie('refreshToken', { ...cookieOptions(0) })
    .json({ ok: true })
}

// Me handler
export async function me(req: Request, res: Response): Promise<void> {
  console.log('📥 [ME] req.user:', req.user)
  const userId = (req.user as any)?.id
  if (!userId) {
    console.warn('⚠️ Unauthorized access to /me')
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employeeProfile: true },
  })
  if (!user) {
    console.warn('⚠️ User not found for id:', userId)
    res.status(404).json({ message: 'User not found' })
    return
  }

  console.log('✅ [ME] returning user:', user.employeeProfile!.employeeCode)
  res.json({ user })
}

// Refresh token handler
export async function refresh(req: Request, res: Response): Promise<void> {
  try {
    const raw = req.cookies?.refreshToken as string | undefined
    if (!raw) {
      return res.status(401).json({ message: 'No refresh token' })
    }

    const hashed = crypto.createHash('sha256').update(raw).digest('hex')
    const session = await prisma.session.findFirst({
      where: { refreshToken: hashed },
      include: { user: true },
    })

    if (!session || !session.refreshExpires || session.refreshExpires < new Date()) {
      res.clearCookie('token', { ...cookieOptions(0) })
      res.clearCookie('refreshToken', { ...cookieOptions(0) })
      return res.status(401).json({ message: 'Invalid or expired refresh token' })
    }

    // issue new tokens
    const newAccess = jwt.sign({ sessionId: session.id }, JWT_SECRET!, {
      expiresIn: '15m',
    })
    const newRaw = crypto.randomBytes(64).toString('hex')
    const newHashed = crypto.createHash('sha256').update(newRaw).digest('hex')
    const newExpires = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    await prisma.session.update({
      where: { id: session.id },
      data: { refreshToken: newHashed, refreshExpires: newExpires },
    })

    res
      .cookie('token', newAccess, cookieOptions(15 * 60 * 1000))
      .cookie('refreshToken', newRaw, cookieOptions(7 * 24 * 60 * 60 * 1000))
      .json({ ok: true })
  } catch (err) {
    console.error('❌ [REFRESH ERROR]', err)
    res.status(500).json({ message: 'Server error' })
  }
}
