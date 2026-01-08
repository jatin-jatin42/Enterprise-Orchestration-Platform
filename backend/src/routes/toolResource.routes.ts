import { Router } from 'express';
import {
  getAllTools,
  getToolById,
  createTool,
  updateTool,
  deleteTool,
} from '@/controllers/toolResource.controller';
import {
  authenticateUser,
  checkOwnershipOrAdmin,
} from '@/middleware/auth.middleware';
import ToolResource from '@/models/ToolResource.model';
import { toolResourceValidation } from '@/utils/validators';

/**
 * @swagger
 * tags:
 *   name: ToolResources
 *   description: Operations related to tool resources
 */

const router = Router();

/**
 * @swagger
 * /tool-resources:
 *   get:
 *     summary: Get a paginated list of tool resources
 *     tags: [ToolResources]
 *     parameters:
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           example: Productivity
 *         description: Filter tools by category
 *       - in: query
 *         name: pricing
 *         schema:
 *           type: string
 *           enum: [Free, Paid, Freemium, Open Source]
 *         description: Filter tools by pricing type
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by tool name, description, or tags
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 10
 *         description: Number of items per page
 *     responses:
 *       200:
 *         description: List of tool resources with pagination
 */
router.get('/', getAllTools);

/**
 * @swagger
 * /tool-resources/{id}:
 *   get:
 *     summary: Get a tool resource by ID
 *     tags: [ToolResources]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tool resource ID
 *     responses:
 *       200:
 *         description: Tool resource details
 *       404:
 *         description: Tool not found
 */
router.get('/:id', getToolById);

/**
 * @swagger
 * /tool-resources:
 *   post:
 *     summary: Create a new tool resource
 *     tags: [ToolResources]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       description: Tool resource data
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - toolName
 *               - category
 *               - url
 *             properties:
 *               toolName:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               pricing:
 *                 type: string
 *                 enum: [Free, Paid, Freemium]
 *               url:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *                 default: true
 *     responses:
 *       201:
 *         description: Tool resource created successfully
 *       401:
 *         description: Unauthorized
 */
router.post('/', authenticateUser, toolResourceValidation, createTool);

/**
 * @swagger
 * /tool-resources/{id}:
 *   put:
 *     summary: Update an existing tool resource
 *     tags: [ToolResources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tool resource ID
 *     requestBody:
 *       required: true
 *       description: Updated tool resource data
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               toolName:
 *                 type: string
 *               description:
 *                 type: string
 *               category:
 *                 type: string
 *               pricing:
 *                 type: string
 *                 enum: [Free, Paid, Freemium]
 *               url:
 *                 type: string
 *               tags:
 *                 type: array
 *                 items:
 *                   type: string
 *               isActive:
 *                 type: boolean
 *     responses:
 *       200:
 *         description: Tool resource updated successfully
 *       404:
 *         description: Tool not found
 *       403:
 *         description: Forbidden (not owner or admin)
 */
router.put('/:id', authenticateUser, checkOwnershipOrAdmin(ToolResource), updateTool);

/**
 * @swagger
 * /tool-resources/{id}:
 *   delete:
 *     summary: Soft delete a tool resource
 *     tags: [ToolResources]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Tool resource ID
 *     responses:
 *       200:
 *         description: Tool resource deleted successfully
 *       404:
 *         description: Tool not found
 *       403:
 *         description: Forbidden (not owner or admin)
 */
router.delete('/:id', authenticateUser, checkOwnershipOrAdmin(ToolResource), deleteTool);

export default router;
