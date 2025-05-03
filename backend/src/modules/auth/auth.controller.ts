import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { Request, Response } from 'express';
import { JWT_SECRET } from '../../config/env';

const prisma = new PrismaClient();

export async function login(req: Request, res: Response) {
  try {
    console.log('📥 [LOGIN] req.body:', req.body);

    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { employeeCode: username } });

    if (!user) {
      console.warn('⚠️ ไม่พบผู้ใช้:', username);
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      console.warn('⚠️ รหัสผ่านไม่ถูกต้อง:', username);
      return res.status(401).json({ message: 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง' });
    }

    const payload = { sub: user.id, role: user.role };
    const token = jwt.sign(payload, JWT_SECRET!, { expiresIn: '15m' });

    console.log('✅ Authenticated:', user.employeeCode, '| Role:', user.role);

    res
      .cookie('token', token, { httpOnly: true, sameSite: 'strict' })
      .json({ ok: true, role: user.role });
  } catch (err) {
    console.error('❌ [LOGIN ERROR]', err);
    res.status(500).json({ message: 'เกิดข้อผิดพลาดในฝั่งเซิร์ฟเวอร์' });
  }
}

export function logout(_: Request, res: Response) {
  res.clearCookie('token').json({ ok: true });
}
