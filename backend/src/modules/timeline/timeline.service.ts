import {prisma} from '../../prisma'

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
 * ดึง timeline สำหรับทีมหนึ่ง ๆ
 * รวมกิจกรรม login จาก SecurityLog และการอนุมัติจาก Approval
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
