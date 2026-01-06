import { Request, Response } from 'express';
import {
  created,
  updated,
  deleted,
  servError,
  notFound
} from '../../../responseObject';

import {
  TaskAssign_Master,
  taskAssignCreationSchema,
  taskAssignUpdateSchema,
  taskAssignQuerySchema,
  taskAssignIdSchema,
  TaskAssignCreateInput,
  TaskAssignUpdateInput,
  TaskAssignQueryParams,
  taskAssignBulkCreateSchema,
  taskAssignBulkUpdateSchema,
  taskAssignBulkDeleteSchema
} from '../../../models/masters/taskAssign/type.model';

import { Project_Master } from '../../../models/masters/project/type.model';
import { Employee_Master } from '../../../models/masters/employee/type.model';

import { ZodError } from 'zod';
import { Op, Transaction } from 'sequelize';
import {sequelize} from '../../../config/sequalizer';

const validateWithZod = <T>(schema: any, data: any): {
  success: boolean;
  data?: T;
  errors?: Array<{ field: string; message: string }>
} => {
  try {
    return { success: true, data: schema.parse(data) };
  } catch (error: any) {
    if (error instanceof ZodError) {
      return {
        success: false,
        errors: error.issues.map(err => ({
          field: err.path.join('.'),
          message: err.message
        }))
      };
    }
    return { success: false };
  }
};


interface UpdateError {
  id: number;
  error: string;
}

// Bulk create controller
export const createBulkTaskAssign = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;
  
  try {

    const validation = validateWithZod<TaskAssignCreateInput[]>(
      taskAssignBulkCreateSchema,
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const assignments = validation.data!;
    transaction = await sequelize.transaction();

    // Check for existing assignments to avoid duplicates
    const existingAssignments = await TaskAssign_Master.findAll({
      where: {
        [Op.or]: assignments.map(assign => ({
          Project_Id: assign.Project_Id,
          User_Id: assign.User_Id
        }))
      },
      transaction
    });

    // Filter out assignments that already exist
    const newAssignments = assignments.filter(assign => 
      !existingAssignments.some(existing => 
        existing.Project_Id === assign.Project_Id && existing.User_Id === assign.User_Id
      )
    );

    if (newAssignments.length === 0) {
      await transaction.rollback();
      return res.status(409).json({
        success: false,
        message: 'All employees are already assigned to their respective projects'
      });
    }

    // Create new assignments
    const createdRecords = await TaskAssign_Master.bulkCreate(newAssignments, {
      transaction,
      returning: true
    });

    await transaction.commit();

    return res.status(201).json({
      success: true,
      message: `${createdRecords.length} assignment(s) created successfully`,
      data: createdRecords,
      skipped: assignments.length - newAssignments.length,
      skippedAssignments: assignments.filter(assign => 
        existingAssignments.some(existing => 
          existing.Project_Id === assign.Project_Id && existing.User_Id === assign.User_Id
        )
      )
    });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error('createBulkTaskAssign error:', error);
    return servError(error, res);
  }
};

export const updateBulkTaskAssign = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;

  try {

    const parsed = taskAssignBulkUpdateSchema.safeParse(req.body);
 
    if (!parsed.success) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: parsed.error.format()
      });
    }

    const updates = parsed.data;

   
    const projectMap = new Map<number, number[]>();
    for (const { Project_Id, User_Id } of updates) {
      if (!projectMap.has(Project_Id)) projectMap.set(Project_Id, []);
      projectMap.get(Project_Id)!.push(User_Id);
    }

    transaction = await sequelize.transaction();
    const results: any[] = [];

   
    for (const [Project_Id, userIds] of projectMap.entries()) {
     
      const deletedCount = await TaskAssign_Master.destroy({
        where: { Project_Id },
        transaction
      });

     
      const uniqueUserIds = [...new Set(userIds)];

    
      const rows = uniqueUserIds.map(User_Id => ({ Project_Id, User_Id }));
      const created = await TaskAssign_Master.bulkCreate(rows, { transaction });

      results.push({
        Project_Id,
        deletedCount,
        createdCount: created.length
      });
    }

    await transaction.commit();

  
    return res.status(200).json({
      success: true,
      message: "Project assignments updated successfully",
      summary: {
        totalProjects: results.length,
        totalDeleted: results.reduce((s, r) => s + r.deletedCount, 0),
        totalCreated: results.reduce((s, r) => s + r.createdCount, 0)
      },
      details: results
    });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error("updateBulkTaskAssign error:", error);

    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message
    });
  }
};





