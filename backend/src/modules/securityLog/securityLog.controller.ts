import { Request, Response } from 'express'
import { prisma}from '../../prisma'

// GET /api/security-logs
export const listSecurityLogs = async (_req: Request, res: Response) => {
  try {
    const logs = await prisma.securityLog.findMany({
      orderBy: { createdAt: 'desc' },
    })
    res.json(logs)
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch security logs' })
  }
}
