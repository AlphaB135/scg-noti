import { z } from 'zod'

export const createTeamSchema = z.object({
  name: z.string().min(1),
  leaderId: z.string().uuid().optional()
})
export type CreateTeamInput = z.infer<typeof createTeamSchema>

export const updateTeamSchema = z.object({
  name: z.string().min(1).optional(),
  leaderId: z.string().uuid().optional()
})
export type UpdateTeamInput = z.infer<typeof updateTeamSchema>

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  size: z.coerce.number().int().min(1).max(100).default(20)
}).transform(({ page, size }) => ({
  skip: (page - 1) * size,
  take: size,
  page,
  size
}))
export type Pagination = z.output<typeof paginationSchema>

export const addMemberSchema = z.object({
  employeeId: z.string().uuid(),
  role: z.enum(['TEAM_LEAD', 'MEMBER'])
})
export type AddMemberInput = z.infer<typeof addMemberSchema>

export const changeLeaderSchema = z.object({
  leaderId: z.string().uuid()
})
export type ChangeLeaderInput = z.infer<typeof changeLeaderSchema>
