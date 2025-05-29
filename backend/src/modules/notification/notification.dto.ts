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

// Base schema for notifications
const notificationBaseSchema = {
  title: z.string().min(1),
  message: z.string().min(1),
  impact: z.string().nullish(), // เพิ่ม field impact ให้แยกจาก message
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
  /**
   * createdBy จะถูกเซ็ตโดย backend จาก req.user.id เท่านั้น
   * ห้ามรับค่าจาก client โดยตรง (controller จะ merge ให้ก่อน validate)
   */
  createdBy: z.string().uuid(),
};

// Schema for creating notifications
export const createNotificationSchema = z.object(notificationBaseSchema);

// Schema for updating notifications - all fields optional
export const updateNotificationSchema = z.object({
  ...Object.entries(notificationBaseSchema).reduce((acc, [key, schema]) => ({
    ...acc,
    [key]: schema.optional()
  }), {})
});
