import { Router } from 'express'
import type { RequestHandler } from 'express'
import {
  createTeam,
  listTeams,
  getTeamById,
  updateTeamById,
  deleteTeamById,
  addTeamMember,
  removeTeamMember,
  changeTeamLeader
} from '../modules/team/team.controller'
import { authMiddleware } from '../middleware/auth.middleware'
import { authorize } from '../middleware/authz'
import { companyAuth } from '../middleware/company-auth'

const router = Router()

// Protect all team routes with authentication and company authorization
router.use(authMiddleware as RequestHandler)
router.use(companyAuth(false) as RequestHandler)

// Team CRUD
router.post('/', 
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  createTeam as RequestHandler
)

router.get('/', 
  authorize(['USER', 'ADMIN', 'SUPERADMIN']) as RequestHandler,
  listTeams as RequestHandler
)

router.get('/:id',
  authorize(['USER', 'ADMIN', 'SUPERADMIN']) as RequestHandler,
  getTeamById as RequestHandler
)

router.put('/:id',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  updateTeamById as RequestHandler
)

router.delete('/:id',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  deleteTeamById as RequestHandler
)

// Team members
router.post('/:id/members',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  addTeamMember as RequestHandler
)

router.delete('/:id/members/:memberId',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  removeTeamMember as RequestHandler
)

// Team leader
router.patch('/:id/leader',
  authorize(['ADMIN', 'SUPERADMIN']) as RequestHandler,
  changeTeamLeader as RequestHandler
)

export default router
