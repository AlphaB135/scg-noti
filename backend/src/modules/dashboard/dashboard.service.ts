/**
 * @fileoverview Service layer for dashboard analytics and metrics.
 * Provides cached access to system-wide overview statistics and historical metrics.
 * Uses Redis caching to improve performance of aggregate queries.
 * 
 * Related Prisma Models:
 * - Notification
 * - Approval
 * - User
 * - SecurityLog
 */

import { prisma } from '../../prisma'
import { cache } from '../../config/redis'
import type { OverviewOpts, MetricsOpts } from './dashboard.dto'

// Cache keys
const CACHE_KEYS = {
  OVERVIEW: 'dashboard:overview',
  METRICS: (days: number) => `dashboard:metrics:${days}`
} as const

// Cache durations (in seconds)
const CACHE_TTL = {
  OVERVIEW: 5 * 60,  // 5 minutes
  METRICS: 15 * 60   // 15 minutes
} as const

/**
 * Retrieves system-wide overview statistics with Redis caching
 * Includes notification, approval, and user statistics along with recent activity
 * 
 * @param {OverviewOpts} opts - Overview options
 * @returns {Promise<{
 *   notifications: {
 *     total: number,
 *     pending: number,
 *     approved: number,
 *     approvedPercentage: number
 *   },
 *   approvals: {
 *     total: number,
 *     pending: number,
 *     completed: number,
 *     completedPercentage: number
 *   },
 *   users: {
 *     total: number,
 *     active: number,
 *     activePercentage: number
 *   },
 *   recentActivity: SecurityLog[]
 * }>} Dashboard overview statistics
 * 
 * @prismaModel Notification, Approval, User, SecurityLog
 * @cache Cached for 5 minutes
 */
export async function getOverview(opts: OverviewOpts) {
  return cache.getOrFetch(
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
        prisma.approval.count({ where: { response: 'APPROVED' } })
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
}

/**
 * Retrieves historical metrics for notifications and approvals
 * Aggregates daily counts for the specified number of days
 * 
 * @param {MetricsOpts} opts - Metrics options
 * @param {number} opts.days - Number of days of history to retrieve
 * @returns {Promise<Array<{
 *   date: string,
 *   notifications: number,
 *   approvals: number
 * }>>} Daily metrics
 * 
 * @prismaModel Notification, Approval
 * @aggregation Groups by creation date
 * @cache Cached for 15 minutes
 * @format Dates returned in YYYY-MM-DD format
 * 
 * @example
 * const metrics = await getMetrics({ days: 7 })
 * // Returns array of daily counts:
 * // [
 * //   { date: "2025-05-10", notifications: 5, approvals: 3 },
 * //   { date: "2025-05-11", notifications: 7, approvals: 4 },
 * //   ...
 * // ]
 */
export async function getMetrics(opts: MetricsOpts) {
  const { days } = opts

  return cache.getOrFetch(
    CACHE_KEYS.METRICS(days),
    async () => {
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

      const result = []
      for (let i = 0; i < days; i++) {
        const date = new Date(startDate)
        date.setDate(date.getDate() + i)
        const dateStr = date.toISOString().split('T')[0]

        result.push({
          date: dateStr,
          notifications: notifications.find(n => n.createdAt.toISOString().split('T')[0] === dateStr)?._count ?? 0,
          approvals: approvals.find(a => a.createdAt.toISOString().split('T')[0] === dateStr)?._count ?? 0
        })
      }

      return result
    },
    CACHE_TTL.METRICS
  )
}
