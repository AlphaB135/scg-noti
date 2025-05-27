import { Router } from 'express'
import multer from 'multer'
import {
  createNotification,
  list,
  updateStatus,          // PATCH /:id/status
  reschedule,
  /* สร้างใหม่ข้างล่าง */
  updateNotification,    // PUT  /:id
  completeNotification,  // POST /:id/complete
} from './notification.controller'

const upload = multer({ dest: 'uploads/' })
const router = Router()

router.post('/', createNotification)
router.get('/', list)

router.put('/:id', updateNotification)           // แก้ไขงาน
router.patch('/:id/status', updateStatus)        // เปลี่ยนสถานะ (DONE | …)
router.post('/:id/complete', upload.single('attachment'), completeNotification) // เสร็จสิ้น + ไฟล์
router.post('/:id/reschedule', reschedule)

export default router
