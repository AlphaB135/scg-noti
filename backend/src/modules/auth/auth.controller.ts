// 📁 backend/src/modules/auth/auth.controller.ts
import { Request, Response } from 'express'
import bcrypt from 'bcrypt'
import jwt from 'jsonwebtoken'
import { JWT_SECRET } from '../../config/env'
import { prisma } from '../../config/prismaClient'

export async function login(req: Request, res: Response): Promise<void> {
  try {
    console.log('📥 [LOGIN] req.body:', req.body)

    // รองรับทั้ง employeeCode และ email
    const { employeeCode, email, password } = req.body as { employeeCode?: string; email?: string; password?: string }
    const code = employeeCode ?? email
    if (!code || !password) {
      console.warn('⚠️ Missing credentials:', { code, password })
      res.status(400).json({ message: 'Missing credentials' })
      return
    }

    // หา user ผ่าน relation ไปยัง employeeProfile.employeeCode
    const user = await prisma.user.findFirst({
      where: { employeeProfile: { employeeCode: code } },
      include: { employeeProfile: true }
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

    // สร้าง fingerprint (IP + User-Agent)
    const fingerprint = `${req.ip}|${req.headers['user-agent']}`
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 นาที

    // บันทึก Session ใน DB
    const session = await prisma.session.create({ data: { userId: user.id, fingerprint, expiresAt } })

    // เซ็น JWT ด้วย sessionId
    const token = jwt.sign({ sessionId: session.id }, JWT_SECRET!, { expiresIn: '15m' })

    console.log(
      '✅ Authenticated:', code,
      '| Role:', user.role,
      '| SessionID:', session.id
    )

    // ส่ง cookie และ JSON ตอบกลับ
    res
      .cookie('token', token, { httpOnly: true, sameSite: 'strict' })
      .json({ ok: true, role: user.role })
    return
  } catch (err) {
    console.error('❌ [LOGIN ERROR]', err)
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์' })
    return
  }
}

export async function logout(req: Request, res: Response): Promise<void> {
  const token = req.cookies?.token as string | undefined
  if (token) {
    try {
      const payload = jwt.verify(token, JWT_SECRET!) as { sessionId: string }
      await prisma.session.delete({ where: { id: payload.sessionId } })
    } catch (error) {
      console.error('❌ [LOGOUT ERROR]', error)
      // ignore invalid token or delete failure
    }
  }

  console.log('🔓 Logged out session')
  res.clearCookie('token').json({ ok: true })
  return
}

export async function me(req: Request, res: Response): Promise<void> {
  const userId = (req.user as any)?.id
  console.log('📥 [ME] req.user:', req.user)
  if (!userId) {
    console.warn('⚠️ Unauthorized access to /me')
    res.status(401).json({ message: 'Unauthorized' })
    return
  }

  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { employeeProfile: true }
  })
  if (!user) {
    console.warn('⚠️ User not found for id:', userId)
    res.status(404).json({ message: 'User not found' })
    return
  }

  console.log('✅ [ME] returning user:', user.employeeProfile!.employeeCode)
  res.json({ user })
  return
}
