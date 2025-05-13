// 📁 backend/src/modules/notification/notification.dto.ts
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
  dueDate: z.string().refine((s) => !isNaN(Date.parse(s)), {
    message: 'Invalid date string',
  }),
  reason: z.string().min(1),
})

// Schema สำหรับสร้าง notification ใหม่
export const createNotificationSchema = z.object({
  title:             z.string().min(1),
  message:           z.string().min(1),
  scheduledAt:       z.string().refine((s) => !isNaN(Date.parse(s)), {
                        message: 'Invalid date string',
                      }),
  type:              z.enum(['SYSTEM', 'TODO', 'REMINDER']), // ปรับให้ตรงกับ Prisma schema
  category:          z.string().min(1),
  link:              z.string().min(1),
  urgencyDays:       z.coerce.number().int().min(0),
  repeatIntervalDays:z.coerce.number().int().min(0),
})

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>
