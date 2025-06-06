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
 * - PUT /notifications/:id - อัพเดทข้อมูลการแจ้งเตือน รวมถึง linkUsername และ linkPassword
 * - POST /notifications/:id/reschedule - กำหนดเวลาการแจ้งเตือนใหม่
 *
 * การอนุมัติ:
 * - GET /notifications/:id/approvals - ดูรายการการอนุมัติของการแจ้งเตือน
 * - POST /notifications/:id/approvals - สร้างการอนุมัติใหม่
 */

import { Router } from "express";
import {
  list,
  listMyNotifications,
  createNotification,
  updateStatus,
  updateNotification,
  reschedule,
  deleteNotification 
} from "../modules/notification/notification.controller";
import * as approvalController from "../modules/approval/approval.controller";
import { jwtGuard } from "../modules/auth/jwtGuard";
import { validateRequest } from "../middleware/validate";
import {
  createNotificationSchema,
  updateNotificationSchema,
  updateStatusSchema,
} from "../modules/notification/notification.dto";
import { deleteNotification } from "../modules/notification/notification.controller";

const router = Router();

// ตรวจสอบการยืนยันตัวตนสำหรับทุกเส้นทาง
router.use(jwtGuard);

/**
 * เส้นทางการจัดการการแจ้งเตือน
 * @security JWT
 */
import { companyAuth } from "../middleware/company-auth";
import { authorize } from "../middleware/authz";

// Routes with company auth
router.get("/mine", companyAuth(true), listMyNotifications);
router.get("/", companyAuth(false), list);
router.post(
  "/",
  companyAuth(true),
  authorize(["ADMIN", "SUPERADMIN"]),
  createNotification
);
router.delete('/:id', companyAuth(true), deleteNotification)
router.patch(
  "/:id",
  companyAuth(true),
  authorize(["ADMIN", "SUPERADMIN"]),
  validateRequest({ body: updateStatusSchema }),
  updateStatus
);
router.put(
  "/:id",
  companyAuth(true),
  authorize(["ADMIN", "SUPERADMIN"]),
  validateRequest({ body: updateNotificationSchema }),
  updateNotification
);
router.post(
  "/:id/reschedule",
  // companyAuth(true), // ชั่วคราวปิดเพื่อทดสอบ
  // authorize(["ADMIN", "SUPERADMIN"]), // ชั่วคราวปิดเพื่อทดสอบ
  reschedule
);

/**
 * เส้นทางการจัดการการอนุมัติ
 * @security JWT
 */
router.get("/:id/approvals", approvalController.listApprovals); // ดูรายการการอนุมัติ
router.post("/:id/approvals", approvalController.createApproval); // สร้างการอนุมัติ

export default router;
