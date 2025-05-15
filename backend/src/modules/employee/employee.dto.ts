import { z } from 'zod'

export const searchEmployeeQuerySchema = z
  .object({
    query: z.string().min(1, { message: 'query ชื่อพนักงานต้องไม่ว่าง' }),
    page:  z.coerce.number().int().min(1).default(1),
    size:  z.coerce.number().int().min(1).max(100).default(20),
  })
  .transform(({ query, page, size }) => ({
    query,
    skip:  (page - 1) * size,
    take:  size,
    page,
    size,
  }))

export type SearchEmployeeOpts = z.output<typeof searchEmployeeQuerySchema>
