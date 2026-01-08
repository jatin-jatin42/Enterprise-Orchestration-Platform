import { Router } from 'express';
import {
  getAllProjects,
  getProjectById,
  createProject,
  updateProject,
  deleteProject,
  assignProjectToIntern,
  removeProjectFromIntern,
  getProjectInterns,
  updateProjectManager,
  addPdfDocument,
  removePdfDocument,
  getProjectDocuments,
} from '@/controllers/project.controller';
import {
  authenticateUser,
  checkOwnershipOrAdmin,
} from '@/middleware/auth.middleware';
import Project from '@/models/Project.model';
import { projectValidation } from '@/utils/validators';
import { projectDocumentsUpload } from '@/middleware/upload.middleware';

/**
 * @swagger
 * tags:
 *   name: Projects
 *   description: Project management operations
 */

const router = Router();

/**
 * @swagger
 * /projects:
 *   get:
 *     summary: Get all projects with filtering and pagination
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [Planning, In Progress, Completed, On Hold]
 *         description: Filter by project status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by project name or description
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
 *         description: List of projects with pagination
 *       401:
 *         description: Unauthorized
 */
router.get('/', authenticateUser, getAllProjects);

/**
 * @swagger
 * /projects/{id}:
 *   get:
 *     summary: Get project by ID
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project details
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id', authenticateUser, getProjectById);

/**
 * @swagger
 * /projects:
 *   post:
 *     summary: Create a new project with optional file uploads
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - projectName
 *             properties:
 *               projectName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Planning, In Progress, Completed, On Hold]
 *                 default: Planning
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               projectUrl:
 *                 type: string
 *               repositoryUrl:
 *                 type: string
 *               documentationUrl:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional project documents (max 10 files)
 *     responses:
 *       201:
 *         description: Project created successfully
 *       400:
 *         description: Validation error
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/',
  authenticateUser,
  projectDocumentsUpload.array('documents', 10),
  projectValidation,
  createProject
);

/**
 * @swagger
 * /projects/{id}:
 *   put:
 *     summary: Update a project with optional file uploads
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               projectName:
 *                 type: string
 *               description:
 *                 type: string
 *               status:
 *                 type: string
 *                 enum: [Planning, In Progress, Completed, On Hold]
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *               projectUrl:
 *                 type: string
 *               repositoryUrl:
 *                 type: string
 *               documentationUrl:
 *                 type: string
 *               technologies:
 *                 type: array
 *                 items:
 *                   type: string
 *               documents:
 *                 type: array
 *                 items:
 *                   type: string
 *                   format: binary
 *                 description: Optional additional project documents (max 10 files)
 *     responses:
 *       200:
 *         description: Project updated successfully
 *       404:
 *         description: Project not found
 *       403:
 *         description: Forbidden (not owner or admin)
 *       401:
 *         description: Unauthorized
 */
router.put(
  '/:id',
  authenticateUser,
  checkOwnershipOrAdmin(Project),
  projectDocumentsUpload.array('documents', 10),
  updateProject
);

/**
 * @swagger
 * /projects/{id}:
 *   delete:
 *     summary: Delete a project (soft delete)
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Project deleted successfully
 *       404:
 *         description: Project not found
 *       403:
 *         description: Forbidden (not owner or admin)
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id', authenticateUser, checkOwnershipOrAdmin(Project), deleteProject);

// ============================
// TEAM MANAGEMENT ROUTES
// ============================

/**
 * @swagger
 * /projects/{id}/assign-intern:
 *   post:
 *     summary: Assign project to intern
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - internId
 *               - role
 *             properties:
 *               internId:
 *                 type: string
 *               role:
 *                 type: string
 *               startDate:
 *                 type: string
 *                 format: date
 *               endDate:
 *                 type: string
 *                 format: date
 *     responses:
 *       200:
 *         description: Project assigned to intern successfully
 *       400:
 *         description: Intern already assigned or invalid data
 *       404:
 *         description: Project or intern not found
 *       401:
 *         description: Unauthorized
 */
router.post('/:id/assign-intern', authenticateUser, assignProjectToIntern);

/**
 * @swagger
 * /projects/{id}/unassign-intern:
 *   delete:
 *     summary: Remove intern from project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: query
 *         name: internId
 *         required: true
 *         schema:
 *           type: string
 *         description: Intern ID to remove
 *     responses:
 *       200:
 *         description: Intern removed from project successfully
 *       400:
 *         description: Intern not assigned to project
 *       404:
 *         description: Project or intern not found
 *       401:
 *         description: Unauthorized
 */
router.delete('/:id/unassign-intern', authenticateUser, removeProjectFromIntern);

/**
 * @swagger
 * /projects/{id}/interns:
 *   get:
 *     summary: Get all interns assigned to a project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of project interns with their roles
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/interns', authenticateUser, getProjectInterns);

/**
 * @swagger
 * /projects/{id}/manager:
 *   put:
 *     summary: Update project manager
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - userId
 *             properties:
 *               userId:
 *                 type: string
 *               name:
 *                 type: string
 *     responses:
 *       200:
 *         description: Project manager updated successfully
 *       404:
 *         description: Project or user not found
 *       401:
 *         description: Unauthorized
 */
router.put('/:id/manager', authenticateUser, updateProjectManager);

// ============================
// DOCUMENT MANAGEMENT ROUTES
// ============================

/**
 * @swagger
 * /projects/{id}/documents:
 *   get:
 *     summary: Get all project documents
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     responses:
 *       200:
 *         description: List of project documents
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.get('/:id/documents', authenticateUser, getProjectDocuments);

/**
 * @swagger
 * /projects/{id}/documents:
 *   post:
 *     summary: Upload single document to project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             required:
 *               - document
 *             properties:
 *               document:
 *                 type: string
 *                 format: binary
 *                 description: Document file (PDF, DOC, DOCX, etc.)
 *               title:
 *                 type: string
 *                 description: Document title (required)
 *               description:
 *                 type: string
 *                 description: Document description (optional)
 *     responses:
 *       200:
 *         description: Document uploaded successfully
 *       400:
 *         description: No file uploaded or invalid file type
 *       404:
 *         description: Project not found
 *       401:
 *         description: Unauthorized
 */
router.post(
  '/:id/documents',
  authenticateUser,
  checkOwnershipOrAdmin(Project),
  projectDocumentsUpload.single('document'),
  addPdfDocument
);

/**
 * @swagger
 * /projects/{id}/documents/{documentIndex}:
 *   delete:
 *     summary: Remove document from project
 *     tags: [Projects]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Project ID
 *       - in: path
 *         name: documentIndex
 *         required: true
 *         schema:
 *           type: integer
 *         description: Index of the document in the pdfDocuments array (0-based)
 *     responses:
 *       200:
 *         description: Document removed successfully
 *       400:
 *         description: Invalid document index
 *       404:
 *         description: Project or document not found
 *       401:
 *         description: Unauthorized
 */
router.delete(
  '/:id/documents/:documentIndex', 
  authenticateUser, 
  checkOwnershipOrAdmin(Project),
  removePdfDocument
);

export default router;