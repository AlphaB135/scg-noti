import { z } from 'zod'

/**
 * สำหรับดึงข้อมูล Boxes ในหน้า Dashboard (Mobile)
 */
export const boxesQuerySchema = z.object({
  companyCode: z.string().min(1, { message: 'รหัสบริษัทห้ามว่าง' })
})

/**
 * สำหรับดึงข้อมูลปฏิทิน
 */
export const calendarQuerySchema = z.object({
  companyCode: z.string().min(1, { message: 'รหัสบริษัทห้ามว่าง' }),
  month: z.coerce.number().min(1).max(12).optional(),
  year: z.coerce.number().min(2000).optional()
})

/**
 * สำหรับตั้งค่าการแจ้งเตือน
 */
export const notifSettingsSchema = z.object({
  emailEnabled: z.boolean(),
  pushEnabled: z.boolean(),
  smsEnabled: z.boolean(),
  digestFreq: z.enum(['NEVER', 'DAILY', 'WEEKLY']),
  quietStart: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, { 
    message: 'เวลาต้องอยู่ในรูปแบบ HH:MM' 
  }),
  quietEnd: z.string().regex(/^([01]?[0-9]|2[0-3]):[0-5][0-9]$/, {
    message: 'เวลาต้องอยู่ในรูปแบบ HH:MM'
  })
})

export type BoxesQuery = z.infer<typeof boxesQuerySchema>
export type CalendarQuery = z.infer<typeof calendarQuerySchema>
export type NotifSettings = z.infer<typeof notifSettingsSchema>
