// backend/src/modules/team/team.controller.ts
import type { Request, Response, NextFunction } from 'express'
import type { RequestHandler } from 'express'
import TeamService from './team.service'
import {
  createTeamSchema,
  updateTeamSchema,
  paginationSchema,
  addMemberSchema,
  changeLeaderSchema
} from './team.dto'

export async function createTeam(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const input = createTeamSchema.parse(req.body)
    const data = await TeamService.createTeam(input)
    res.status(201).json(data)
    return
  } catch (err) {
    next(err)
  }
}

export async function listTeams(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const opts = paginationSchema.parse(req.query)
    // Pass company code if not SUPERADMIN
    const result = await TeamService.listTeams(
      opts, 
      req.companyCode,
      (req.user as any)?.role
    )
    res.json(result)
    return
  } catch (err) {
    next(err)
  }
}

export async function getTeamById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params
    const data = await TeamService.getTeam(id)
    if (!data) {
      res.status(404).json({ error: 'Team not found' })
      return
    }
    res.json(data)
    return
  } catch (err) {
    next(err)
  }
}

export async function updateTeamById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params
    const input = updateTeamSchema.parse(req.body)
    const data = await TeamService.updateTeam(id, input)
    res.json(data)
    return
  } catch (err) {
    next(err)
  }
}

export async function deleteTeamById(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id } = req.params
    await TeamService.deleteTeam(id)
    res.status(204).send()
    return
  } catch (err) {
    next(err)
  }
}

export async function addTeamMember(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: teamId } = req.params
    const { employeeId, role } = addMemberSchema.parse(req.body)
    const data = await TeamService.addMember(teamId, employeeId, role)
    res.status(201).json(data)
    return
  } catch (err) {
    next(err)
  }
}

export async function removeTeamMember(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { memberId } = req.params
    await TeamService.removeMember(memberId)
    res.status(204).send()
    return
  } catch (err) {
    next(err)
  }
}

export async function changeTeamLeader(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: teamId } = req.params
    const { leaderId } = changeLeaderSchema.parse(req.body)
    const data = await TeamService.changeLeader(teamId, leaderId)
    res.json(data)
    return
  } catch (err) {
    next(err)
  }
}

export async function getTeamMembers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { id: teamId } = req.params
    const team = await TeamService.getTeam(teamId)
    
    if (!team) {
      res.status(404).json({
        success: false,
        error: 'Team not found'
      })
      return
    }
    
    res.json({
      success: true,
      data: team.members
    })
    return
  } catch (err) {
    next(err)
  }
}