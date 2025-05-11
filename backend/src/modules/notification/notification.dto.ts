// 📁 backend/src/modules/notification/notification.dto.ts
import { z } from 'zod'

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

export const updateStatusSchema = z.object({
  status: z.enum(['PENDING', 'DONE', 'IN_PROGRESS', 'OVERDUE']),
})

export const rescheduleSchema = z.object({
  dueDate: z.string().refine((s) => !isNaN(Date.parse(s)), {
    message: 'Invalid date string',
  }),
  reason: z.string().min(1),
})
