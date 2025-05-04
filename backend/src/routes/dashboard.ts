import { Router, Request, Response } from 'express'
import { prisma } from '../config/prismaClient'

const router = Router()

router.get('/overview', async (req: Request, res: Response) => {
  try {
    // ดึงตัวเลขจากแต่ละตาราง + คำนวน %
    const [notifTotal, notifPending, notifApproved] = await Promise.all([
      prisma.notification.count(),
      prisma.notification.count({ where: { status: 'PENDING' } }),
      prisma.notification.count({ where: { status: 'APPROVED' } }),
    ])

    const [apprTotal, apprPending, apprCompleted] = await Promise.all([
      prisma.approval.count(),
      prisma.approval.count({ where: { status: 'PENDING' } }),
      prisma.approval.count({ where: { status: 'COMPLETED' } }),
    ])

    const [userTotal, userActive] = await Promise.all([
      prisma.user.count(),
      prisma.user.count({ where: { status: 'ACTIVE' } }),
    ])

    const recentActivity = await prisma.securityLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 5,
    })

    const buildPct = (n: number, total: number) =>
      total > 0 ? Math.round((n / total) * 100) : 0

    res.json({
      notifications: {
        total: notifTotal,
        pending: notifPending,
        approved: notifApproved,
        approvedPercentage: buildPct(notifApproved, notifTotal),
      },
      approvals: {
        total: apprTotal,
        pending: apprPending,
        completed: apprCompleted,
        completedPercentage: buildPct(apprCompleted, apprTotal),
      },
      users: {
        total: userTotal,
        active: userActive,
        activePercentage: buildPct(userActive, userTotal),
      },
      recentActivity,
    })
  } catch (err) {
    console.error('❌ [DASHBOARD ERROR]', err)
    res.status(500).json({ message: 'Internal server error' })
  }
})

export default router
