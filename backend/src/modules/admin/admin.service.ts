/**
 * @fileoverview Service layer for administrative functions.
 * Provides company-wide analytics and metrics for system administrators.
 * 
 * Related Prisma Models:
 * - EmployeeProfile
 * - Team
 * - Notification
 * - Approval
 */

import { prisma }  from '../../prisma'

/**
 * Company Overview Statistics
 * @typedef {Object} CompanyOverview
 * @property {string} companyCode - Unique identifier for the company
 * @property {number} employeeCount - Total number of employees in the company
 * @property {number} teamCount - Number of teams led by company employees
 * @property {number} notificationCount - Number of notifications created by company employees
 * @property {number} pendingApprovalCount - Number of pending approvals for company employees
 */
export interface CompanyOverview {
  companyCode: string
  employeeCount: number
  teamCount: number
  notificationCount: number
  pendingApprovalCount: number
}

class AdminService {
  /**
   * Retrieves aggregated statistics for each company
   * Groups and summarizes key metrics by company code
   * 
   * Process:
   * 1. Groups employees by company to get base counts
   * 2. For each company:
   *    - Gets list of employee user IDs
   *    - Counts teams led by company employees
   *    - Counts notifications created by company employees
   *    - Counts pending approvals for company employees
   * 
   * @returns {Promise<CompanyOverview[]>} Array of company overview statistics
   * 
   * @prismaModel EmployeeProfile, Team, Notification, Approval
   * @aggregation Multiple groupBy and count operations
   * @performance May be slow with large datasets due to multiple queries per company
   * 
   * @example
   * const overviews = await adminService.getOverview()
   * // Returns:
   * // [
   * //   {
   * //     companyCode: "SCG001",
   * //     employeeCount: 150,
   * //     teamCount: 12,
   * //     notificationCount: 450,
   * //     pendingApprovalCount: 23
   * //   },
   * //   ...
   * // ]
   */
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
