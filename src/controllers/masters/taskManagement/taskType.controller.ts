import { Request, Response } from 'express';
import {
    created,
    updated,
    deleted,
    servError,
    notFound,
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

const validateWithZod = <T>(schema: any, data: any): {
    success: boolean;
    data?: T;
    errors?: Array<{ field: string; message: string }>
} => {
    try {
        const validatedData = schema.parse(data);
        return { success: true, data: validatedData };
    } catch (error: any) {
        if (error instanceof ZodError) {
            const zodIssues = error.issues || (error as any).errors || [];

            return {
                success: false,
                errors: zodIssues.map((err: any) => ({
                    field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'unknown'),
                    message: err.message || 'Validation error'
                }))
            };
        }
        return {
            success: false,
            errors: [{ field: 'unknown', message: 'Validation failed' }]
        };
    }
};

// Helper function to convert date strings to Date objects
const prepareTaskTypeData = (data: any) => {
    const preparedData = { ...data };

    // Convert date strings to Date objects
    if (preparedData.Est_StartTime && typeof preparedData.Est_StartTime === 'string') {
        preparedData.Est_StartTime = new Date(preparedData.Est_StartTime);
    }

    if (preparedData.Est_EndTime && typeof preparedData.Est_EndTime === 'string') {
        preparedData.Est_EndTime = new Date(preparedData.Est_EndTime);
    }

    return preparedData;
};

export const getAllTaskTypes = async (req: Request, res: Response) => {
    try {
        const sortBy = req.query.sortBy as string || 'Task_Type_Id';
        const sortOrder = req.query.sortOrder as string || 'ASC';

        const queryData = {
            ...req.query,
            sortBy,
            sortOrder
        };

        const validation = validateWithZod<any>(taskTypeQuerySchema, queryData);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.errors
            });
        }

        const queryParams = validation.data!;

        const where: any = {};

        if (queryParams.ttDelFlag !== 'all') {
            where.TT_Del_Flag = queryParams.ttDelFlag === '1' ? 1 : 0;
        }

        if (queryParams.status !== 'all') {
            where.Status = queryParams.status === '1' ? 1 : 0;
        }

        if (queryParams.search) {
            where.Task_Type = {
                [Op.like]: `%${queryParams.search}%`
            };
        }

        if (queryParams.projectId) {
            where.Project_Id = queryParams.projectId;
        }

        if (queryParams.isReptative) {
            where.Is_Reptative = queryParams.isReptative === '1' ? 1 : 0;
        }

        const orderField = queryParams.sortBy || 'Task_Type_Id';
        const orderDirection = queryParams.sortOrder || 'ASC';

        const { rows, count } = await TaskType_Master.findAndCountAll({
            where,
            limit: queryParams.limit,
            offset: (queryParams.page - 1) * queryParams.limit,
            order: [[orderField, orderDirection]]
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
        // Normalize request body
        const normalizedBody = {
            ...req.body,
            Task_Type: req.body.Task_Type?.trim()
        };

        // Duplicate check
        if (normalizedBody.Task_Type) {
            const existing = await TaskType_Master.findOne({
                where: {
                    Task_Type: normalizedBody.Task_Type,
                    TT_Del_Flag: 0
                }
            });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Task Type with this name already exists',
                    field: 'Task_Type'
                });
            }
        }

        // Prepare data (DO NOT SET Task_Type_Id)
        const preparedData = {
            ...normalizedBody,
            TT_Del_Flag: 0,
            Status: 1,
            Est_StartTime: normalizedBody.Est_StartTime
                ? new Date(normalizedBody.Est_StartTime)
                : null,
            Est_EndTime: normalizedBody.Est_EndTime
                ? new Date(normalizedBody.Est_EndTime)
                : null
        };

        // Validate
        const validation = validateWithZod<TaskTypeCreateInput>(
            taskTypeCreateSchema,
            preparedData
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Create record (ID auto-generated by SQL Server)
        const taskType = await TaskType_Master.create(validation.data);

        return created(res, taskType, 'Task Type created successfully');

    } catch (error) {
        console.error('Error creating task type:', error);
        return servError(error, res);
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
                return res.status(409).json({
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

        // Prepare data by converting dates
        const updateData = prepareTaskTypeData(validatedBody);

        await taskType.update(updateData);

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
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID parameter is required',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType_Master.findByPk(id);

        if (!taskType) {
            return notFound(res, 'Task Type not found');
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

// Add hardDeleteTaskType controller
export const hardDeleteTaskType = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(taskTypeIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID parameter is required',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const taskType = await TaskType_Master.findByPk(id);

        if (!taskType) {
            return notFound(res, 'Task Type not found');
        }

        // Permanently delete
        await taskType.destroy();

        res.status(200).json({
            success: true,
            message: 'Task Type permanently deleted'
        });

    } catch (error) {
        console.error('Error hard deleting task type:', error);
        servError(error as Error, res);
    }
};