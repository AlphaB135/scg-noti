import { Router } from 'express'
import { listUsers } from '../modules/user/user.controller'
import { updateProfile } from '../modules/user/update-profile.controller'
import { authMiddleware } from '../middleware/auth.middleware'

const router = Router()

// List all users
router.get('/', listUsers)

// Update user profile
router.put('/profile', 
  authMiddleware,
  updateProfile
)

export default router
