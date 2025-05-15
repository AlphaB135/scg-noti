import { prisma } from '../../prisma'
import type { OverviewOpts, MetricsOpts } from './dashboard.dto'

/**
 * ดึงข้อมูล Overview แยกตามบริษัท
 * - จำนวนผู้ใช้
 * - จำนวนการแจ้งเตือน
 * - จำนวนรายการที่รออนุมัติ
 */
export async function getOverview(opts: OverviewOpts) {
  const companies = await prisma.employeeProfile.groupBy({
    by: ['companyCode'],
    _count: {
      userId: true,
    }
  })

  const notificationCounts = await prisma.notification.groupBy({
    by: ['companyCode'],
    _count: {
      id: true
    }
  })

  const pendingApprovalCounts = await prisma.approval.groupBy({
    by: ['companyCode'],
    where: {
      status: 'PENDING'
    },
    _count: {
      id: true
    }
  })

  return companies.map(company => ({
    companyCode: company.companyCode,
    userCount: company._count.userId,
    notificationCount: notificationCounts.find(n => n.companyCode === company.companyCode)?._count.id ?? 0,
    pendingApprovalCount: pendingApprovalCounts.find(a => a.companyCode === company.companyCode)?._count.id ?? 0
  }))
}

/**
 * ดึงข้อมูล Metrics ย้อนหลัง X วัน
 * - จำนวนการแจ้งเตือนต่อวัน
 * - จำนวนรายการขออนุมัติต่อวัน
 */
export async function getMetrics(opts: MetricsOpts) {
  const { days } = opts
  const startDate = new Date()
  startDate.setDate(startDate.getDate() - days)

  const [notifications, approvals] = await Promise.all([
    prisma.notification.groupBy({
      by: ['createdDate'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdDate: 'asc'
      }
    }),
    prisma.approval.groupBy({
      by: ['createdDate'],
      where: {
        createdAt: {
          gte: startDate
        }
      },
      _count: {
        id: true
      },
      orderBy: {
        createdDate: 'asc'
      }
    })
  ])

  // Fill in missing dates with 0
  const result = {
    notifications: [] as number[],
    approvals: [] as number[]
  }

  for (let i = 0; i < days; i++) {
    const date = new Date()
    date.setDate(date.getDate() - i)
    const dateStr = date.toISOString().split('T')[0]

    result.notifications.push(
      notifications.find(n => n.createdDate === dateStr)?._count.id ?? 0
    )
    result.approvals.push(
      approvals.find(a => a.createdDate === dateStr)?._count.id ?? 0
    )
  }

  return result
}
