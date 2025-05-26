import { Router } from 'express'
import { getOverview } from '../modules/admin/admin.controller'

const router = Router()

// Super-Admin Overview
router.get('/overview', getOverview)

export default router
