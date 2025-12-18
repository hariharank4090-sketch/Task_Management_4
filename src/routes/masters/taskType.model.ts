// import express from 'express';
// import {
//     getAllTaskTypes,
//     getTaskTypeById,
//     createTaskType,
//     updateTaskType,
//     deleteTaskType,
//     getActiveTaskTypes
// } from '../../controllers/masters/taskManagement/taskType.controller';
// import { validateRequest } from '../../middleware/zodValidator';
// import { taskTypeCreateSchema, taskTypeUpdateSchema } from '../../models/masters/taskType/type.model';
// import { authenticate, authorize } from '../configuration/login.route';
// import { paginationMiddleware } from '../middleware/pagination';
// import { TaskType_Master } from '../../../models/masters/taskType/type.model';






import express from 'express';
import {
    getAllTaskTypes,
    getTaskTypeById,
    createTaskType,
    updateTaskType,
    deleteTaskType,
    getActiveTaskTypes
} from '../controllers/type.controller';
import { authenticate, authorize } from '../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Task Types
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
 *           maxLength: 250
 *           example: "MONTHLY REPORT"
 *         Is_Reptative:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *           description: "0 = Not Repetitive, 1 = Repetitive"
 *           example: 1
 *         Hours_Duration:
 *           type: integer
 *           nullable: true
 *           minimum: 0
 *           example: 8
 *         Day_Duration:
 *           type: integer
 *           nullable: true
 *           minimum: 0
 *           example: 1
 *         TT_Del_Flag:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *           readOnly: true
 *           description: "0 = Not Deleted, 1 = Deleted (Soft Delete)"
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           example: 5
 *         Est_StartTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T09:00:00Z"
 *         Est_EndTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T17:00:00Z"
 *         Status:
 *           type: integer
 *           enum: [0, 1]
 *           default: 1
 *           description: "0 = Inactive, 1 = Active"
 *           example: 1
 *         Created_At:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *           example: "2024-01-01T12:00:00Z"
 *         Updated_At:
 *           type: string
 *           format: date-time
 *           readOnly: true
 *           example: "2024-01-01T12:00:00Z"
 * 
 *     TaskTypeCreate:
 *       type: object
 *       required:
 *         - Task_Type
 *       properties:
 *         Task_Type:
 *           type: string
 *           maxLength: 250
 *           example: "MONTHLY REPORT"
 *         Is_Reptative:
 *           type: integer
 *           enum: [0, 1]
 *           default: 0
 *           example: 1
 *         Hours_Duration:
 *           type: integer
 *           nullable: true
 *           minimum: 0
 *           example: 8
 *         Day_Duration:
 *           type: integer
 *           nullable: true
 *           minimum: 0
 *           example: 1
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           example: 5
 *         Est_StartTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T09:00:00Z"
 *         Est_EndTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-01-15T17:00:00Z"
 * 
 *     TaskTypeUpdate:
 *       type: object
 *       properties:
 *         Task_Type:
 *           type: string
 *           maxLength: 250
 *           example: "UPDATED TASK NAME"
 *         Is_Reptative:
 *           type: integer
 *           enum: [0, 1]
 *           example: 0
 *         Hours_Duration:
 *           type: integer
 *           nullable: true
 *           minimum: 0
 *           example: 10
 *         Day_Duration:
 *           type: integer
 *           nullable: true
 *           minimum: 0
 *           example: 2
 *         Project_Id:
 *           type: integer
 *           nullable: true
 *           minimum: 1
 *           example: 6
 *         Est_StartTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-02-01T09:00:00Z"
 *         Est_EndTime:
 *           type: string
 *           format: date-time
 *           nullable: true
 *           example: "2024-02-01T18:00:00Z"
 *         Status:
 *           type: integer
 *           enum: [0, 1]
 *           example: 1
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
 *                 example: "Task Type is required"
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
 *       example: "monthly"
 * 
 *     projectIdFilter:
 *       name: projectId
 *       in: query
 *       description: Filter by project ID
 *       required: false
 *       schema:
 *         type: integer
 *         minimum: 1
 *       example: 5
 * 
 *     statusFilter:
 *       name: status
 *       in: query
 *       description: Filter by status
 *       required: false
 *       schema:
 *         type: string
 *         enum: ["0", "1", "all"]
 *         default: "1"
 *       example: "1"
 * 
 *     delFlagFilter:
 *       name: ttDelFlag
 *       in: query
 *       description: Filter by deletion flag
 *       required: false
 *       schema:
 *         type: string
 *         enum: ["0", "1", "all"]
 *         default: "0"
 *       example: "0"
 * 
 *   securitySchemes:
 *     bearerAuth:
 *       type: http
 *       scheme: bearer
 *       bearerFormat: JWT
 */

