import { Router } from 'express'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { getMyAuditLogs, getTeamAuditLogs, getCompanyAuditLogs, getAllAuditLogs } from '../modules/timeline/audit-log.controller'

const router = Router()

// Time line ของตัวเอง
router.get('/my', authMiddleware, authorize(['USER','ADMIN','SUPERADMIN']), getMyAuditLogs)
// Time line ของหัวหน้า (ทีม)
router.get('/team', authMiddleware, authorize(['ADMIN','SUPERADMIN']), getTeamAuditLogs)
// Time line ของแอดมิน (บริษัท)
router.get('/company', authMiddleware, authorize(['ADMIN','SUPERADMIN']), getCompanyAuditLogs)
// Time line ของ super admin (ทุกคน)
router.get('/all', authMiddleware, authorize(['SUPERADMIN']), getAllAuditLogs)

export default router
