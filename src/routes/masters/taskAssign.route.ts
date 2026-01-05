import express from 'express';
import {
    getAllTaskAssign,
    getTaskAssignById,
    createTaskAssign,
    updateTaskAssign,
    deleteTaskAssign,
    // getActiveTaskAssignments,
    // restoreTaskAssign
} from '../../controllers/masters/taskManagement/taskAssign.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: TaskAssign
 *   description: Project-Employee Assignment Management
 */

/**
 * @swagger
 * /api/masters/projectAssign:
 *   get:
 *     summary: Get all project-employee assignments
 *     description: Retrieve paginated list of assignments
 *     tags: [TaskAssign]
 *     parameters:
 *       - name: page
 *         in: query
 *         description: Page number
 *         required: false
 *         schema:
 *           type: integer
 *           default: 1
 *       - name: limit
 *         in: query
 *         description: Items per page
 *         required: false
 *         schema:
 *           type: integer
 *           default: 20
 *       - name: projectId
 *         in: query
 *         description: Filter by project ID
 *         required: false
 *         schema:
 *           type: integer
 *       - name: userId
 *         in: query
 *         description: Filter by user ID
 *         required: false
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Successfully retrieved assignments
 *       500:
 *         description: Internal server error
 */
router.get('/', getAllTaskAssign);


/**
 * @swagger
 * /api/masters/projectAssign/{id}:
 *   get:
 *     summary: Get all employees assigned to a project
 *     description: Retrieve all employees for a given project by Project_Id
 *     tags: [TaskAssign]
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *         description: Project ID
 *     responses:
 *       200:
 *         description: Successfully retrieved project with employees
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     Project_Id:
 *                       type: integer
 *                     Project_Name:
 *                       type: string
 *                     Employees:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           User_Id:
 *                             type: integer
 *                           Employee_Name:
 *                             type: string
 *       404:
 *         description: Project not found
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getTaskAssignById);


/**
 * @swagger
 * /api/masters/projectAssign:
 *   post:
 *     summary: Create a new assignment
 *     description: Assign an employee to a project
 *     tags: [TaskAssign]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - Project_Id
 *               - User_Id
 *             properties:
 *               Project_Id:
 *                 type: integer
 *               User_Id:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Assignment created successfully
 *       400:
 *         description: Validation error
 *       409:
 *         description: Employee already assigned to this project
 *       500:
 *         description: Internal server error
 */
router.post('/',
    authenticate,
    authorize([1, 2]),
    createTaskAssign
);

/**
 * @swagger
 * /api/masters/projectAssign/{id}:
 *   put:
 *     summary: Update an assignment
 *     description: Update an existing assignment
 *     tags: [TaskAssign]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               Project_Id:
 *                 type: integer
 *               User_Id:
 *                 type: integer
 *     responses:
 *       200:
 *         description: Assignment updated successfully
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
    authenticate,
    authorize([1, 2]),
    updateTaskAssign
);

/**
 * @swagger
 * /api/masters/projectAssign/{id}:
 *   delete:
 *     summary: Delete an assignment
 *     description: Delete a project-employee assignment
 *     tags: [TaskAssign]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - name: id
 *         in: path
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Assignment deleted successfully
 *       404:
 *         description: Assignment not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
    authenticate,
    authorize([1]),
    deleteTaskAssign
);


export default router;