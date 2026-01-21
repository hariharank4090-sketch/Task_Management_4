// routes/masters/taskManagement/paramMaster.route.ts
import express from 'express';
import {
    getAllParamMasters,
    getParamMasterById,
    createParamMaster,
    updateParamMaster,
    deleteParamMaster,
    getAllActiveParamMasters
} from '../../controllers/masters/taskManagement/paramMaster.controller';
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ParamMaster
 *   description: Parameter Master management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ParamMaster:
 *       type: object
 *       required:
 *         - Paramet_Name
 *       properties:
 *         Paramet_Id:
 *           type: integer
 *           readOnly: true
 *         Paramet_Name:
 *           type: string
 *           maxLength: 250
 *         Paramet_Data_Type:
 *           type: integer
 *           nullable: true
 *         Company_id:
 *           type: integer
 *           nullable: true
 *         Del_Flag:
 *           type: integer
 *           nullable: true
 *           default: 0
 * 
 *     ParamMasterCreate:
 *       type: object
 *       required:
 *         - Paramet_Name
 *       properties:
 *         Paramet_Name:
 *           type: string
 *           maxLength: 250
 *         Paramet_Data_Type:
 *           type: integer
 *           nullable: true
 *         Company_id:
 *           type: integer
 *           nullable: true
 * 
 *     ParamMasterUpdate:
 *       type: object
 *       properties:
 *         Paramet_Name:
 *           type: string
 *           maxLength: 250
 *           nullable: true
 *         Paramet_Data_Type:
 *           type: integer
 *           nullable: true
 *         Company_id:
 *           type: integer
 *           nullable: true
 *         Del_Flag:
 *           type: integer
 *           nullable: true
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
 *                 example: "Paramet_Name"
 *               message:
 *                 type: string
 *                 example: "Paramet_Name is required"
 * 
 *   parameters:
 *     paramMasterId:
 *       name: id
 *       in: path
 *       description: Parameter Master ID
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
 *       description: Search by parameter name
 *       required: false
 *       schema:
 *         type: string
 * 
 *     companyIdFilter:
 *       name: companyId
 *       in: query
 *       description: Filter by company ID
 *       required: false
 *       schema:
 *         type: integer
 * 
 *     sortByParam:
 *       name: sortBy
 *       in: query
 *       description: Sort field
 *       required: false
 *       schema:
 *         type: string
 *         enum: ["Paramet_Id", "Paramet_Name", "Paramet_Data_Type", "Company_id"]
 *         default: "Paramet_Id"
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

/**
 * @swagger
 * /api/masters/paramMaster:
 *   get:
 *     summary: Get all parameter masters with pagination and filtering
 *     description: Retrieve a paginated list of parameter masters with optional filtering and search
 *     tags: [ParamMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/paginationPage'
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/searchQuery'
 *       - $ref: '#/components/parameters/companyIdFilter'
 *       - $ref: '#/components/parameters/sortByParam'
 *       - $ref: '#/components/parameters/sortOrderParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved parameter masters
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
 *                     $ref: '#/components/schemas/ParamMaster'
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
router.get('/', getAllParamMasters);

/**
 * @swagger
 * /api/masters/paramMaster/active:
 *   get:
 *     summary: Get all active parameter masters
 *     description: Retrieve all active parameter masters (where Del_Flag = 0)
 *     tags: [ParamMaster]
 *     responses:
 *       200:
 *         description: Successfully retrieved active parameter masters
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
 *                     $ref: '#/components/schemas/ParamMaster'
 *       500:
 *         description: Internal server error
 */
router.get('/active', getAllActiveParamMasters);

/**
 * @swagger
 * /api/masters/paramMaster/{id}:
 *   get:
 *     summary: Get parameter master by ID
 *     description: Retrieve a specific parameter master by its ID
 *     tags: [ParamMaster]
 *     parameters:
 *       - $ref: '#/components/parameters/paramMasterId'
 *     responses:
 *       200:
 *         description: Successfully retrieved parameter master
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
 *                   $ref: '#/components/schemas/ParamMaster'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Parameter master not found
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
 *                   example: "Parameter master not found"
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getParamMasterById);

/**
 * @swagger
 * /api/masters/paramMaster:
 *   post:
 *     summary: Create a new parameter master
 *     description: Create a new parameter master record
 *     tags: [ParamMaster]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParamMasterCreate'
 *     responses:
 *       201:
 *         description: Parameter master created successfully
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
 *                   $ref: '#/components/schemas/ParamMaster'
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
 *         description: Conflict - Parameter name already exists
 *       500:
 *         description: Internal server error
 */
router.post('/',
    authenticate,
    authorize([1, 2]),
    createParamMaster
);

/**
 * @swagger
 * /api/masters/paramMaster/{id}:
 *   put:
 *     summary: Update a parameter master
 *     description: Update an existing parameter master by ID
 *     tags: [ParamMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/paramMasterId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParamMasterUpdate'
 *     responses:
 *       200:
 *         description: Parameter master updated successfully
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
 *                   $ref: '#/components/schemas/ParamMaster'
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
 *         description: Parameter master not found
 *       409:
 *         description: Conflict - Parameter name already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
    authenticate,
    authorize([1, 2]), 
    updateParamMaster
);

/**
 * @swagger
 * /api/masters/paramMaster/{id}:
 *   delete:
 *     summary: Delete a parameter master (soft delete)
 *     description: Soft delete a parameter master by setting Del_Flag to 1
 *     tags: [ParamMaster]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/paramMasterId'
 *     responses:
 *       200:
 *         description: Parameter master deleted successfully
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
 *         description: Parameter master not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
    authenticate,
    authorize([1]), 
    deleteParamMaster
);

export default router;