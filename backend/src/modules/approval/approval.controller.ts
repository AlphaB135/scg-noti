import { Request, Response, NextFunction } from 'express'
import * as svc from './approval.service'
import { listApprovalQuerySchema, createApprovalSchema } from './approval.dto'
import { CacheService } from '../../services/cache.service'
import { prisma } from '../../prisma'

/**
 * GET /api/notifications/:id/approvals?page=&size=&status=
 * List approvals with pagination, filtering and meta
 */
export async function listApprovals(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: notificationId } = req.params
    const query = listApprovalQuerySchema.parse(req.query)

    const [approvals, total] = await Promise.all([
      prisma.approval.findMany({
        where: {
          notificationId,
          ...(query.status && { response: query.status })
        },
        skip: (query.page - 1) * query.size,
        take: query.size,
        orderBy: { createdAt: 'desc' },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              employeeProfile: {
                select: {
                  firstName: true,
                  lastName: true
                }
              }
            }
          }
        }
      }),
      prisma.approval.count({ 
        where: {
          notificationId,
          ...(query.status && { response: query.status })
        }
      })
    ])

    res.json({
      data: approvals,
      meta: {
        total,
        page: query.page,
        size: query.size,
        totalPages: Math.ceil(total / query.size)
      }
    })
  } catch (err) {
    next(err)
  }
}

/**
 * POST /api/notifications/:id/approvals
 * Create new approval with comment
 */
export async function createApproval(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: notificationId } = req.params
    const data = createApprovalSchema.parse(req.body)

    const approval = await prisma.approval.create({
      data: {
        notificationId,
        userId: req.user!.id,
        response: data.response,
        comment: data.comment
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employeeProfile: {
              select: {
                firstName: true,
                lastName: true
              }
            }
          }
        }
      }
    })

    // Update notification status if needed
    if (data.response === 'APPROVED') {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'APPROVED' }
      })
    } else if (data.response === 'REJECTED') {
      await prisma.notification.update({
        where: { id: notificationId },
        data: { status: 'REJECTED' }
      })
    }

    // Invalidate both notification and approval caches
    await Promise.all([
      CacheService.invalidateNotificationCaches(),
      CacheService.invalidateApprovalCaches()
    ])

    res.status(201).json(approval)
  } catch (err) {
    next(err)
  }
}

/**
 * GET /api/notifications/:id/approvals/metrics
 * Get approval metrics by status
 */
export async function getMetrics(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: notificationId } = req.params

    const stats = await prisma.approval.groupBy({
      by: ['response'],
      where: { notificationId },
      _count: true
    })

    const metrics = stats.reduce((acc, curr) => ({
      ...acc,
      [curr.response.toLowerCase()]: curr._count
    }), {
      total: stats.reduce((sum, curr) => sum + curr._count, 0),
      approved: 0,
      rejected: 0,
      pending: 0
    })

    res.json(metrics)
  } catch (err) {
    next(err)
  }
}
