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
 * - GET   /notifications           - ดูรายการแจ้งเตือนทั้งหมด
 * - GET   /notifications/mine      - ดูรายการแจ้งเตือนของตนเอง
 * - GET   /notifications/personal  - ดูรายการแจ้งเตือนส่วนตัว (TODO ที่สร้างโดยตน)
 * - POST  /notifications           - สร้างการแจ้งเตือนใหม่
 * - DELETE/notifications/:id       - ลบการแจ้งเตือน
 * - PATCH /notifications/:id       - อัพเดทสถานะการแจ้งเตือน
 * - PUT   /notifications/:id       - อัพเดทข้อมูลการแจ้งเตือน (linkUsername, linkPassword ฯลฯ)
 * - POST  /notifications/:id/reschedule - กำหนดเวลาการแจ้งเตือนใหม่
 *
 * การอนุมัติ:
 * - GET   /notifications/:id/approvals  - ดูรายการการอนุมัติของการแจ้งเตือน
 * - POST  /notifications/:id/approvals  - สร้างการอนุมัติใหม่
 */

import { Router } from "express";
import {
  list,
  listMyNotifications,
  createNotification,
  updateStatus,
  updateNotification,
  reschedule,
  deleteNotification,
  listPersonalNotifications,
} from "../modules/notification/notification.controller";
import * as approvalController from "../modules/approval/approval.controller";
import { jwtGuard } from "../modules/auth/jwtGuard";
import { validateRequest } from "../middleware/validate";
import {
  createNotificationSchema,
  updateNotificationSchema,
  updateStatusSchema,
} from "../modules/notification/notification.dto";
import { companyAuth } from "../middleware/company-auth";
import { authorize } from "../middleware/authz";

const router = Router();

// ตรวจสอบการยืนยันตัวตนสำหรับทุกเส้นทาง
router.use(jwtGuard);

/**
 * เส้นทางการจัดการการแจ้งเตือน
 * @security JWT
 */

// ดูรายการ "ของฉัน" (ไม่บังคับให้มี companyCode เสมอ)
router.get("/mine", companyAuth(false), listMyNotifications);

// ดูรายการแจ้งเตือนทั้งหมด (กรองตาม ALL/COMPANY/GROUP/USER)
router.get("/", companyAuth(false), list);

// สร้างการแจ้งเตือนใหม่ (ต้องเป็น ADMIN หรือ SUPERADMIN)
router.post(
  "/",
  companyAuth(true),
  authorize(["ADMIN", "SUPERADMIN"]),
  validateRequest({ body: createNotificationSchema }),
  createNotification
);

// ลบการแจ้งเตือน (ต้องมี companyAuth)
router.delete("/:id", companyAuth(true), deleteNotification);

// อัพเดทสถานะการแจ้งเตือน (ต้องเป็น ADMIN หรือ SUPERADMIN)
router.patch(
  "/:id",
  companyAuth(true),
  authorize(["ADMIN", "SUPERADMIN"]),
  validateRequest({ body: updateStatusSchema }),
  updateStatus
);

// อัพเดทข้อมูลการแจ้งเตือน (ต้องเป็น ADMIN หรือ SUPERADMIN)
router.put(
  "/:id",
  companyAuth(true),
  authorize(["ADMIN", "SUPERADMIN"]),
  validateRequest({ body: updateNotificationSchema }),
  updateNotification
);

// กำหนดเวลาการแจ้งเตือนใหม่ (ต้องมี companyAuth)
// NOTE: ถ้าต้อง validate ด้วย rescheduleSchema ให้ import แล้วเปลี่ยน validateRequest ให้ถูกต้อง
router.post(
  "/:id/reschedule",
  companyAuth(true),
  reschedule
);

// ดูรายการแจ้งเตือนส่วนตัว (TODO ที่สร้างโดยผู้ใช้ปัจจุบัน)
router.get("/personal", companyAuth(true), listPersonalNotifications);

/**
 * เส้นทางการจัดการการอนุมัติ (Approval)
 * @security JWT
 */
router.get("/:id/approvals", approvalController.listApprovals);
router.post("/:id/approvals", approvalController.createApproval);

export default router;