/**
 * @swagger
 * /api/tasktypes:
 *   get:
 *     summary: Get all task types with pagination and filtering
 *     description: Retrieve a paginated list of task types with optional filtering and search
 *     tags: [Task Types]
 *     parameters:
 *       - $ref: '#/components/parameters/paginationPage'
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/searchQuery'
 *       - $ref: '#/components/parameters/projectIdFilter'
 *       - $ref: '#/components/parameters/statusFilter'
 *       - $ref: '#/components/parameters/delFlagFilter'
 *       - name: isReptative
 *         in: query
 *         description: Filter by repetitive flag
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["0", "1"]
 *         example: "1"
 *       - name: sortBy
 *         in: query
 *         description: Sort field
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["Task_Type_Id", "Task_Type", "Created_At", "Updated_At", "Project_Id"]
 *           default: "Task_Type_Id"
 *         example: "Task_Type"
 *       - name: sortOrder
 *         in: query
 *         description: Sort order
 *         required: false
 *         schema:
 *           type: string
 *           enum: ["ASC", "DESC"]
 *           default: "ASC"
 *         example: "ASC"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task types retrieved successfully"
 *                 data:
 *                   type: array
 *                   items:
 *                     $ref: '#/components/schemas/TaskType'
 *                 pagination:
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
 * /api/tasktypes/active:
 *   get:
 *     summary: Get all active task types
 *     description: Retrieve all task types that are active (Status=1) and not deleted (TT_Del_Flag=0)
 *     tags: [Task Types]
 *     parameters:
 *       - $ref: '#/components/parameters/projectIdFilter'
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Active task types retrieved successfully"
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
 * /api/tasktypes/{id}:
 *   get:
 *     summary: Get task type by ID
 *     description: Retrieve a specific task type by its ID
 *     tags: [Task Types]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task type retrieved successfully"
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
 *                   example: "Task Type not found"
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getTaskTypeById);

/**
 * @swagger
 * /api/tasktypes:
 *   post:
 *     summary: Create a new task type
 *     description: Create a new task type record
 *     tags: [Task Types]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/TaskTypeCreate'
 *           examples:
 *             basic:
 *               summary: Basic task type
 *               value:
 *                 Task_Type: "MONTHLY REPORT"
 *                 Is_Reptative: 1
 *                 Project_Id: 5
 *             detailed:
 *               summary: Detailed task type
 *               value:
 *                 Task_Type: "QUARTERLY AUDIT"
 *                 Is_Reptative: 1
 *                 Hours_Duration: 24
 *                 Day_Duration: 3
 *                 Project_Id: 8
 *                 Est_StartTime: "2024-03-01T09:00:00Z"
 *                 Est_EndTime: "2024-03-01T17:00:00Z"
 *             minimal:
 *               summary: Minimal task type
 *               value:
 *                 Task_Type: "ONE TIME TASK"
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task Type created successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Validation error or duplicate task type
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       401:
 *         description: Unauthorized - No token provided
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
 *                   example: "No token provided"
 *       403:
 *         description: Forbidden - Insufficient permissions
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
 *                   example: "Insufficient permissions"
 *       409:
 *         description: Conflict - Task type already exists
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
 *                   example: "Task Type with this name already exists"
 *       500:
 *         description: Internal server error
 */
