import express from 'express';
import {
    getAllParametDataTypes,
    getParametDataTypeById,
    createParametDataType,
    updateParametDataType,
    deleteParametDataType,
    getAllActiveParametDataTypes
} from '../../controllers/masters/taskManagement/taskParamType.controller'; // Update controller path
import { authenticate, authorize } from '../../middleware/auth';

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: ParameterDataTypes
 *   description: Parameter Data Type management endpoints
 */

/**
 * @swagger
 * components:
 *   schemas:
 *     ParametDataType:
 *       type: object
 *       required:
 *         - Para_Data_Type
 *       properties:
 *         Para_Data_Type_Id:
 *           type: integer
 *           readOnly: true
 *         Para_Data_Type:
 *           type: string
 *           maxLength: 250
 *         Para_Display_Name:
 *           type: string
 *           nullable: true
 * 
 *     ParametDataTypeCreate:
 *       type: object
 *       required:
 *         - Para_Data_Type
 *       properties:
 *         Para_Data_Type:
 *           type: string
 *           maxLength: 250
 *         Para_Display_Name:
 *           type: string
 *           nullable: true
 * 
 *     ParametDataTypeUpdate:
 *       type: object
 *       properties:
 *         Para_Data_Type:
 *           type: string
 *           maxLength: 250
 *           nullable: true
 *         Para_Display_Name:
 *           type: string
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
 *                 example: "Para_Data_Type"
 *               message:
 *                 type: string
 *                 example: "Para_Data_Type is required"
 * 
 *   parameters:
 *     parametDataTypeId:
 *       name: id
 *       in: path
 *       description: Parameter Data Type ID
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
 *       description: Search by data type or display name
 *       required: false
 *       schema:
 *         type: string
 * 
 *     sortByParam:
 *       name: sortBy
 *       in: query
 *       description: Sort field
 *       required: false
 *       schema:
 *         type: string
 *         enum: ["Para_Data_Type_Id", "Para_Data_Type", "Para_Display_Name"]
 *         default: "Para_Data_Type_Id"
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
 * /api/masters/parametDataTypes:
 *   get:
 *     summary: Get all parameter data types with pagination and filtering
 *     description: Retrieve a paginated list of parameter data types with optional filtering and search
 *     tags: [ParameterDataTypes]
 *     parameters:
 *       - $ref: '#/components/parameters/paginationPage'
 *       - $ref: '#/components/parameters/paginationLimit'
 *       - $ref: '#/components/parameters/searchQuery'
 *       - name: Para_Data_Type
 *         in: query
 *         description: Filter by data type
 *         required: false
 *         schema:
 *           type: string
 *       - $ref: '#/components/parameters/sortByParam'
 *       - $ref: '#/components/parameters/sortOrderParam'
 *     responses:
 *       200:
 *         description: Successfully retrieved parameter data types
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
 *                     $ref: '#/components/schemas/ParametDataType'
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
router.get('/', getAllParametDataTypes);

/**
 * @swagger
 * /api/masters/parametDataTypes/active:
 *   get:
 *     summary: Get all parameter data types
 *     description: Retrieve all parameter data types
 *     tags: [ParameterDataTypes]
 *     responses:
 *       200:
 *         description: Successfully retrieved parameter data types
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
 *                     $ref: '#/components/schemas/ParametDataType'
 *       500:
 *         description: Internal server error
 */
router.get('/active', getAllActiveParametDataTypes);

/**
 * @swagger
 * /api/masters/parametDataTypes/{id}:
 *   get:
 *     summary: Get parameter data type by ID
 *     description: Retrieve a specific parameter data type by its ID
 *     tags: [ParameterDataTypes]
 *     parameters:
 *       - $ref: '#/components/parameters/parametDataTypeId'
 *     responses:
 *       200:
 *         description: Successfully retrieved parameter data type
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
 *                   $ref: '#/components/schemas/ParametDataType'
 *       400:
 *         description: Invalid ID parameter
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Error'
 *       404:
 *         description: Parameter data type not found
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
 *                   example: "Parameter data type not found"
 *       500:
 *         description: Internal server error
 */
router.get('/:id', getParametDataTypeById);

/**
 * @swagger
 * /api/masters/parametDataTypes:
 *   post:
 *     summary: Create a new parameter data type
 *     description: Create a new parameter data type record
 *     tags: [ParameterDataTypes]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParametDataTypeCreate'
 *     responses:
 *       201:
 *         description: Parameter data type created successfully
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
 *                   $ref: '#/components/schemas/ParametDataType'
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
 *         description: Conflict - Parameter data type already exists
 *       500:
 *         description: Internal server error
 */
router.post('/',
    authenticate,
    authorize([1, 2]),
    createParametDataType
);

/**
 * @swagger
 * /api/masters/parametDataTypes/{id}:
 *   put:
 *     summary: Update a parameter data type
 *     description: Update an existing parameter data type by ID
 *     tags: [ParameterDataTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/parametDataTypeId'
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/ParametDataTypeUpdate'
 *     responses:
 *       200:
 *         description: Parameter data type updated successfully
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
 *                   $ref: '#/components/schemas/ParametDataType'
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
 *         description: Parameter data type not found
 *       409:
 *         description: Conflict - Parameter data type already exists
 *       500:
 *         description: Internal server error
 */
router.put('/:id',
    authenticate,
    authorize([1, 2]), 
    updateParametDataType
);

/**
 * @swagger
 * /api/masters/parametDataTypes/{id}:
 *   delete:
 *     summary: Delete a parameter data type
 *     description: Delete a parameter data type by ID
 *     tags: [ParameterDataTypes]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - $ref: '#/components/parameters/parametDataTypeId'
 *     responses:
 *       200:
 *         description: Parameter data type deleted successfully
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
 *         description: Parameter data type not found
 *       500:
 *         description: Internal server error
 */
router.delete('/:id',
    authenticate,
    authorize([1]), 
    deleteParametDataType
);

export default router;