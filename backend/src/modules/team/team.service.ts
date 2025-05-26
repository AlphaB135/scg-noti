/**
 * @fileoverview เซอร์วิสสำหรับจัดการทีม
 * รองรับการดำเนินการเกี่ยวกับทีม รวมถึงการสร้าง แก้ไข จัดการสมาชิก
 * และติดตามกิจกรรมของทีม
 * 
 * โมเดลที่เกี่ยวข้อง:
 * - Team (ทีม)
 * - TeamMember (สมาชิกทีม)
 * - User (พร้อมโปรไฟล์พนักงานและแอดมิน)
 * - SecurityLog (ล็อกความปลอดภัย)
 * - Approval (การอนุมัติ)
 * - Notification (การแจ้งเตือน)
 */

import { prisma } from '../../prisma'
import { Team, TeamMember } from '@prisma/client'
import type { CreateTeamInput, UpdateTeamInput, Pagination } from './team.dto'
import { TeamEvent } from './team.types'

class TeamService {
  /**
   * สร้างทีมใหม่
   * 
   * @param {CreateTeamInput} input - ข้อมูลทีมที่จะสร้าง 
   * @param {string} input.name - ชื่อทีม
   * @param {string} input.description - รายละเอียดหรือวัตถุประสงค์ของทีม
   * @param {string} input.leaderId - รหัสหัวหน้าทีม
   * @returns {Promise<Team & { members: TeamMember[] }>} ทีมที่สร้างพร้อมรายชื่อสมาชิก
   * 
   * @prismaModel Team
   * @transaction สร้างทีมและกำหนดรายการสมาชิกเริ่มต้น
   */
  async createTeam(input: CreateTeamInput): Promise<Team> {
    return prisma.team.create({
      data: input,
      include: {
        members: true
      }
    })
  }

  /**
   * แสดงรายการทีมทั้งหมดพร้อมการแบ่งหน้า
   * 
   * @param {Pagination} opts - ตัวเลือกการแบ่งหน้า
   * @param {number} opts.skip - จำนวนรายการที่ต้องการข้าม
   * @param {number} opts.take - จำนวนรายการที่ต้องการดึง
   * @returns {Promise<{
   *   data: (Team & { 
   *     members: (TeamMember & { 
   *       user: { id: string, email: string, role: string, employeeProfile: any }
   *     })[] 
   *   })[],
   *   total: number  // จำนวนทีมทั้งหมด
   * }>} รายการทีมพร้อมข้อมูลสมาชิกและการแบ่งหน้า
   * 
   * @prismaModel Team, TeamMember, User
   */  async listTeams(opts: Pagination, companyCode?: string, role?: string) {
    // Build where clause based on role and company
    let where = {}
    if (role !== 'SUPERADMIN' && companyCode) {
      where = {
        members: {
          some: {
            user: {
              employeeProfile: {
                companyCode
              }
            }
          }
        }
      }
    }

    const teams = await prisma.team.findMany({
      where,
      skip: opts.skip,
      take: opts.take,
      include: {
        members: {
          include: {
            team: true,
            user: {
              select: {
                id: true,
                email: true,
                role: true,
                employeeProfile: true
              }
            }
          }
        }
      }
    })
    
    // Also return total count for pagination, using same where clause
    const total = await prisma.team.count({ where }) 

    return { data: teams, total }
  }

  /**
   * ดึงข้อมูลทีมเดียวพร้อมรายละเอียดสมาชิก
   * 
   * @param {string} id - รหัสทีมที่ต้องการดึงข้อมูล
   * @returns {Promise<Team & {
   *   members: (TeamMember & {
   *     user: { employeeProfile: any }
   *   })[]
   * }>} ข้อมูลทีมและสมาชิก
   * 
   * @prismaModel Team, TeamMember, User
   * @throws {PrismaClientKnownRequestError} หากไม่พบทีม
   */
  async getTeam(id: string) {
    return prisma.team.findUnique({
      where: { id },
      include: {
        members: {
          include: {
            team: true,
            user: {
              include: {
                employeeProfile: true
              }
            }
          }
        }
      }
    })
  }

  /**
   * อัพเดทข้อมูลทีม
   * 
   * @param {string} id - รหัสทีมที่ต้องการแก้ไข
   * @param {UpdateTeamInput} input - ข้อมูลที่ต้องการอัพเดท
   * @param {string} [input.name] - ชื่อทีมใหม่
   * @param {string} [input.description] - รายละเอียดทีมใหม่
   * @returns {Promise<Team & { members: TeamMember[] }>} ทีมที่อัพเดทแล้ว
   * 
   * @prismaModel Team
   * @throws {PrismaClientKnownRequestError} หากไม่พบทีม
   */
  async updateTeam(id: string, input: UpdateTeamInput): Promise<Team> {
    return prisma.team.update({
      where: { id },
      data: input,
      include: {
        members: true
      }
    })
  }

  /**
   * ลบทีมและความสัมพันธ์ของสมาชิกทั้งหมด
   * หมายเหตุ: ไม่ได้ลบข้อมูลผู้ใช้ เพียงแต่ลบการเป็นสมาชิกทีมเท่านั้น
   * 
   * @param {string} id - รหัสทีมที่ต้องการลบ
   * @returns {Promise<void>}
   * 
   * @prismaModel Team
   * @throws {PrismaClientKnownRequestError} หากไม่พบทีม
   * @cascade ลบรายการ TeamMember ที่เกี่ยวข้องด้วย
   */
  async deleteTeam(id: string): Promise<void> {
    await prisma.team.delete({ where: { id } })
  }

