import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../prisma'
import { z } from 'zod'

const updateProfileSchema = z.object({
  email: z.string().email({
    message: "กรุณากรอกอีเมลให้ถูกต้อง"
  }),
  employeeProfile: z.object({
    firstName: z.string({
      required_error: "กรุณากรอกชื่อ"
    }),
    lastName: z.string({
      required_error: "กรุณากรอกนามสกุล"  
    }),    position: z.string().optional(), // ตำแหน่งงาน
    nickname: z.string().optional(), // ชื่อเล่น
    profileImageUrl: z.string()
      .optional()
      .refine(
        (val) => !val || val.startsWith('data:image/'),
        {
          message: "รูปภาพต้องอยู่ในรูปแบบ base64 และเป็นไฟล์รูปภาพเท่านั้น"
        }
      ) // รูปโปรไฟล์ (base64)
  }),
})

/**
 * PUT /api/users/profile
 * อัพเดทข้อมูลโปรไฟล์ผู้ใช้
 */

/**
 * ฟังก์ชันสำหรับอัพเดทข้อมูลโปรไฟล์ผู้ใช้
 * - รับข้อมูลที่ต้องการอัพเดทผ่าน req.body
 * - ตรวจสอบความถูกต้องของข้อมูลด้วย Zod schema
 * - อัพเดทข้อมูลผู้ใช้และโปรไฟล์ในฐานข้อมูล
 * - ส่งข้อมูลที่อัพเดทแล้วกลับไป
 */
export async function updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user!.id
    const data = updateProfileSchema.parse(req.body)

    // อัพเดทข้อมูลผู้ใช้และโปรไฟล์
    await prisma.$transaction(async (tx) => {
      // อัพเดทอีเมล
      await tx.user.update({
        where: { id: userId },
        data: { email: data.email }
      })

      // อัพเดทข้อมูลโปรไฟล์
      if (req.user!.role === 'ADMIN') {
        await tx.adminProfile.update({
          where: { userId },
          data: {
            firstName: data.employeeProfile.firstName,
            lastName: data.employeeProfile.lastName,
            position: data.employeeProfile.position,
            nickname: data.employeeProfile.nickname,
            profileImageUrl: data.employeeProfile.profileImageUrl || undefined
          }
        })
      } else {
        await tx.employeeProfile.update({
          where: { userId },
          data: {
            firstName: data.employeeProfile.firstName,
            lastName: data.employeeProfile.lastName,
            position: data.employeeProfile.position,
            nickname: data.employeeProfile.nickname,
            profileImageUrl: data.employeeProfile.profileImageUrl || undefined
          }
        })
      }
    })

    // ดึงข้อมูลที่อัพเดทแล้ว
    const updatedUser = await prisma.user.findUniqueOrThrow({
      where: { id: userId },
      include: {
        employeeProfile: true,
        adminProfile: true
      }
    })

    res.json(updatedUser)  } catch (err) {
    if (err instanceof z.ZodError) {
      return res.status(400).json({
        error: 'ข้อมูลไม่ถูกต้อง',
        details: err.errors.map(e => e.message)
      })
    }
    next(err)
  }
}
