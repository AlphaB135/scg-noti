import { z } from 'zod'

/**
 * สำหรับดึงข้อมูล Overview แยกตามบริษัท
 */
export const overviewQuerySchema = z.object({})

/**
 * สำหรับดึง Metrics ย้อนหลัง X วัน
 */
export const metricsQuerySchema = z
  .object({
    days: z.coerce
      .number()
      .int()
      .min(1, { message: 'จำนวนวันต้องมากกว่า 0' })
      .default(7)
  })

export type OverviewOpts = z.output<typeof overviewQuerySchema>
export type MetricsOpts = z.output<typeof metricsQuerySchema>