// Bulk delete controller - FIXED VERSION
export const deleteBulkTaskAssign = async (req: Request, res: Response) => {
  let transaction: Transaction | undefined;
  
  try {
    // Handle different request formats
    let ids: number[];
    
    // Check if the request has an 'ids' property or is directly an array
    if (req.body.ids && Array.isArray(req.body.ids)) {
      ids = req.body.ids;
    } else if (Array.isArray(req.body)) {
      ids = req.body;
    } else {
      return res.status(400).json({
        success: false,
        message: 'Request body must contain an array of IDs or an object with an "ids" array property'
      });
    }

    // Validate input array of IDs
    const validation = validateWithZod<number[]>(
      taskAssignBulkDeleteSchema,
      ids
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    ids = validation.data!;
    transaction = await sequelize.transaction();

    // Check if all IDs exist
    const existingAssignments = await TaskAssign_Master.findAll({
      where: { Id: { [Op.in]: ids } },
      transaction
    });

    const existingIds = existingAssignments.map(assign => assign.Id);
    const missingIds = ids.filter(id => !existingIds.includes(id));

    if (existingIds.length === 0) {
      await transaction.rollback();
      return res.status(404).json({
        success: false,
        message: 'No assignments found with the provided IDs',
        missingIds: ids
      });
    }

    // Delete assignments
    const deleteCount = await TaskAssign_Master.destroy({
      where: { Id: { [Op.in]: existingIds } },
      transaction
    });

    await transaction.commit();

    return res.status(200).json({
      success: true,
      message: `${deleteCount} assignment(s) deleted successfully`,
      deletedCount: deleteCount,
      notFoundIds: missingIds.length > 0 ? missingIds : undefined
    });

  } catch (error: any) {
    if (transaction) await transaction.rollback();
    console.error('deleteBulkTaskAssign error:', error);
    return servError(error, res);
  }
};

// Keep the rest of your existing controller functions
export const getAllTaskAssign = async (req: Request, res: Response) => {
  try {
    const sortBy = (req.query.sortBy as string) || 'Id';
    const sortOrder = (req.query.sortOrder as string) || 'ASC';

    const validation = validateWithZod<TaskAssignQueryParams>(
      taskAssignQuerySchema,
      { ...req.query, sortBy, sortOrder }
    );

    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const queryParams = validation.data!;
    const where: any = {};

    if (queryParams.projectId) where.Project_Id = queryParams.projectId;
    if (queryParams.userId) where.User_Id = queryParams.userId;

    const { rows, count } = await TaskAssign_Master.findAndCountAll({
      where,
      limit: queryParams.limit,
      offset: (queryParams.page - 1) * queryParams.limit,
      order: [[sortBy, sortOrder]],
      include: [
        {
          model: Project_Master,
          as: 'Project',
          attributes: ['Project_Id', 'Project_Name'],
          required: false
        },
        {
          model: Employee_Master,
          as: 'Employee',
          attributes: ['Emp_Id', 'Emp_Name'],
          required: false
        }
      ]
    });

    return res.json({
      success: true,
      data: rows,
      pagination: {
        totalRecords: count,
        currentPage: queryParams.page,
        totalPages: Math.ceil(count / queryParams.limit),
        pageSize: queryParams.limit
      }
    });

  } catch (error: any) {
    console.error('getAllTaskAssign error:', error);
    return servError(error, res);
  }
};

export const getTaskAssignById = async (req: Request, res: Response) => {
  try {
    const validation = validateWithZod<{ id: number }>(taskAssignIdSchema, req.params);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const taskAssignId = validation.data!.id;

    const taskAssign = await TaskAssign_Master.findByPk(taskAssignId, {
      include: [
        {
          model: Project_Master,
          as: 'Project',
          attributes: ['Project_Id', 'Project_Name']
        }
      ]
    });

    if (!taskAssign) return notFound(res, 'Task assignment not found');

    const projectId = taskAssign.Project_Id;

    const employees = await TaskAssign_Master.findAll({
      where: { Project_Id: projectId },
      include: [
        {
          model: Employee_Master,
          as: 'Employee',
          attributes: ['Emp_Id', 'Emp_Name']
        }
      ]
    });

    const employeeDetails = employees.map(e => ({
      User_Id: e.User_Id,
      Employee_Name: e.Employee?.Emp_Name || null
    }));

    return res.status(200).json({
      success: true,
      data: {
        Project_Id: taskAssign.Project_Id,
        Project_Name: taskAssign.Project?.Project_Name || null,
        Employees: employeeDetails
      }
    });

  } catch (error: any) {
    console.error('getTaskAssignById error:', error);
    return servError(error, res);
  }
};

export const createTaskAssign = async (req: Request, res: Response) => {
  try {
    const validation = validateWithZod<TaskAssignCreateInput>(
      taskAssignCreationSchema,
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    const exists = await TaskAssign_Master.findOne({
      where: validation.data
    });

    if (exists) {
      return res.status(409).json({
        success: false,
        message: 'User already assigned to this project'
      });
    }

    const record = await TaskAssign_Master.create(validation.data);
    return created(res, record);

  } catch (error: any) {
    return servError(error, res);
  }
};

export const updateTaskAssign = async (req: Request, res: Response) => {
  try {
    const idValidation = validateWithZod<{ id: number }>(
      taskAssignIdSchema,
      req.params
    );

    if (!idValidation.success) {
      return res.status(400).json({ success: false });
    }

    const taskAssign = await TaskAssign_Master.findByPk(idValidation.data!.id);
    if (!taskAssign) {
      return notFound(res, 'Task assignment not found');
    }

    const validation = validateWithZod<TaskAssignUpdateInput>(
      taskAssignUpdateSchema,
      req.body
    );

    if (!validation.success) {
      return res.status(400).json({
        success: false,
        errors: validation.errors
      });
    }

    await taskAssign.update(validation.data!);
    return updated(res, taskAssign);

  } catch (error: any) {
    return servError(error, res);
  }
};

export const deleteTaskAssign = async (req: Request, res: Response) => {
  try {
    const validation = validateWithZod<{ id: number }>(
      taskAssignIdSchema,
      req.params
    );

    if (!validation.success) {
      return res.status(400).json({ success: false });
    }

    const taskAssign = await TaskAssign_Master.findByPk(validation.data!.id);
    if (!taskAssign) {
      return notFound(res, 'Task assignment not found');
    }

    await taskAssign.destroy();
    return deleted(res);

  } catch (error: any) {
    return servError(error, res);
  }
};