import { Router } from 'express'
import { listUsers } from '../modules/user/user.controller'

const router = Router()
router.get('/', listUsers)
export default router
