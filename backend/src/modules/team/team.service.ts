// backend/src/modules/team/team.service.ts

import { prisma } from '../../prisma'
import { Team, TeamMember } from '@prisma/client'
import type { CreateTeamInput, UpdateTeamInput, Pagination } from './team.dto'
import { TeamEvent } from './team.types'

class TeamService {
  /** สร้างทีมใหม่ */
  async createTeam(input: CreateTeamInput): Promise<Team> {
    return prisma.team.create({
      data: input,
      include: {
        members: true
      }
    })
  }
  /** ดึงทีมทั้งหมดพร้อม pagination */
  async listTeams(opts: Pagination) {
    const teams = await prisma.team.findMany({
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
    
    // Also return total count for pagination
    const total = await prisma.team.count() 

    return { data: teams, total }
  }
  /** ดึงข้อมูลทีมเดียว */
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

  /** อัปเดตข้อมูลทีม */
  async updateTeam(id: string, input: UpdateTeamInput): Promise<Team> {
    return prisma.team.update({
      where: { id },
      data: input,
      include: {
        members: true
      }
    })
  }

  /** ลบทีม */
  async deleteTeam(id: string): Promise<void> {
    await prisma.team.delete({ where: { id } })
  }

  /** เพิ่มสมาชิกทีม */
  async addMember(teamId: string, employeeId: string): Promise<TeamMember> {
    return prisma.teamMember.create({
      data: {
        teamId,
        employeeId
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

  /** ลบสมาชิกทีม */
  async removeMember(memberId: string): Promise<void> {
    await prisma.teamMember.delete({ where: { id: memberId } })
  }

  /** เปลี่ยนหัวหน้าทีม */
  async changeLeader(teamId: string, leaderId: string): Promise<Team> {
    return prisma.team.update({
      where: { id: teamId },
      data: { leaderId }
    })
  }

  /** ดึง timeline ของทีม */
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
