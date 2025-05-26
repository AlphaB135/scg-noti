import { z } from 'zod'

// Schema สำหรับ validate query parameters ในการดึงรายการพนักงาน
export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['firstName', 'lastName', 'employeeCode']).default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
}).transform(({ page, size }) => ({
  skip: (page - 1) * size,
  take: size,
  page,
  size
}))

// Schema สำหรับ sanitize ข้อมูล employee ก่อนส่งออก
export const employeeSafeOutputSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  role: z.string(),
  status: z.string(),
  employeeProfile: z.object({
    employeeCode: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    position: z.string(),
    nickname: z.string().nullable()
  }).nullable()
})

// Schema สำหรับ validate query parameters ในการค้นหาพนักงาน 
export const searchEmployeeQuerySchema = z.object({
  query: z.string().min(1, { message: 'query ชื่อพนักงานต้องไม่ว่าง' }),
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
}).transform(({ query, page, size }) => ({
  query,
  skip: (page - 1) * size,
  take: size,
  page,
  size,
}))

export type SearchEmployeeOpts = z.output<typeof searchEmployeeQuerySchema>
export type ListEmployeesQuery = z.output<typeof listEmployeesQuerySchema>

// Validate query params for list endpoint
export const listEmployeesQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z.enum(['firstName', 'lastName', 'employeeCode']).default('firstName'),
  sortOrder: z.enum(['asc', 'desc']).default('asc')
})

// Define safe output type
export const employeeSafeOutputSchema = z.object({
  id: z.string().uuid(),
  email: z.string().email(),
  role: z.string(),
  status: z.string(),
  employeeProfile: z.object({
    employeeCode: z.string(),
    firstName: z.string(),
    lastName: z.string(),
    position: z.string().optional(),
    nickname: z.string().optional()
  })
})

export type ListEmployeesQuery = z.infer<typeof listEmployeesQuerySchema>
export type EmployeeSafeOutput = z.infer<typeof employeeSafeOutputSchema>
