/**
 * @fileoverview เซอร์วิสสำหรับจัดการข้อมูลพนักงาน
 * รองรับการค้นหาและดึงข้อมูลโปรไฟล์พนักงานพร้อมการแบ่งหน้า
 * 
 * โมเดลที่เกี่ยวข้อง:
 * - EmployeeProfile (ข้อมูลพนักงาน)
 * - User (ข้อมูลผู้ใช้)
 */

import { prisma } from '../../prisma'
import { EmployeeProfile } from '@prisma/client'
import { SearchEmployeeOpts } from './employee.dto'

class EmployeeService {
  /**
   * ค้นหาพนักงานพร้อมการแบ่งหน้า
   * สามารถค้นหาจากชื่อ, ชื่อเล่น, รหัสพนักงาน และตำแหน่ง
   * 
   * @param {SearchEmployeeOpts} opts - ตัวเลือกในการค้นหา
   * @param {string} opts.query - คำค้นหา
   * @param {number} opts.skip - จำนวนรายการที่ต้องการข้าม
   * @param {number} opts.take - จำนวนรายการที่ต้องการดึง
   * @returns {Promise<{
   *   items: Array<{
   *     userId: string, // รหัสผู้ใช้
   *     companyCode: string, // รหัสบริษัท
   *     employeeCode: string, // รหัสพนักงาน
   *     firstName: string, // ชื่อจริง
   *     lastName: string, // นามสกุล
   *     nickname?: string, // ชื่อเล่น (ถ้ามี)
   *     position?: string, // ตำแหน่ง (ถ้ามี)
   *     user: {
   *       status: string, // สถานะผู้ใช้
   *       role: string // บทบาทในระบบ
   *     }
   *   }>,
   *   total: number, // จำนวนผลลัพธ์ทั้งหมด
   *   page: number, // หน้าปัจจุบัน
   *   totalPages: number // จำนวนหน้าทั้งหมด
   * }>} ผลลัพธ์การค้นหาพร้อมข้อมูลการแบ่งหน้า
   * 
   * @prismaModel EmployeeProfile, User
   * @orderBy เรียงตามชื่อ และนามสกุล (A-Z)
   * @caseInsensitive ไม่คำนึงถึงตัวพิมพ์เล็ก-ใหญ่ในการค้นหา
   */
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

  /**
   * Check for duplicate employees based on employeeCode and email
   * 
   * @param employeeCodes Array of employee codes to check
   * @param emails Array of emails to check
   * @returns Filtered array of duplicate employeeCodes and emails
   */
  async checkDuplicates(employeeCodes: string[], emails: string[]) {
    const duplicates: { employeeCode: string; email: string }[] = []

    // Check employeeCode duplicates
    const existingByCode = await prisma.employeeProfile.findMany({
      where: {
        employeeCode: {
          in: employeeCodes
        }
      },
      select: {
        employeeCode: true,
        user: {
          select: {
            email: true
          }
        }
      }
    })
    
    existingByCode.forEach(emp => {
      duplicates.push({
        employeeCode: emp.employeeCode,
        email: emp.user.email
      })
    })

    // Check email duplicates
    const existingByEmail = await prisma.user.findMany({
      where: {
        email: {
          in: emails
        }
      },
      select: {
        email: true,
        employeeProfile: {
          select: {
            employeeCode: true
          }
        }
      }
    })

    existingByEmail.forEach(user => {
      if (user.employeeProfile && !duplicates.some(d => d.email === user.email)) {
        duplicates.push({
          employeeCode: user.employeeProfile.employeeCode,
          email: user.email
        })
      }
    })

    return duplicates
  }
}

export default new EmployeeService()
