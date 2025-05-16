/**
 * @fileoverview เส้นทางการเรียก API สำหรับจัดการการแจ้งเตือน
 * รองรับการดูรายการ สร้าง อัพเดทสถานะ และจัดการการแจ้งเตือนแบบวนซ้ำ
 * รวมถึงการจัดการการอนุมัติที่เกี่ยวข้อง
 * 
 * การรักษาความปลอดภัย:
 * - ทุกเส้นทางต้องมีการยืนยันตัวตน
 * 
 * เส้นทางที่รองรับ:
 * การแจ้งเตือน:
 * - GET /notifications - ดูรายการแจ้งเตือนทั้งหมด
 * - GET /notifications/scheduled - ดูรายการแจ้งเตือนตามกำหนดเวลา
 * - GET /notifications/mine - ดูรายการแจ้งเตือนของตนเอง
 * - POST /notifications - สร้างการแจ้งเตือนใหม่
 * - PATCH /notifications/:id - อัพเดทสถานะการแจ้งเตือน
 * - POST /notifications/:id/reschedule - กำหนดเวลาการแจ้งเตือนใหม่
 * 
 * การอนุมัติ:
 * - GET /notifications/:id/approvals - ดูรายการการอนุมัติของการแจ้งเตือน
 * - POST /notifications/:id/approvals - สร้างการอนุมัติใหม่
 */

import { Router } from 'express'
import {
  list,
  listMyNotifications,
  createNotification,
  updateStatus,
  reschedule,
} from '../modules/notification/notification.controller'
import * as approvalController from '../modules/approval/approval.controller'
import { jwtGuard } from '../modules/auth/jwtGuard'

const router = Router()

// ตรวจสอบการยืนยันตัวตนสำหรับทุกเส้นทาง
router.use(jwtGuard)

/**
 * เส้นทางการจัดการการแจ้งเตือน
 * @security JWT
 */
router.get('/mine', listMyNotifications) // ดูรายการแจ้งเตือนของตนเอง
router.get('/', list)                   // ดูรายการแจ้งเตือนทั้งหมด
router.post('/', createNotification)     // สร้างการแจ้งเตือนใหม่
router.patch('/:id', updateStatus)       // อัพเดทสถานะการแจ้งเตือน
router.post('/:id/reschedule', reschedule) // กำหนดเวลาใหม่

/**
 * เส้นทางการจัดการการอนุมัติ
 * @security JWT
 */
router.get('/:id/approvals', approvalController.listApprovals)   // ดูรายการการอนุมัติ
router.post('/:id/approvals', approvalController.createApproval) // สร้างการอนุมัติ

export default router
