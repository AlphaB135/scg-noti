import { Router } from 'express'
import { listSecurityLogs } from '../modules/securityLog/securityLog.controller'

const router = Router()
router.get('/', listSecurityLogs)

export default router
