import { prisma }  from '../../prisma'

export interface CompanyOverview {
  companyCode: string
  employeeCount: number
  teamCount: number
  notificationCount: number
  pendingApprovalCount: number
}

class AdminService {
  /** คืนภาพรวมแบบสรุปตาม companyCode */
  async getOverview(): Promise<CompanyOverview[]> {
    // 1) สรุปจำนวน employees ต่อ companyCode
    const groups = await prisma.employeeProfile.groupBy({
      by: ['companyCode'],
      _count: { companyCode: true },
    })

    // 2) สำหรับแต่ละ companyCode, นับค่าอื่น ๆ
    return Promise.all(
      groups.map(async (g) => {
        const companyCode = g.companyCode
        const employeeCount = g._count.companyCode

        // ดึง userIds ของพนักงานในบริษัท
        const userIds = (
          await prisma.employeeProfile.findMany({
            where: { companyCode },
            select: { userId: true },
          })
        ).map((u) => u.userId)

        // นับทีมที่ leaderId ตรงกับ userIds เหล่านี้
        const teamCount = await prisma.team.count({
          where: { leaderId: { in: userIds } },
        })

        // นับ notifications ที่สร้างโดย userIds เหล่านี้
        const notificationCount = await prisma.notification.count({
          where: { createdBy: { in: userIds } },
        })

        // นับ approvals คงค้าง (PENDING) ของ userIds เหล่านี้
        const pendingApprovalCount = await prisma.approval.count({
          where: {
            userId: { in: userIds },
            response: 'PENDING',
          },
        })

        return {
          companyCode,
          employeeCount,
          teamCount,
          notificationCount,
          pendingApprovalCount,
        }
      })
    )
  }
}

export default new AdminService()
