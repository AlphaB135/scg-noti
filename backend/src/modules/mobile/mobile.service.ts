/**
 * @fileoverview Service layer for mobile app-specific functionality.
 * Handles dashboard metrics, calendar events, notification preferences,
 * and user action history for the mobile client interface.
 * 
 * Related Prisma Models:
 * - Notification
 * - Approval
 * - User
 * - UserNotificationPref
 * - SecurityLog
 */

import { prisma } from '../../prisma'
import type { BoxesQuery, CalendarQuery, NotifSettings } from './mobile.dto'

/**
 * Retrieves dashboard metrics for the mobile app interface
 * Includes counts of pending notifications, approvals, and recent team updates
 * 
 * @param {BoxesQuery} opts - Query parameters
 * @param {string} opts.companyCode - Company code to filter metrics by
 * @returns {Promise<{
 *   notifications: number,
 *   approvals: number,
 *   teamUpdates: number
 * }>} Dashboard metric counts
 */
export async function getBoxes(opts: BoxesQuery) {
  const { companyCode } = opts

  const [notifications, approvals, teamUpdates] = await Promise.all([
    prisma.notification.count({
      where: {
        recipients: {
          some: {
            type: 'COMPANY',
            companyCode: opts.companyCode
          }
        },
        status: 'PENDING'
      }
    }),
    prisma.approval.count({
      where: {
        user: {
          employeeProfile: {
            companyCode: opts.companyCode
          }
        },
        response: 'PENDING'
      }
    }),
    prisma.notification.count({
      where: {
        recipients: {
          some: {
            type: 'GROUP'
          }
        },
        createdAt: {
          gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
        }
      }
    })
  ])

  return {
    notifications,
    approvals,
    teamUpdates
  }
}

/**
 * Retrieves calendar events for a specific month
 * Returns notifications with due dates in the specified month
 * 
 * @param {CalendarQuery} opts - Calendar query parameters
 * @param {string} opts.companyCode - Company code to filter events by
 * @param {number} [opts.month] - Target month (1-12), defaults to current month
 * @param {number} [opts.year] - Target year, defaults to current year
 * @returns {Promise<Array<{
 *   id: string,
 *   title: string,
 *   dueDate: Date,
 *   status: string,
 *   type: 'notification'
 * }>>} Calendar events for the month
 */
export async function getCalendar(opts: CalendarQuery) {
  const { companyCode, month, year } = opts
  
  const now = new Date()
  const targetMonth = month || now.getMonth() + 1
  const targetYear = year || now.getFullYear()

  const startDate = new Date(targetYear, targetMonth - 1, 1)
  const endDate = new Date(targetYear, targetMonth, 0)

  const events = await prisma.notification.findMany({
    where: {
      recipients: {
        some: {
          type: 'COMPANY',
          companyCode
        }
      },
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  return events.map(event => ({
    ...event,
    type: 'notification' as const
  }))
}

/**
 * Retrieves notification preferences for a user
 * Returns default settings if no custom settings exist
 * 
 * @param {string} userId - ID of the user
 * @returns {Promise<{
 *   emailEnabled: boolean,
 *   pushEnabled: boolean,
 *   smsEnabled: boolean,
 *   digestFreq: string,
 *   quietStart: string,
 *   quietEnd: string
 * }>} User's notification settings
 */
export async function getNotificationSettings(userId: string) {
  const settings = await prisma.userNotificationPref.findUnique({
    where: { userId }
  })

  return settings || {
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    digestFreq: 'NEVER',
    sound: 'Default',
    quietHoursStart: new Date('2000-01-01T22:00:00Z'),
    quietHoursEnd: new Date('2000-01-01T07:00:00Z')
  }
}

/**
 * Updates notification preferences for a user
 * Creates new settings or updates existing ones
 * 
 * @param {string} userId - ID of the user
 * @param {NotifSettings} settings - New notification settings
 * @returns {Promise<UserNotificationPref>} Updated settings
 */
export async function updateNotificationSettings(userId: string, settings: NotifSettings) {
  return prisma.userNotificationPref.upsert({
    where: { userId },
    create: {
      userId,
      ...settings
    },
    update: settings
  })
}

/**
 * Retrieves recent user actions from security logs
 * Used for displaying activity history in the mobile app
 * 
 * @param {string} userId - ID of the user
 * @returns {Promise<SecurityLog[]>} Recent security events
 */
export async function getActionHistory(userId: string) {
  return prisma.securityLog.findMany({
    where: {
      userId
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 50
  })
}