router.post('/',
    authenticate,
    authorize(['admin', 'manager']),
    createTaskType
);

/**
 * @swagger
 * /api/tasktypes/{id}:
 *   put:
 *     summary: Update a task type
 *     description: Update an existing task type by ID
 *     tags: [Task Types]
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
 *           examples:
 *             updateName:
 *               summary: Update task type name
 *               value:
 *                 Task_Type: "UPDATED TASK NAME"
 *             updateStatus:
 *               summary: Update task type status
 *               value:
 *                 Status: 0
 *             comprehensive:
 *               summary: Comprehensive update
 *               value:
 *                 Task_Type: "UPDATED TASK NAME"
 *                 Is_Reptative: 0
 *                 Hours_Duration: 16
 *                 Project_Id: 7
 *                 Status: 1
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task Type updated successfully"
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
 *                   example: "Task Type not found"
 *       409:
 *         description: Conflict - Task type name already exists
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
 *                   example: "Another Task Type with this name already exists"
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
    authenticate,
    authorize(['admin', 'manager']),
    updateTaskType
);

/**
 * @swagger
 * /api/tasktypes/{id}:
 *   delete:
 *     summary: Delete a task type (soft delete)
 *     description: Soft delete a task type by setting TT_Del_Flag to 1 and Status to 0
 *     tags: [Task Types]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task Type deleted successfully"
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
    authorize(['admin']),
    deleteTaskType
);

/**
 * @swagger
 * /api/tasktypes/{id}/restore:
 *   patch:
 *     summary: Restore a deleted task type
 *     description: Restore a soft-deleted task type by setting TT_Del_Flag to 0 and Status to 1
 *     tags: [Task Types]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task Type restored successfully"
 *                 data:
 *                   $ref: '#/components/schemas/TaskType'
 *       400:
 *         description: Invalid ID parameter
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
    authorize(['admin']),
    async (req: express.Request, res: express.Response) => {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid ID parameter is required'
                });
            }

            // Import TaskType_Master here or move to controller
            const { TaskType_Master } = require('../../../models/masters/taskType/type.model');
            const taskType = await TaskType_Master.findByPk(parseInt(id));

            if (!taskType) {
                return res.status(404).json({
                    success: false,
                    message: 'Task Type not found'
                });
            }

            await taskType.update({
                TT_Del_Flag: 0,
                Status: 1,
                Updated_At: new Date()
            });

            res.status(200).json({
                success: true,
                message: 'Task Type restored successfully',
                data: taskType
            });

        } catch (error) {
            console.error('Error restoring task type:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

/**
 * @swagger
 * /api/tasktypes/{id}/hard-delete:
 *   delete:
 *     summary: Permanently delete a task type
 *     description: Permanently delete a task type from the database (use with caution)
 *     tags: [Task Types]
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
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Task Type permanently deleted"
 *       400:
 *         description: Invalid ID parameter
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden - Insufficient permissions
 *       404:
 *         description: Task type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id/hard-delete',
    authenticate,
    authorize(['admin']),
    async (req: express.Request, res: express.Response) => {
        try {
            const { id } = req.params;

            if (!id || isNaN(Number(id))) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid ID parameter is required'
                });
            }

            // Import TaskType_Master here or move to controller
            const { TaskType_Master } = require('../../../models/masters/taskType/type.model');
            const taskType = await TaskType_Master.findByPk(parseInt(id));

            if (!taskType) {
                return res.status(404).json({
                    success: false,
                    message: 'Task Type not found'
                });
            }

            await taskType.destroy();

            res.status(200).json({
                success: true,
                message: 'Task Type permanently deleted'
            });

        } catch (error) {
            console.error('Error hard deleting task type:', error);
            res.status(500).json({
                success: false,
                message: 'Internal server error'
            });
        }
    }
);

export default router;