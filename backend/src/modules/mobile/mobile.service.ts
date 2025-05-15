import { prisma } from '../../prisma'
import type { BoxesQuery, CalendarQuery, NotifSettings } from './mobile.dto'

/**
 * ดึงข้อมูล Boxes สำหรับหน้า Dashboard (Mobile)
 */
export async function getBoxes(opts: BoxesQuery) {
  const { companyCode } = opts

  const [notifications, approvals, teamUpdates] = await Promise.all([
    prisma.notification.count({
      where: {
        companyCode,
        status: 'PENDING'
      }
    }),
    prisma.approval.count({
      where: {
        companyCode,
        status: 'PENDING'
      }
    }),
    prisma.teamNotification.count({
      where: {
        team: {
          companyCode
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
 * ดึงข้อมูลปฏิทิน
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
      companyCode,
      dueDate: {
        gte: startDate,
        lte: endDate
      }
    },
    select: {
      id: true,
      title: true,
      dueDate: true,
      status: true,
      priority: true
    },
    orderBy: {
      dueDate: 'asc'
    }
  })

  return events.map(event => ({
    ...event,
    type: 'notification'
  }))
}

/**
 * ดึงข้อมูลการตั้งค่าการแจ้งเตือน
 */
export async function getNotificationSettings(userId: string) {
  const settings = await prisma.notificationSettings.findUnique({
    where: { userId }
  })

  return settings || {
    emailEnabled: true,
    pushEnabled: true,
    smsEnabled: false,
    digestFreq: 'NEVER',
    quietStart: '22:00',
    quietEnd: '07:00'
  }
}

/**
 * อัพเดทการตั้งค่าการแจ้งเตือน
 */
export async function updateNotificationSettings(userId: string, settings: NotifSettings) {
  return prisma.notificationSettings.upsert({
    where: { userId },
    create: {
      userId,
      ...settings
    },
    update: settings
  })
}

/**
 * ดึงประวัติการทำรายการ
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
