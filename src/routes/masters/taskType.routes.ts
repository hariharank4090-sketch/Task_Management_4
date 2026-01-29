import express from 'express';
import {
    getAllTaskTypes,
    getTaskTypeById,
    createTaskType,
    updateTaskType,
    deleteTaskType,
    getActiveTaskTypes,
    restoreTaskType,
    hardDeleteTaskType,
    getTaskTypesByProjectId
} from '../../controllers/masters/taskManagement/taskType.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TaskTypes
 *   description: Task Type management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     TaskType:
 *       type: object
 *       required:
 *         - Task_Type
 *       properties:
 *         Task_Type_Id:
 *           type: integer
 *           readOnly: true
 *           example: 1
 *         Task_Type:
 *           type: string
 *           minLength: 1
 *           maxLength: 250
 *           example: "Development"
 *         Is_Reptative:
 *           type: integer
 *           minimum: 0
 *           maximum: 1
 *           default: 0
 *           example: 0
 *         Hours_Duration:
 *           type: integer
 *           minimum: 0
 *           nullable: true
 *           example: 8
 *         Day_Duration:
 *           type: integer
 *           minimum: 0
 *           nullable: true
 *           example: 1
 *         TT_Del_Flag:
 *           type: integer
 *           minimum: 0
 *           maximum: 1
 *           default: 0
 *           example: 0
 *         Project_Id:
 *           type: integer
 *           minimum: 1
 *           nullable: true
 *           example: 1
 *         Est_StartTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-01T09:00:00.000Z"
 *         Est_EndTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-01T17:00:00.000Z"
 *         Status:
 *           type: integer
 *           minimum: 0
 *           maximum: 1
 *           default: 1
 *           example: 1
 *         Project_Name:
 *           type: string
 *           nullable: true
 *           example: "Project Alpha"
 * 
 *     TaskTypeCreate:
 *       type: object
 *       required:
 *         - Task_Type
 *       properties:
 *         Task_Type:
 *           type: string
 *           minLength: 1
 *           maxLength: 250
 *           example: "New Task Type"
 *         Is_Reptative:
 *           type: integer
 *           minimum: 0
 *           maximum: 1
 *           default: 0
 *           optional: true
 *         Hours_Duration:
 *           type: integer
 *           minimum: 0
 *           nullable: true
 *           optional: true
 *         Day_Duration:
 *           type: integer
 *           minimum: 0
 *           nullable: true
 *           optional: true
 *         Project_Id:
 *           type: integer
 *           minimum: 1
 *           nullable: true
 *           optional: true
 *         Est_StartTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 *         Est_EndTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 * 
 *     TaskTypeUpdate:
 *       type: object
 *       properties:
 *         Task_Type:
 *           type: string
 *           minLength: 1
 *           maxLength: 250
 *           optional: true
 *         Is_Reptative:
 *           type: integer
 *           minimum: 0
 *           maximum: 1
 *           optional: true
 *         Hours_Duration:
 *           type: integer
 *           minimum: 0
 *           nullable: true
 *           optional: true
 *         Day_Duration:
 *           type: integer
 *           minimum: 0
 *           nullable: true
 *           optional: true
 *         Project_Id:
 *           type: integer
 *           minimum: 1
 *           nullable: true
 *           optional: true
 *         Est_StartTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 *         Est_EndTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           optional: true
 *         Status:
 *           type: integer
 *           minimum: 0
 *           maximum: 1
 *           optional: true
 * 
 *     Pagination:
 *       type: object
 *       properties:
 *         totalRecords:
 *           type: integer
 *           example: 150
 *         currentPage:
 *           type: integer
 *           example: 1
 *         totalPages:
 *           type: integer
 *           example: 8
 *         pageSize:
 *           type: integer
 *           example: 20
 *         hasNextPage:
 *           type: boolean
 *           example: true
 *         hasPreviousPage:
 *           type: boolean
 *           example: false
 * 
 *     Error:
 *       type: object
 *       properties:
 *         success:
 *           type: boolean
 *           example: false
 *         message:
 *           type: string
 *           example: "Validation failed"
 *         errors:
 *           type: array
 *           items:
 *             type: object
 *             properties:
 *               field:
 *                 type: string
 *                 example: "Task_Type"
 *               message:
 *                 type: string
 *                 example: "Task_Type is required"
 * 
 *   parameters:
 *     taskTypeId:
 *       name: id
 *       in: path
 *       description: Task Type ID
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 * 
 *     projectId:
 *       name: projectId
 *       in: path
 *       description: Project ID
 *       required: true
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 1
 * 
 *     paginationPage:
 *       name: page
 *       in: query
 *       description: Page number
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         default: 1
 *       example: 1
 * 
 *     paginationLimit:
 *       name: limit
 *       in: query
 *       description: Items per page (max 100)
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *         maximum: 100
 *         default: 20
 *       example: 20
 * 
 *     searchQuery:
 *       name: search
 *       in: query
 *       description: Search by task type name
 *       required: false
 *       schema:
 *         type: string
 * 
 *     projectIdQuery:
 *       name: projectId
 *       in: query
 *       description: Filter by project ID
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 * 
 *     statusQuery:
 *       name: status
 *       in: query
 *       description: Filter by status
 *       required: false
 *       schema:
 *         type: string
 *         enum: ['0', '1', 'all']
 *         default: '1'
 * 
 *     ttDelFlagQuery:
 *       name: ttDelFlag
 *       in: query
 *       description: Filter by deletion flag
 *       required: false
 *       schema:
 *         type: string
 *         enum: ['0', '1', 'all']
 *         default: '0'
 * 
 *     isReptativeQuery:
 *       name: isReptative
 *       in: query
 *       description: Filter by repetitive flag
 *       required: false
 *       schema:
 *         type: string
 *         enum: ['0', '1']
 * 
 *     sortByParam:
 *       name: sortBy
 *       in: query
 *       description: Sort field
 *       required: false
 *       schema:
 *         type: string
 *         enum: ["Task_Type_Id", "Task_Type", "Project_Id"]
 *         default: "Task_Type_Id"
 * 
 *     sortOrderParam:
 *       name: sortOrder
 *       in: query
 *       description: Sort order
 *       required: false
 *       schema:
 *         type: string
 *         enum: ["ASC", "DESC"]
 *         default: "ASC"
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

