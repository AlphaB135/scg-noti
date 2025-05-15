import { Request, Response, NextFunction } from 'express'
import { prisma } from '../../prisma'

/**
 * GET /api/users
 * คืนข้อมูล User พร้อม Profile (EmployeeProfile / AdminProfile)
 */
export async function listUsers(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const users = await prisma.user.findMany({
      include: {
        employeeProfile: true,
        adminProfile: true,
      },
      orderBy: { createdAt: 'desc' }
    })
    res.json(users)
    return
  } catch (err) {
    next(err)
  }
}
