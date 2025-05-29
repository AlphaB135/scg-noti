// backend/src/routes/timeline.ts

import { Router } from 'express';
import { getTimeline } from '../controllers/timeline.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

/**
 * GET /api/timeline
 * Get timeline events for authenticated user
 * 
 * Query params:
 * - limit: number (default 20, max 100)
 * - cursor: string (base64 encoded cursor for pagination)
 * - types: string (comma-separated: notification,approval)
 */
router.get('/', authMiddleware, getTimeline);

export default router;
