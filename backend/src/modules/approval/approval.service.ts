/**
 * @fileoverview เซอร์วิสสำหรับจัดการการอนุมัติในระบบ SCG Notification
 * รองรับการจัดการขั้นตอนการอนุมัติ รวมถึงการสร้าง แสดงรายการ และดูสถิติการอนุมัติ
 * 
 * โมเดลที่เกี่ยวข้อง:
 * - Approval (การอนุมัติ)
 * - Notification (การแจ้งเตือน)
 * - User (พร้อมโปรไฟล์พนักงานและแอดมิน)
 */

import {prisma}  from '../../prisma'
import type { CreateApprovalInput, ListApprovalQuery } from './approval.dto'

/**
 * แสดงรายการการอนุมัติพร้อมการแบ่งหน้า กรองตามสถานะ และรวมข้อมูลผู้ใช้
 * 
 * @param {string} notificationId - รหัสการแจ้งเตือนที่ต้องการดูการอนุมัติ
 * @param {ListApprovalQuery} opts - ตัวเลือกการค้นหาและการแบ่งหน้า
 * @param {number} opts.skip - จำนวนรายการที่ต้องการข้าม
 * @param {number} opts.take - จำนวนรายการที่ต้องการดึง
 * @param {number} opts.page - หน้าปัจจุบัน
 * @param {number} opts.size - จำนวนรายการต่อหน้า
 * @param {string} [opts.status] - กรองตามสถานะการอนุมัติ (ถ้ามี)
 * @returns {Promise<{
 *   data: (Approval & { user: User })[], // รายการการอนุมัติพร้อมข้อมูลผู้ใช้
 *   meta: { 
 *     total: number,      // จำนวนทั้งหมด
 *     page: number,       // หน้าปัจจุบัน
 *     size: number,       // จำนวนต่อหน้า
 *     totalPages: number  // จำนวนหน้าทั้งหมด
 *   }
 * }>} ผลลัพธ์การอนุมัติพร้อมข้อมูลการแบ่งหน้า
 * 
 * @prismaModel Approval, User (รวมในผลลัพธ์)
 * @orderBy เรียงตามวันที่สร้าง (createdAt) จากใหม่ไปเก่า
 */
export async function listApprovals(
  notificationId: string,
  opts: ListApprovalQuery
) {
  const where: { notificationId: string; response?: string } = {
    notificationId,
    ...(opts.status && { response: opts.status }),
  }

  const [data, total] = await Promise.all([
    prisma.approval.findMany({
      where,
      skip: opts.skip,
      take: opts.take,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            employeeProfile: true,
            adminProfile: true,
          },
        },
      },
    }),
    prisma.approval.count({ where }),
  ])

  return {
    data,
    meta: {
      total,
      page: opts.page,
      size: opts.size,
      totalPages: Math.ceil(total / opts.size),
    },
  }
}

/**
 * ดึงสถิติการอนุมัติแยกตามสถานะ
 * ใช้สำหรับแสดงความคืบหน้าและสถิติการอนุมัติ
 * 
 * @param {string} notificationId - รหัสการแจ้งเตือนที่ต้องการดูสถิติ
 * @returns {Promise<{
 *   pending: number,  // จำนวนที่รอการอนุมัติ
 *   approved: number, // จำนวนที่อนุมัติแล้ว
 *   rejected: number  // จำนวนที่ปฏิเสธ
 * }>} จำนวนการอนุมัติในแต่ละสถานะ
 * 
 * @prismaModel Approval
 * @aggregation จัดกลุ่มตามสถานะการตอบกลับและนับจำนวน
 */
export async function getApprovalMetrics(
  notificationId: string
) {
  const stats = await prisma.approval.groupBy({
    by: ['response'],
    where: { notificationId },
    _count: { response: true },
  })

  const metrics = {
    pending:  0,
    approved: 0,
    rejected: 0,
  }

  stats.forEach(stat => {
    const count = stat._count.response
    switch (stat.response) {
      case 'PENDING':
        metrics.pending = count
        break
      case 'APPROVED':
        metrics.approved = count
        break
      case 'REJECTED':
        metrics.rejected = count
        break
    }
  })

  return metrics
}

/**
 * สร้างการอนุมัติใหม่สำหรับการแจ้งเตือน
 * เชื่อมโยงการอนุมัติกับทั้งการแจ้งเตือนและผู้อนุมัติ
 * 
 * @param {string} notificationId - รหัสการแจ้งเตือนที่ต้องการอนุมัติ
 * @param {string} userId - รหัสผู้ใช้ที่ทำการอนุมัติ
 * @param {CreateApprovalInput} input - ข้อมูลการอนุมัติ
 * @param {string} input.response - การตอบกลับ ('PENDING'|'APPROVED'|'REJECTED')
 * @param {string} [input.comment] - ความคิดเห็นประกอบการอนุมัติ (ถ้ามี)
 * @returns {Promise<Approval & {
 *   user: User,
 *   notification: Notification
 * }>} การอนุมัติที่สร้างพร้อมข้อมูลที่เกี่ยวข้อง
 * 
 * @prismaModel Approval, User (เชื่อมโยง), Notification (เชื่อมโยง)
 * @transaction สร้างการอนุมัติและเชื่อมความสัมพันธ์ในทรานแซคชั่นเดียวกัน
 */
export async function createApproval(
  notificationId: string,
  userId: string,
  input: CreateApprovalInput
) {
  return prisma.approval.create({
    data: {
      notification: { connect: { id: notificationId } },
      user:         { connect: { id: userId } },
      response:     input.response,
      comment:      input.comment ?? '',
    },
    include: {
      user: true,
      notification: true,
    },
  })
}
