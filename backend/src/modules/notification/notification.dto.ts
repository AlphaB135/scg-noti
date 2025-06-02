import { z } from 'zod'

/**
 * Schema สำหรับ query list (page, size) → transform เป็น skip, take
 */
export const listQuerySchema = z
  .object({
    page: z.coerce.number().int().min(1).default(1),
    size: z.coerce.number().int().min(1).max(1000).default(500),
  })
  .transform(({ page, size }) => ({
    skip: (page - 1) * size,
    take: size,
  }))

export type ListQueryOpts = z.output<typeof listQuerySchema>

/**
 * Schema สำหรับอัพเดตสถานะการทำงาน
 */
export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'DONE', 'IN_PROGRESS', 'OVERDUE']),
})

/**
 * Schema สำหรับ reschedule (เลื่อนวันส่ง) 
 */
export const rescheduleSchema = z.object({
  dueDate: z.coerce.date(), // แปลงเป็น Date อัตโนมัติ
  reason: z.string().min(1, {
    message: 'Reason is required when rescheduling',
  }),
})

/**
 * Schema สำหรับ recipient ของ notification
 * แยกตาม type ด้วย discriminated union
 */
export const recipientSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('ALL'),
  }),
  z.object({
    type: z.literal('USER'),
    userId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('GROUP'),
    groupId: z.string().uuid(),
  }),
  z.object({
    type: z.literal('COMPANY'),
    companyCode: z.string().min(1),
  }),
])

/**
 * Base schema ของ notification (ใช้ตอนสร้าง)
 * createdBy จะถูกเซ็ตโดย backend จาก req.user.id เท่านั้น
 */
const notificationBaseSchema = {
  title: z.string().min(1),
  message: z.string().min(1),
  impact: z.string().nullish(), // เพิ่ม field impact แยกจาก message
  scheduledAt: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  type: z.enum(['SYSTEM', 'TODO', 'REMINDER']),
  category: z.string().min(1),
  link: z.string().url().nullish(),
  linkUsername: z.string().min(1).nullish(),
  linkPassword: z.string().min(1).nullish(),
  urgencyDays: z.coerce.number().int().min(0).default(0),
  repeatIntervalDays: z.coerce.number().int().min(0).default(0),
  recipients: z.array(recipientSchema).min(1),
  createdBy: z.string().uuid(), // รับจาก controller (req.user.id) เท่านั้น
}

/**
 * Schema สำหรับสร้าง notification
 */
export const createNotificationSchema = z.object(notificationBaseSchema)

/**
 * Schema สำหรับอัพเดต notification (ทุก field เป็น optional)
 */
export const updateNotificationSchema = z.object(
  Object.entries(notificationBaseSchema).reduce((acc, [key, schema]) => {
    // @ts-ignore
    acc[key] = (schema as z.ZodTypeAny).optional()
    return acc
  }, {} as Record<string, z.ZodTypeAny>)
)

/**
 * Schema สำหรับ validateRequest ฝั่ง client (ไม่รวม createdBy)
 */
export const createNotificationClientSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  impact: z.string().nullish(),
  scheduledAt: z.coerce.date(),
  dueDate: z.coerce.date().optional(),
  type: z.enum(['SYSTEM', 'TODO', 'REMINDER']),
  category: z.string().min(1),
  link: z.string().url().nullish(),
  linkUsername: z.string().min(1).nullish(),
  linkPassword: z.string().min(1).nullish(),
  urgencyDays: z.coerce.number().int().min(0).default(0),
  repeatIntervalDays: z.coerce.number().int().min(0).default(0),
  recipients: z.array(recipientSchema).min(1),
})
