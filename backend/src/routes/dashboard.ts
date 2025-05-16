import { Router, Request, Response, NextFunction } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { prisma } from '../prisma'
import { cache } from '../config/redis'
import type { RequestHandler } from 'express'

const router = Router()

const CACHE_KEYS = {
  OVERVIEW: 'dashboard:overview',
  METRICS: (days: number) => `dashboard:metrics:${days}`
} as const

const CACHE_TTL = {
  OVERVIEW: 5 * 60,  // 5 minutes
  METRICS: 15 * 60   // 15 minutes
} as const

// ดึงข้อมูล Overview
router.get('/overview', 
  authMiddleware as RequestHandler,
  authorize(['ADMIN']) as RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get cached data or compute fresh data
      const data = await cache.getOrFetch(
        CACHE_KEYS.OVERVIEW,
        async () => {
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

          return {
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
          }
        },
        CACHE_TTL.OVERVIEW
      )

      res.json(data)
    } catch (error) {
      console.error('❌ [OVERVIEW ERROR]', error)
      next(error)
    }
  }
)

// ดึงข้อมูล Metrics
router.get('/metrics',
  authMiddleware as RequestHandler,
  authorize(['ADMIN']) as RequestHandler,
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const days = parseInt(req.query.days as string) || 7

      // Get cached data or compute fresh data
      const data = await cache.getOrFetch(
        CACHE_KEYS.METRICS(days),
        async () => {
          const [notifications, approvals] = await Promise.all([
            prisma.notification.groupBy({
              by: ['createdAt'],
              where: {
                createdAt: {
                  gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
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
                  gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
                }
              },
              _count: true,
              orderBy: {
                createdAt: 'asc'
              }
            })
          ])

          return {
            notifications: notifications.map(n => ({
              date: n.createdAt,
              count: n._count
            })),
            approvals: approvals.map(a => ({
              date: a.createdAt,
              count: a._count
            }))
          }
        },
        CACHE_TTL.METRICS
      )

      res.json(data)
    } catch (error) {
      console.error('❌ [METRICS ERROR]', error)
      next(error)
    }
  }
)

export default router
