import { prisma } from '../../prisma'
import { EmployeeProfile } from '@prisma/client'
import { SearchEmployeeOpts } from './employee.dto'

class EmployeeService {
  /** ค้นหาพนักงาน พร้อม pagination */
  async searchEmployees(opts: SearchEmployeeOpts) {
    const { query, skip, take } = opts

    const where = {
      OR: [
        { firstName: { contains: query, mode: 'insensitive' } },
        { lastName: { contains: query, mode: 'insensitive' } },
        { nickname: { contains: query, mode: 'insensitive' } },
        { employeeCode: { contains: query, mode: 'insensitive' } },
        { position: { contains: query, mode: 'insensitive' } }
      ]
    }

    const [total, items] = await Promise.all([
      prisma.employeeProfile.count({ where }),
      prisma.employeeProfile.findMany({
        where,
        select: {
          userId: true,
          companyCode: true,
          employeeCode: true,
          firstName: true,
          lastName: true,
          nickname: true,
          position: true,
          user: {
            select: {
              status: true,
              role: true
            }
          }
        },
        skip,
        take,
        orderBy: [
          { firstName: 'asc' },
          { lastName: 'asc' }
        ]
      })
    ])

    return {
      items,
      total,
      page: Math.floor(skip / take) + 1,
      totalPages: Math.ceil(total / take)
    }
  }
}

export default new EmployeeService()
