// File: backend/src/modules/approval/approval.dto.ts
import { z } from 'zod'

/**
 * Schema สำหรับ query params ของ approvals list:
 *  - page, size สำหรับ pagination
 *  - status สำหรับกรองตามสถานะ (PENDING, APPROVED, REJECTED)
 */
export const listApprovalQuerySchema = z
  .object({
    page:   z.coerce.number().int().min(1).default(1),
    size:   z.coerce.number().int().min(-1).max(100).default(20),
    status: z.enum(['PENDING', 'APPROVED', 'REJECTED']).optional(),
  })
  .transform(({ page, size, status }) => ({
    skip:       size === -1 ? undefined : (page - 1) * size,
    take:       size === -1 ? undefined : size,
    status,
    page,
    size,
  }))

export type ListApprovalQuery = z.output<typeof listApprovalQuerySchema>


/**
 * Schema สำหรับสร้าง approval ใหม่:
 *  - response ต้องเป็นหนึ่งใน ['PENDING', 'APPROVED', 'REJECTED']
 *  - comment เป็นข้อความเสริม (optional)
 */
export const createApprovalSchema = z.object({
  response: z.enum(['PENDING', 'APPROVED', 'REJECTED']),
  comment:  z.string().optional(),
})

export type CreateApprovalInput = z.infer<typeof createApprovalSchema>
