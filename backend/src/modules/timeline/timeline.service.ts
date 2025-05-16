/**
 * @fileoverview Service layer for team activity timeline management.
 * Aggregates and formats events from various sources including security logs
 * and notification approvals to create a comprehensive activity feed for teams.
 * 
 * Related Prisma Models:
 * - TeamMember
 * - SecurityLog
 * - Approval
 * - Notification
 * - User (with Employee profile)
 */

import {prisma} from '../../prisma'

/**
 * Represents a single event in the team timeline
 * @typedef {Object} TimelineEvent
 * @property {'login' | 'approval'} type - The type of event
 * @property {Date} timestamp - When the event occurred
 * @property {Object} actor - The user who performed the action
 * @property {string} actor.id - User ID
 * @property {string} actor.email - User email
 * @property {string} [actor.firstName] - User's first name if available
 * @property {string} [actor.nickname] - User's nickname if available
 * @property {Object} details - Event-specific details
 * @property {string} [details.action] - For login events, the security action
 * @property {string} [details.notificationId] - For approval events, the notification ID
 * @property {string} [details.notificationTitle] - For approval events, the notification title
 * @property {string} [details.response] - For approval events, the approval response
 */
export interface TimelineEvent {
  type: 'login' | 'approval',
  timestamp: Date,
  actor: {
    id: string,
    email: string,
    firstName?: string,
    nickname?: string,
  },
  details: any,
}

/**
 * Retrieves a chronological timeline of team activities
 * Combines security events (logins) and notification approvals
 * from team members into a single, sorted timeline
 * 
 * @param {string} teamId - ID of the team to get timeline for
 * @returns {Promise<TimelineEvent[]>} Array of timeline events, sorted by timestamp descending
 * 
 * @prismaModel TeamMember, SecurityLog, Approval, Notification, User
 * @aggregation Combines events from multiple sources
 * @pagination Limited to 50 most recent events per type
 * 
 * @example
 * const timeline = await getTeamTimelineService('team-123')
 * timeline.forEach(event => {
 *   console.log(`${event.timestamp}: ${event.actor.firstName} performed ${event.type}`)
 * })
 */
export async function getTeamTimelineService(teamId: string): Promise<TimelineEvent[]> {
  // 1) หาสมาชิกทีม
  const members = await prisma.teamMember.findMany({
    where: { teamId },
    select: { employeeId: true }
  })
  const userIds = members.map(m => m.employeeId)

  // 2) ดึง security logs (login) ของสมาชิก
  const logs = await prisma.securityLog.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          employeeProfile: { select: { firstName: true, nickname: true } }
        }
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // 3) ดึง approvals ที่สมาชิกเป็นผู้ทำ
  const approvals = await prisma.approval.findMany({
    where: { userId: { in: userIds } },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          employeeProfile: { select: { firstName: true, nickname: true } }
        }
      },
      notification: { select: { id: true, title: true } }
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
  })

  // 4) รวมและ sort ตามเวลา
  const events: TimelineEvent[] = []
  logs.forEach(log => {
    events.push({
      type: 'login',
      timestamp: log.createdAt,      actor: {
        id: log.user.id,
        email: log.user.email,
        firstName: log.user.employeeProfile?.firstName ?? undefined,
        nickname: log.user.employeeProfile?.nickname ?? undefined,
      },
      details: { action: log.action }
    })
  })
  approvals.forEach(app => {
    events.push({
      type: 'approval',
      timestamp: app.createdAt,      actor: {
        id: app.user.id,
        email: app.user.email,
        firstName: app.user.employeeProfile?.firstName ?? undefined,
        nickname: app.user.employeeProfile?.nickname ?? undefined,
      },
      details: {
        notificationId: app.notification.id,
        notificationTitle: app.notification.title,
        response: app.response,
      }
    })
  })
  // Sort descending
  events.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

  return events
}