// Public endpoints (no authentication required)
/**
 * @swagger
 * /api/masters/taskType/active:
 *   get:
 *     summary: Get active task types
 *     description: Retrieve all active (not deleted) task types, optionally filtered by project
 *     tags: [TaskTypes]
 *     parameters:
 *       - name: projectId
 *         in: query
 *         description: Filter by project ID
 *         required: false
 *         schema:
 *           type: integer
 *           minimum: 1
 *     responses:
 *       200:
 *         description: Successfully retrieved active task types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskType'
 *       500:
 *         description: Internal server error
 */
router.get('/active', getActiveTaskTypes);

/**
 * @swagger
 * /api/masters/taskType/project/{projectId}:
 *   get:
 *     summary: Get task types by project ID
 *     description: Retrieve all task types for a specific project
 *     tags: [TaskTypes]
 *     parameters:
 *       - $ref: '#/components/parameters/projectId'
 *     responses:
 *       200:
 *         description: Successfully retrieved task types by project
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Invalid project ID
 *       404:
 *         description: No task types found for this project
 *       500:
 *         description: Internal server error
 */
router.get('/project/:projectId', getTaskTypesByProjectId);

/**
 * @swagger
 * /api/masters/taskType:
 *   get:
 *     summary: Get all task types with pagination and filtering
 *     description: Retrieve a paginated list of task types with optional filtering and search
 *     tags: [TaskTypes]
 *     parameters:
 *       - $ref: '#/components/parameters/paginationPage'
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/searchQuery'
 *       - $ref: '#/components/parameters/projectIdQuery'
 *       - $ref: '#/components/parameters/statusQuery'
 *       - $ref: '#/components/parameters/ttDelFlagQuery'
 *       - $ref: '#/components/parameters/isReptativeQuery'
 *       - $ref: '#/components/parameters/sortByParam'
 *       - $ref: '#/components/parameters/sortOrderParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved task types
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskType'
 *                 metadata:
 *                   $ref: '#/components/schemas/Pagination'
 *       400:
 *         description: Invalid query parameters
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllTaskTypes);

/**
 * @swagger
 * /api/masters/taskType/{id}:
 *   get:
 *     summary: Get task type by ID
 *     description: Retrieve a specific task type by its ID
 *     tags: [TaskTypes]
 *     parameters:
 *       - $ref: '#/components/parameters/taskTypeId'
 *     responses:
 *       200:
 *         description: Successfully retrieved task type
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Task type not found
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: false
 *                 message:
 *                   type: string
 *                   example: "Task type not found"
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getTaskTypeById);

// Protected endpoints (require authentication and authorization)
/**
 * @swagger
 * /api/masters/taskType:
 *   post:
 *     summary: Create a new task type
 *     description: Create a new task type record
 *     tags: [TaskTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskTypeCreate'
 *     responses:
 *       201:
 *         description: Task type created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       409:
 *         description: Conflict - Task type with this name already exists
 *       500:
 *         description: Internal server error
 */
router.post('/',
    authenticate,
    authorize([1, 2]),
    createTaskType
);

/**
 * @swagger
 * /api/masters/taskType/{id}:
 *   put:
 *     summary: Update a task type
 *     description: Update an existing task type by ID
 *     tags: [TaskTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskTypeId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskTypeUpdate'
 *     responses:
 *       200:
 *         description: Task type updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Validation error
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task type not found
 *       409:
 *         description: Conflict - Another task type with this name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
    authenticate,
    authorize([1, 2]),
    updateTaskType
);

/**
 * @swagger
 * /api/masters/taskType/{id}/restore:
 *   patch:
 *     summary: Restore a deleted task type
 *     description: Restore a soft-deleted task type by ID
 *     tags: [TaskTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskTypeId'
 *     responses:
 *       200:
 *         description: Task type restored successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *                 data:
 *                   $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.patch('/:id/restore',
    authenticate,
    authorize([1]),
    restoreTaskType
);

/**
 * @swagger
 * /api/masters/taskType/{id}:
 *   delete:
 *     summary: Delete a task type (soft delete)
 *     description: Soft delete a task type by setting TT_Del_Flag = 1 and Status = 0
 *     tags: [TaskTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskTypeId'
 *     responses:
 *       200:
 *         description: Task type deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
    authenticate,
    authorize([1]),
    deleteTaskType
);

/**
 * @swagger
 * /api/masters/taskType/{id}/hard:
 *   delete:
 *     summary: Permanently delete a task type
 *     description: Permanently delete a task type from the database (hard delete)
 *     tags: [TaskTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/taskTypeId'
 *     responses:
 *       200:
 *         description: Task type permanently deleted
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 message:
 *                   type: string
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/hard',
    authenticate,
    authorize([1]),
    hardDeleteTaskType
);

export default router;