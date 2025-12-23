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
    Project_Master,
    projectMasterCreationSchema,
    projectMasterUpdateSchema,
    projectMasterQuerySchema,
    projectIdSchema,
    ProjectMasterCreate,
    ProjectMasterUpdate,
    ProjectMasterQuery,
    projectMasterAccKey
} from '../../../models/masters/project/type.model'

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
const prepareProjectData = (data: any) => {
    const preparedData = { ...data };

    // Convert date strings to Date objects
    if (preparedData.Est_Start_Dt && typeof preparedData.Est_Start_Dt === 'string') {
        preparedData.Est_Start_Dt = new Date(preparedData.Est_Start_Dt);
    }

    if (preparedData.Est_End_Dt && typeof preparedData.Est_End_Dt === 'string') {
        preparedData.Est_End_Dt = new Date(preparedData.Est_End_Dt);
    }

    if (preparedData.Entry_Date && typeof preparedData.Entry_Date === 'string') {
        preparedData.Entry_Date = new Date(preparedData.Entry_Date);
    }

    if (preparedData.Updated_Date && typeof preparedData.Updated_Date === 'string') {
        preparedData.Updated_Date = new Date(preparedData.Updated_Date);
    }

    return preparedData;
};

export const getAllProjects = async (req: Request, res: Response) => {
    try {
        const sortBy = req.query.sortBy as string || 'Project_Id';
        const sortOrder = req.query.sortOrder as string || 'ASC';

        const queryData = {
            ...req.query,
            sortBy,
            sortOrder
        };

        const validation = validateWithZod<any>(projectMasterQuerySchema, queryData);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.errors
            });
        }

        const queryParams = validation.data!;

        const where: any = {};

        if (queryParams.isActive !== 'all') {
            where.IsActive = queryParams.isActive === '1' ? 1 : 0;
        }

        if (queryParams.search) {
            where.Project_Name = {
                [Op.like]: `%${queryParams.search}%`
            };
        }

        if (queryParams.companyId) {
            where.Company_Id = queryParams.companyId;
        }

        if (queryParams.projectHead) {
            where.Project_Head = queryParams.projectHead;
        }

        if (queryParams.projectStatus !== 'all') {
            where.Project_Status = queryParams.projectStatus === '1' ? 1 : 0;
        }

        const orderField = queryParams.sortBy || 'Project_Id';
        const orderDirection = queryParams.sortOrder || 'ASC';

        const { rows, count } = await Project_Master.findAndCountAll({
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
        console.error('Error fetching projects:', err);
        servError(err, res);
    }
};

export const getProjectById = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project_Master.findByPk(id);

        if (!project) {
            return notFound(res, 'Project not found');
        }

        // Check if active
        if (project.IsActive === 0) {
            return notFound(res, 'Project is inactive');
        }

        sentData(res, project as any);

    } catch (e) {
        console.error('Error fetching project by ID:', e);
        servError(e, res);
    }
};

