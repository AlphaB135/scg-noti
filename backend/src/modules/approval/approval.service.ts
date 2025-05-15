import {prisma}  from '../../prisma'
import type { CreateApprovalInput, ListApprovalQuery } from './approval.dto'

/**
 * List approvals with pagination, filtering by status, and include user details
 */
export async function listApprovals(
  notificationId: string,
  opts: ListApprovalQuery
) {
  const where: { notificationId: string; response?: string } = {
    notificationId,
    ...(opts.status && { response: opts.status }),
  }

  const [data, total] = await Promise.all([
    prisma.approval.findMany({
      where,
      skip: opts.skip,
      take: opts.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employeeProfile: true,
            adminProfile: true,
          },
        },
      },
    }),
    prisma.approval.count({ where }),
  ])

  return {
    data,
    meta: {
      total,
      page: opts.page,
      size: opts.size,
      totalPages: Math.ceil(total / opts.size),
    },
  }
}

/**
 * Get aggregate counts of approvals by response status
 */
export async function getApprovalMetrics(
  notificationId: string
) {
  const stats = await prisma.approval.groupBy({
    by: ['response'],
    where: { notificationId },
    _count: { response: true },
  })

  const metrics = {
    pending:  0,
    approved: 0,
    rejected: 0,
  }

  stats.forEach(stat => {
    const count = stat._count.response
    switch (stat.response) {
      case 'PENDING':
        metrics.pending = count
        break
      case 'APPROVED':
        metrics.approved = count
        break
      case 'REJECTED':
        metrics.rejected = count
        break
    }
  })

  return metrics
}

/**
 * Create a new approval for a notification
 */
export async function createApproval(
  notificationId: string,
  userId: string,
  input: CreateApprovalInput
) {
  return prisma.approval.create({
    data: {
      notification: { connect: { id: notificationId } },
      user:         { connect: { id: userId } },
      response:     input.response,
      comment:      input.comment ?? '',
    },
    include: {
      user: true,
      notification: true,
    },
  })
}
