import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../prisma'

// Time line ของตัวเอง
export async function getMyAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    const logs = await prisma.auditLog.findMany({
      where: { adminId: userId },
      orderBy: { createdAt: 'desc' },
      take: 100,
      include: { admin: { select: { id: true, email: true, employeeProfile: true } } }
    })
    res.json(logs)
  } catch (err) { next(err) }
}

// Time line ของหัวหน้า (ทีม)
export async function getTeamAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const userId = req.user!.id
    // หาทีมที่ user เป็นหัวหน้า
    const teams = await prisma.team.findMany({ where: { leaderId: userId }, select: { id: true } })
    const teamIds = teams.map(t => t.id)
    // หาสมาชิกในทีม
    const members = await prisma.teamMember.findMany({ where: { teamId: { in: teamIds } }, select: { employeeId: true } })
    const memberIds = members.map(m => m.employeeId)
    const logs = await prisma.auditLog.findMany({
      where: { adminId: { in: memberIds } },
      orderBy: { createdAt: 'desc' },
      take: 200,
      include: { admin: { select: { id: true, email: true, employeeProfile: true } } }
    })
    res.json(logs)
  } catch (err) { next(err) }
}

// Time line ของแอดมิน (บริษัท)
export async function getCompanyAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    // หาผู้ใช้ในบริษัทเดียวกันผ่าน employeeProfile
    const userId = req.user!.id
    // ดึง companyCode จาก employeeProfile ของ user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { employeeProfile: true }
    })
    const companyCode = user?.employeeProfile?.companyCode
    if (!companyCode) return res.status(400).json({ error: 'No companyCode found for user' })
    // หาผู้ใช้ในบริษัทเดียวกัน
    const users = await prisma.user.findMany({
      where: { employeeProfile: { companyCode } },
      select: { id: true }
    })
    const userIds = users.map(u => u.id)
    const logs = await prisma.auditLog.findMany({
      where: { adminId: { in: userIds } },
      orderBy: { createdAt: 'desc' },
      take: 300,
      include: { admin: { select: { id: true, email: true, employeeProfile: true } } }
    })
    res.json(logs)
  } catch (err) { next(err) }
}

// Time line ของ super admin (ทุกคน)
export async function getAllAuditLogs(req: Request, res: Response, next: NextFunction) {
  try {
    const logs = await prisma.auditLog.findMany({
      orderBy: { createdAt: 'desc' },
      take: 500,
      include: { admin: { select: { id: true, email: true, employeeProfile: true } } }
    })
    res.json(logs)
  } catch (err) { next(err) }
}
