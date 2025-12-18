import e, { Request, Response } from 'express';
import {
    created,
    updated,
    deleted,
    servError,
    notFound,
    invalidInput,
    sentData
} from '../../../responseObject';
import {
    TaskType_Master,
    taskTypeCreateSchema,
    taskTypeUpdateSchema,
    taskTypeQuerySchema,
    taskTypeIdSchema,
    TaskTypeCreateInput,
    TaskTypeUpdateInput,
    TaskTypeQueryParams
} from '../../../models/masters/taskType/type.model';
import { ZodError } from 'zod';
import { Op } from 'sequelize';

// Enhanced validation middleware function
const validateWithZod = <T>(schema: any, data: any): { success: boolean; data?: T; errors?: any[] } => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error) {
        servError(e, res);
        return {
            success: false,
            errors: [{ field: 'unknown', message: 'Validation failed' }]
        };
    }
};

export const getAllTaskTypes = async (req: Request, res: Response) => {
    try {
        // Validate query parameters
        const validation = validateWithZod<TaskTypeQueryParams>(taskTypeQuerySchema, req.query);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.errors
            });
        }

        const queryParams = validation.data!;

        // Build where clause
        const where: any = {};

        // Filter by TT_Del_Flag
        if (queryParams.ttDelFlag !== 'all') {
            where.TT_Del_Flag = queryParams.ttDelFlag === '1' ? 1 : 0;
        }

        // Filter by Status
        if (queryParams.status !== 'all') {
            where.Status = queryParams.status === '1' ? 1 : 0;
        }

        // Search by Task_Type
        if (queryParams.search) {
            where.Task_Type = {
                [Op.like]: `%${queryParams.search}%`
            };
        }

        // Filter by Project_Id
        if (queryParams.projectId) {
            where.Project_Id = queryParams.projectId;
        }

        // Filter by Is_Reptative
        if (queryParams.isReptative) {
            where.Is_Reptative = queryParams.isReptative === '1' ? 1 : 0;
        }

        const { rows, count } = await TaskType_Master.findAndCountAll({
            where,
            limit: queryParams.limit,
            offset: (queryParams.page - 1) * queryParams.limit,
            order: [[queryParams.sortBy, queryParams.sortOrder]]
        });

        const totalPages = Math.ceil(count / queryParams.limit);

        return sentData(res, rows, {
            totalRecords: count,
            currentPage: queryParams.page,
            totalPages,
            pageSize: queryParams.limit,
            hasNextPage: queryParams.page < totalPages,
            hasPreviousPage: queryParams.page > 1
        });

    } catch (err) {
        console.error('Error fetching task types:', err);
        servError(err, res);
    }
};

export const getTaskTypeById = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType_Master.findByPk(id);

        if (!taskType) {
            return notFound(res, 'Task Type not found');
        }

        // Check if deleted
        if (taskType.TT_Del_Flag === 1) {
            return notFound(res, 'Task Type has been deleted');
        }

        sentData(res, taskType as any);

    } catch (e) {
        console.error('Error fetching task type by ID:', e);
        servError(e, res);
    }
};

export const createTaskType = async (req: Request, res: Response) => {
    try {
        // Check if Task Type already exists
        if (req.body.Task_Type) {
            const existingTaskType = await TaskType_Master.findOne({
                where: {
                    Task_Type: req.body.Task_Type.trim(),
                    TT_Del_Flag: 0
                }
            });

            if (existingTaskType) {
                return res.status(400).json({
                    success: false,
                    message: 'Task Type with this name already exists',
                    field: 'Task_Type'
                });
            }
        }

        // Validate request body
        const validation = validateWithZod<TaskTypeCreateInput>(taskTypeCreateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const validatedBody = validation.data!;

        // Prepare data with defaults
        const taskTypeData = {
            ...validatedBody,
            TT_Del_Flag: 0,
            Status: 1
        };

        const newTaskType = await TaskType_Master.create(taskTypeData);

        created(res, newTaskType, 'Task Type created successfully');

    } catch (e) {
        console.error('Error creating task type:', e);
        servError(e, res);
    }
};

export const updateTaskType = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(taskTypeIdSchema, req.params);
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Check if task type exists and is not deleted
        const taskType = await TaskType_Master.findOne({
            where: {
                Task_Type_Id: id,
                TT_Del_Flag: 0
            }
        });

        if (!taskType) {
            return notFound(res, 'Task Type not found or has been deleted');
        }

        // If updating Task_Type name, check for duplicates
        if (req.body.Task_Type && req.body.Task_Type !== taskType.Task_Type) {
            const duplicateTaskType = await TaskType_Master.findOne({
                where: {
                    Task_Type: req.body.Task_Type.trim(),
                    TT_Del_Flag: 0,
                    Task_Type_Id: { [Op.ne]: id }
                }
            });

            if (duplicateTaskType) {
                return res.status(400).json({
                    success: false,
                    message: 'Another Task Type with this name already exists',
                    field: 'Task_Type'
                });
            }
        }

        // Validate request body
        const validation = validateWithZod<TaskTypeUpdateInput>(taskTypeUpdateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const validatedBody = validation.data!;

        await taskType.update(validatedBody);

        updated(res, taskType, 'Task Type updated successfully');

    } catch (e) {
        console.error('Error updating task type:', e);
        servError(e, res);
    }
};

export const deleteTaskType = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType_Master.findByPk(id);

        if (!taskType) {
            return notFound(res, 'Task Type not found');
        }

        // Soft delete by setting TT_Del_Flag to 1
        await taskType.update({
            TT_Del_Flag: 1,
            Status: 0
        });

        deleted(res, 'Task Type deleted successfully');

    } catch (e) {
        console.error('Error deleting task type:', e);
        servError(e, res);
    }
};

export const getActiveTaskTypes = async (req: Request, res: Response) => {
    try {
        const { projectId } = req.query;

        const whereClause: any = {
            TT_Del_Flag: 0,
            Status: 1
        };

        if (projectId && !isNaN(Number(projectId))) {
            whereClause.Project_Id = Number(projectId);
        }

        const taskTypes = await TaskType_Master.findAll({
            where: whereClause,
            order: [['Task_Type', 'ASC']]
        });

        sentData(res, taskTypes);

    } catch (e) {
        console.error('Error fetching active task types:', e);
        servError(e, res);
    }
};

// Additional controller for restore functionality
export const restoreTaskType = async (req: Request, res: Response) => {
    try {
        const { id } = req.params;

        if (!id || isNaN(Number(id))) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID parameter is required'
            });
        }

        const taskType = await TaskType_Master.findByPk(parseInt(id));

        if (!taskType) {
            return res.status(404).json({
                success: false,
                message: 'Task Type not found'
            });
        }

        await taskType.update({
            TT_Del_Flag: 0,
            Status: 1
        });

        res.status(200).json({
            success: true,
            message: 'Task Type restored successfully',
            data: taskType
        });

    } catch (error) {
        console.error('Error restoring task type:', error);
        servError(error as Error, res);
    }
};