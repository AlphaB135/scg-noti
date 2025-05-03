// 📁 backend/src/modules/auth/auth.controller.ts
import { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import bcrypt from 'bcrypt'
import { prisma } from '../../config/prismaClient'
import { JWT_SECRET } from '../../config/env'

export const login = async (req: Request, res: Response) => {
  const { email, password } = req.body

  try {
    const user = await prisma.user.findUnique({ where: { email } })
    if (!user) return res.status(401).json({ message: 'Invalid credentials' })

    const passwordMatch = await bcrypt.compare(password, user.passwordHash)
    if (!passwordMatch) return res.status(401).json({ message: 'Invalid credentials' })

    const token = jwt.sign(
      { userId: user.id, role: user.role },
      JWT_SECRET,
      { expiresIn: '1h' }
    )

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 1000 * 60 * 60, // 1 hour
    })

    res.json({ message: 'Login successful' })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err })
  }
}

export const logout = (req: Request, res: Response) => {
  res.clearCookie('token')
  res.json({ message: 'Logged out' })
}

export const me = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id
    if (!userId) return res.status(401).json({ message: 'Unauthorized' })

    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { adminProfile: true },
    })
    if (!user) return res.status(404).json({ message: 'User not found' })

    res.json({ user })
  } catch (err) {
    res.status(500).json({ message: 'Internal server error', error: err })
  }
}
