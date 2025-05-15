import { Router, Request, Response, NextFunction } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { prisma } from '../prisma'
import type { RequestHandler } from 'express'

const router = Router()

// ดึงข้อมูล Overview
router.get('/overview', 
  authMiddleware as RequestHandler,
  authorize(['ADMIN']) as RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const [notifTotal, notifPending, notifApproved] = await Promise.all([
        prisma.notification.count(),
        prisma.notification.count({ where: { status: 'PENDING' } }),
        prisma.notification.count({ where: { status: 'APPROVED' } })
      ])

      const [apprTotal, apprPending, apprCompleted] = await Promise.all([
        prisma.approval.count(),
        prisma.approval.count({ where: { response: 'PENDING' } }),
        prisma.approval.count({ where: { response: 'APPROVE' } })
      ])

      const [userTotal, userActive] = await Promise.all([
        prisma.user.count(),
        prisma.user.count({ where: { status: 'ACTIVE' } })
      ])

      const recentActivity = await prisma.securityLog.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5
      })

      const buildPct = (n: number, total: number) =>
        total > 0 ? Math.round((n / total) * 100) : 0

      res.json({
        notifications: {
          total: notifTotal,
          pending: notifPending,
          approved: notifApproved,
          approvedPercentage: buildPct(notifApproved, notifTotal)
        },
        approvals: {
          total: apprTotal,
          pending: apprPending,
          completed: apprCompleted,
          completedPercentage: buildPct(apprCompleted, apprTotal)
        },
        users: {
          total: userTotal,
          active: userActive,
          activePercentage: buildPct(userActive, userTotal)
        },
        recentActivity
      })
    } catch (error) {
      console.error('❌ [DASHBOARD ERROR]', error)
      next(error)
    }
  }
)

// ดึงข้อมูล Metrics ย้อนหลัง
router.get('/metrics', 
  authMiddleware as RequestHandler,
  authorize(['ADMIN']) as RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = 7 // Default to 7 days
      const startDate = new Date()
      startDate.setDate(startDate.getDate() - days)

      const [notifications, approvals] = await Promise.all([
        prisma.notification.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: {
              gte: startDate
            }
          },
          _count: true,
          orderBy: {
            createdAt: 'asc'
          }
        }),
        prisma.approval.groupBy({
          by: ['createdAt'],
          where: {
            createdAt: {
              gte: startDate
            }
          },
          _count: true,
          orderBy: {
            createdAt: 'asc'
          }
        })
      ])

      res.json({
        notifications: notifications.map(n => ({
          date: n.createdAt,
          count: n._count
        })),
        approvals: approvals.map(a => ({
          date: a.createdAt,
          count: a._count
        }))
      })
    } catch (error) {
      console.error('❌ [METRICS ERROR]', error)
      next(error)
    }
  }
)

export default router