export const createProject = async (req: Request, res: Response) => {
    try {
        const normalizedBody = {
            ...req.body,
            Project_Name: req.body.Project_Name?.trim(),
            Project_Desc: req.body.Project_Desc?.trim()
        };

        // Check if project with same name exists (case-insensitive)
        if (normalizedBody.Project_Name) {
            const existing = await Project_Master.findOne({
                where: {
                    Project_Name: {
                        [Op.iLike]: normalizedBody.Project_Name
                    },
                    IsActive: 1
                }
            });

            if (existing) {
                return res.status(409).json({
                    success: false,
                    message: 'Project with this name already exists',
                    field: 'Project_Name'
                });
            }
        }

        // Get the maximum Project_Id and add 1 for the new record
        const maxIdResult = await Project_Master.findOne({
            attributes: [
                [Project_Master.sequelize!.fn('MAX', Project_Master.sequelize!.col('Project_Id')), 'maxId']
            ],
            raw: true
        });

        const nextId = (maxIdResult && (maxIdResult as any).maxId ? (maxIdResult as any).maxId : 0) + 1;

        const preparedData = {
            ...normalizedBody,
            Project_Id: nextId, // Manually set the ID
            IsActive: 1,
            Project_Status: normalizedBody.Project_Status || 1,
            Est_Start_Dt: normalizedBody.Est_Start_Dt
                ? new Date(normalizedBody.Est_Start_Dt)
                : null,
            Est_End_Dt: normalizedBody.Est_End_Dt
                ? new Date(normalizedBody.Est_End_Dt)
                : null,
            Entry_Date: new Date(),
            Entry_By: (req as any).user?.userId || null // Assuming user info is in req.user
        };

        const validation = validateWithZod<ProjectMasterCreate>(
            projectMasterCreationSchema,
            preparedData
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        // Create with manual ID
        const project = await Project_Master.create(validation.data as any);

        return created(res, project, 'Project created successfully');

    } catch (error) {
        console.error('Error creating project:', error);
        return servError(error, res);
    }
};

export const updateProject = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const idValidation = validateWithZod<{ id: number }>(projectIdSchema, req.params);
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Check if project exists and is active
        const project = await Project_Master.findOne({
            where: {
                Project_Id: id,
                IsActive: 1
            }
        });

        if (!project) {
            return notFound(res, 'Project not found or is inactive');
        }

        // If updating Project_Name, check for duplicates
        if (req.body.Project_Name && req.body.Project_Name.trim() !== project.Project_Name) {
            const duplicateProject = await Project_Master.findOne({
                where: {
                    Project_Name: {
                        [Op.iLike]: req.body.Project_Name.trim()
                    },
                    IsActive: 1,
                    Project_Id: { [Op.ne]: id }
                }
            });

            if (duplicateProject) {
                return res.status(409).json({
                    success: false,
                    message: 'Another Project with this name already exists',
                    field: 'Project_Name'
                });
            }
        }

        // Validate request body
        const validation = validateWithZod<ProjectMasterUpdate>(projectMasterUpdateSchema, req.body);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const validatedBody = validation.data!;

        // Prepare data by converting dates
        const updateData = prepareProjectData({
            ...validatedBody,
            Updated_Date: new Date(),
            Updated_By: (req as any).user?.userId || null // Assuming user info is in req.user
        });

        await project.update(updateData);

        updated(res, project, 'Project updated successfully');

    } catch (e) {
        console.error('Error updating project:', e);
        servError(e, res);
    }
};

export const deleteProject = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project_Master.findByPk(id);

        if (!project) {
            return notFound(res, 'Project not found');
        }

        // Soft delete by setting IsActive to 0
        await project.update({
            IsActive: 0,
            Project_Status: 0,
            Updated_Date: new Date(),
            Updated_By: (req as any).user?.userId || null
        });

        deleted(res, 'Project deleted successfully');

    } catch (e) {
        console.error('Error deleting project:', e);
        servError(e, res);
    }
};

export const getActiveProjects = async (req: Request, res: Response) => {
    try {
        const { companyId } = req.query;

        const whereClause: any = {
            IsActive: 1
        };

        if (companyId && !isNaN(Number(companyId))) {
            whereClause.Company_Id = Number(companyId);
        }

        const projects = await Project_Master.findAll({
            where: whereClause,
            order: [['Project_Name', 'ASC']]
        });

        sentData(res, projects);

    } catch (e) {
        console.error('Error fetching active projects:', e);
        servError(e, res);
    }
};

export const restoreProject = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID parameter is required',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project_Master.findByPk(id);

        if (!project) {
            return notFound(res, 'Project not found');
        }

        await project.update({
            IsActive: 1,
            Project_Status: 1,
            Updated_Date: new Date(),
            Updated_By: (req as any).user?.userId || null
        });

        res.status(200).json({
            success: true,
            message: 'Project restored successfully',
            data: project
        });

    } catch (error) {
        console.error('Error restoring project:', error);
        servError(error as Error, res);
    }
};

// Optional: Hard delete controller (if needed)
export const hardDeleteProject = async (req: Request, res: Response) => {
    try {
        // Validate ID parameter
        const validation = validateWithZod<{ id: number }>(projectIdSchema, req.params);
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Valid ID parameter is required',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        const project = await Project_Master.findByPk(id);

        if (!project) {
            return notFound(res, 'Project not found');
        }

        // Permanently delete
        await project.destroy();

        res.status(200).json({
            success: true,
            message: 'Project permanently deleted'
        });

    } catch (error) {
        console.error('Error hard deleting project:', error);
        servError(error as Error, res);
    }
};