  /**
   * เพิ่มสมาชิกใหม่เข้าทีม
   * 
   * @param {string} teamId - รหัสทีม
   * @param {string} employeeId - รหัสพนักงานที่จะเพิ่ม
   * @param {'TEAM_LEAD' | 'MEMBER'} [role='MEMBER'] - บทบาทของสมาชิกในทีม
   * @returns {Promise<TeamMember & {
   *   user: { id: string, email: string, employeeProfile: any }
   * }>} ข้อมูลการเป็นสมาชิกทีมที่สร้างขึ้น
   * 
   * @prismaModel TeamMember, User
   * @throws {PrismaClientKnownRequestError} หากไม่พบทีมหรือพนักงาน
   */
  async addMember(teamId: string, employeeId: string, role: 'TEAM_LEAD' | 'MEMBER' = 'MEMBER'): Promise<TeamMember> {
    return prisma.teamMember.create({
      data: {
        teamId,
        employeeId,
        role
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employeeProfile: true
          }
        }
      }
    })
  }

  /**
   * ลบสมาชิกออกจากทีม
   * 
   * @param {string} memberId - รหัสการเป็นสมาชิกทีมที่ต้องการลบ
   * @returns {Promise<void>}
   * 
   * @prismaModel TeamMember
   * @throws {PrismaClientKnownRequestError} หากไม่พบข้อมูลการเป็นสมาชิก
   */
  async removeMember(memberId: string): Promise<void> {
    await prisma.teamMember.delete({ where: { id: memberId } })
  }

  /**
   * เปลี่ยนหัวหน้าทีม
   * 
   * @param {string} teamId - รหัสทีม
   * @param {string} leaderId - รหัสหัวหน้าทีมคนใหม่
   * @returns {Promise<Team>} ทีมที่อัพเดทแล้ว
   * 
   * @prismaModel Team
   * @throws {PrismaClientKnownRequestError} หากไม่พบทีม
   */
  async changeLeader(teamId: string, leaderId: string): Promise<Team> {
    return prisma.team.update({
      where: { id: teamId },
      data: { leaderId }
    })
  }

  /**
   * ดึงไทม์ไลน์กิจกรรมของทีม รวมถึง:
   * - กิจกรรมความปลอดภัยของสมาชิกทีม
   * - การอนุมัติการแจ้งเตือนของทีม
   * - การแจ้งเตือนที่ส่งถึงทีม
   * 
   * @param {string} teamId - รหัสทีม
   * @returns {Promise<TeamEvent[]>} รายการกิจกรรมเรียงตามเวลา
   * 
   * @prismaModel TeamMember, SecurityLog, Approval, Notification
   * @aggregation รวมและเรียงลำดับกิจกรรมจากหลายแหล่ง
   * @pagination จำกัดที่ 100 รายการล่าสุดต่อประเภท
   */
  async getTeamTimeline(teamId: string) {
    // Get team members
    const teamMembers = await prisma.teamMember.findMany({
      where: { teamId },
      select: { employeeId: true }
    })
    const memberIds = teamMembers.map(m => m.employeeId)

    // Get security logs for team members
    const securityLogs = await prisma.securityLog.findMany({
      where: { userId: { in: memberIds } },
      include: {
        user: {
          select: {
            id: true,
            employeeProfile: true,
            adminProfile: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100 // Limit to recent events
    })

    // Get approvals related to team notifications
    const approvals = await prisma.approval.findMany({
      where: {
        notification: {
          recipients: {
            some: { groupId: teamId }
          }
        }
      },
      include: {
        user: {
          select: {
            id: true,
            employeeProfile: true,
            adminProfile: true
          }
        },
        notification: {
          select: {
            id: true,
            title: true
          }
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Get notifications targeted to team
    const notifications = await prisma.notification.findMany({
      where: {
        recipients: {
          some: { groupId: teamId }
        }
      },
      include: {
        recipients: true
      },
      orderBy: { createdAt: 'desc' },
      take: 100
    })

    // Transform and combine events
    const timeline = [
      ...securityLogs.map(log => ({
        type: 'security' as const,
        actor: {
          id: log.user.id,
          name: log.user.employeeProfile?.firstName || log.user.adminProfile?.firstName || 'Unknown'
        },
        details: {
          action: log.action,
          ipAddress: log.ipAddress,
          userAgent: log.userAgent
        },
        timestamp: log.createdAt
      })),
      ...approvals.map(approval => ({
        type: 'approval' as const,
        actor: {
          id: approval.user.id,
          name: approval.user.employeeProfile?.firstName || approval.user.adminProfile?.firstName || 'Unknown'
        },
        details: {
          notificationId: approval.notification.id,
          notificationTitle: approval.notification.title,
          response: approval.response,
          comment: approval.comment
        },
        timestamp: approval.createdAt
      })),
      ...notifications.map(notification => ({
        type: 'notification' as const,
        actor: {
          id: notification.createdBy,
          name: 'System' // Could fetch creator's name if needed
        },
        details: {
          title: notification.title,
          message: notification.message,
          type: notification.type,
          category: notification.category
        },
        timestamp: notification.createdAt
      }))
    ].sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())

    return { timeline }
  }
}

export default new TeamService()
