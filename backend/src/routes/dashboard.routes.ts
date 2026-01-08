// backend/src/routes/dashboard.routes.ts
import { Router } from 'express';
import { getDashboardStats } from '@/controllers/dashboard.controller';
import { authenticateUser } from '@/middleware/auth.middleware';

const router = Router();

/**
 * @swagger
 * /dashboard/stats:
 *   get:
 *     summary: Get aggregated dashboard statistics and activity
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard stats retrieved successfully
 *       401:
 *         description: Unauthorized
 */
router.get('/stats', authenticateUser, getDashboardStats);

export default router;