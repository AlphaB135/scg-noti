import { z } from 'zod'

// Schema สำหรับ query list (skip, take)
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

// Schema สำหรับอัพเดตสถานะ
export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'DONE', 'IN_PROGRESS', 'OVERDUE']),
})

// Schema สำหรับ reschedule
export const rescheduleSchema = z.object({
  dueDate: z.coerce.date(),          // แปลงเป็น Date อัตโนมัติ
  reason: z.string().min(1, {
    message: 'Reason is required when rescheduling',
  }),
})

// Schema สำหรับกำหนด recipient ของ notification
export const recipientSchema = z.object({
  type: z.enum(['ALL', 'USER', 'GROUP', 'COMPANY']),
  userId: z.string().uuid().optional(),
  groupId: z.string().uuid().optional(),
  companyCode: z.string().min(1).optional(),
})

// Schema สำหรับสร้าง notification ใหม่
export const createNotificationSchema = z.object({
  title: z.string().min(1),
  message: z.string().min(1),
  scheduledAt: z.coerce.date(),                  // แปลงเป็น Date อัตโนมัติ
  dueDate: z.coerce.date().optional(),           // กรณีมี deadline
  type: z.enum(['SYSTEM', 'TODO', 'REMINDER']),
  category: z.string().min(1),
  link: z.string().url(),                        // ควรเป็น URL
  urgencyDays: z.coerce.number().int().min(0).default(0),
  repeatIntervalDays: z.coerce.number().int().min(0).default(0),
  recipients: z.array(recipientSchema).min(1),    // ระบุ recipients
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
