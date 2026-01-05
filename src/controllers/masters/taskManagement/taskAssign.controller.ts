// import { Request, Response } from 'express';
// import {
//     created,
//     updated,
//     deleted,
//     servError,
//     notFound,
//     sentData
// } from '../../../responseObject';
// import { 
//     taskAssignCreationSchema,
//     taskAssignUpdateSchema,
//     TaskAssign_Master, 
//     taskAssignIdSchema,
//     taskAssignQuerySchema,
//     TaskAssignCreateInput,
//     TaskAssignQueryParams,
//     TaskAssignUpdateInput 
// } from '../../../models/masters/taskAssign/type.model';
// import { ZodError } from 'zod';
// import { Op } from 'sequelize';
// import { Project_Master } from '../../../models/masters/project/type.model';
// import { Employee_Master } from '../../../models/masters/employee/type.model';

// const validateWithZod = <T>(schema: any, data: any): {
//     success: boolean;
//     data?: T;
//     errors?: Array<{ field: string; message: string }>
// } => {
//     try {
//     //       const validatedData = schema.parse(data);
//     //     return { success: true, data: validatedData };
//         const validatedData = schema.parse(data);
//         return { success: true, data: validatedData };
//     } catch (error: any) {
//         if (error instanceof ZodError) {
//             const zodIssues = error.issues || (error as any).errors || [];

//             return {
//                 success: false,
//                 errors: zodIssues.map((err: any) => ({
//                     field: Array.isArray(err.path) ? err.path.join('.') : String(err.path || 'unknown'),
//                     message: err.message || 'Validation error'
//                 }))
//             };
//         }
//         return {
//             success: false,
//             errors: [{ field: 'unknown', message: 'Validation failed' }]
//         };
//     }
// };

// // Helper function to prepare data
// const prepareTaskAssignData = (data: any) => {
//     return { ...data };
// };

// export const getAllTaskAssign = async (req: Request, res: Response) => {
//     try {
//         const sortBy = req.query.sortBy as string || 'Id';
//         const sortOrder = req.query.sortOrder as string || 'ASC';

//         const queryData = {
//             ...req.query,
//             sortBy,
//             sortOrder
//         };

//         const validation = validateWithZod<any>(taskAssignQuerySchema, queryData);

//         if (!validation.success) {
//             console.log('Validation failed:', validation.errors);
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid query parameters',
//                 errors: validation.errors
//             });
//         }

//         const queryParams = validation.data!;
        
//         const where: any = {};

//         // Apply filters
//         if (queryParams.projectId) {
//             where.Project_Id = queryParams.projectId;
//         }

//         if (queryParams.userId) {
//             where.User_Id = queryParams.userId;
//         }

//         const orderField = queryParams.sortBy || 'Id';
//         const orderDirection = queryParams.sortOrder || 'ASC';

//         // Get assignments
//         const { rows, count } = await TaskAssign_Master.findAndCountAll({
//             where,
//             limit: queryParams.limit,
//             offset: (queryParams.page - 1) * queryParams.limit,
//             order: [[orderField, orderDirection]]
//         });

//         console.log(`Found ${rows.length} assignments, total: ${count}`);

//         // Get project and employee details
//         const projectIds = rows
//             .map(row => row.Project_Id)
//             .filter((id): id is number => id !== null && id !== undefined)
//             .filter((id, index, self) => self.indexOf(id) === index);

//         const userIds = rows
//             .map(row => row.User_Id)
//             .filter((id): id is number => id !== null && id !== undefined)
//             .filter((id, index, self) => self.indexOf(id) === index);

//         console.log('Project IDs:', projectIds);
//         console.log('User IDs:', userIds);

//         // Fetch projects
//         const projectsMap = new Map<number, any>();
//         if (projectIds.length > 0) {
//             const projects = await Project_Master.findAll({
//                 where: { 
//                     Project_Id: projectIds 
//                 },
//                 attributes: ['Project_Id', 'Project_Name', 'Project_Code', 'Project_Status']
//             });
            
//             console.log(`Fetched ${projects.length} projects`);
            
//             projects.forEach(project => {
//                 projectsMap.set(project.Project_Id, {
//                     Project_Id: project.Project_Id,
//                     Project_Name: project.Project_Name
//                 });
//             });
//         }

//         // Fetch employees - IMPORTANT: Check your Employee_Master model structure
//         const employeesMap = new Map<number, any>();
//         if (userIds.length > 0) {
//             // Check if your Employee_Master uses User_Id or Emp_Id
//             // Based on your table structure, it might be Emp_Id
//             const employees = await Employee_Master.findAll({
//                 where: { 
//                     // Try different field names based on your actual table
//                     // Option 1: If your Employee_Master has User_Id field
//                     Emp_Id: userIds
//                     // Option 2: If your Employee_Master has Emp_Id field (more likely)
//                     // Emp_Id: userIds  
//                 },
//                 attributes: [
//                     'Emp_Id',        // Primary key
//                     'User_Id',       // Foreign key (might be same as Emp_Id)
//                     'Emp_Code',
//                     'Emp_Name',
//                     'Designation',
//                     'Department',
//                     'Mobile_No'
//                 ]
//             });
            
//             console.log(`Fetched ${employees.length} employees`);
//             console.log('Employee fields:', employees.length > 0 ? Object.keys(employees[0].toJSON()) : 'none');
            
//             employees.forEach(employee => {
//                 const empData = employee.toJSON();
//                 console.log('Employee data:', empData);
                
//                 // Map by User_Id if available, otherwise by Emp_Id
//                 const key = empData.Emp_Id || empData.Emp_Id;
//                 if (key) {
//                     employeesMap.set(key, {
//                         User_Id: empData.Emp_Id || empData.Emp_Id,
//                         Emp_Id: empData.Emp_Id,
//                         Emp_Code: empData.Emp_Code,
//                         Emp_Name: empData.Emp_Name,
//                         Designation: empData.Designation,
//                         Department: empData.Department,
//                         Mobile_No: empData.Mobile_No
//                     });
//                 }
//             });
//         }

//         console.log('Projects map size:', projectsMap.size);
//         console.log('Employees map size:', employeesMap.size);

//         // Format response
//         const formattedRows = rows.map(row => {
//             const assignment = row.toJSON();
//             console.log('Assignment row:', assignment);
            
//             const project = projectsMap.get(assignment.Project_Id);
//             const employee = employeesMap.get(assignment.User_Id);
            
//             console.log('Found project for ID', assignment.Project_Id, ':', project);
//             console.log('Found employee for ID', assignment.User_Id, ':', employee);
            
//             return {
//                 Id: assignment.Id,
//                 Project_Id: assignment.Project_Id,
//                 User_Id: assignment.User_Id,
//                 Project_Details: project || null,
//                 Employee_Details: employee || null
//             };
//         });

//         console.log('Formatted rows sample:', formattedRows.slice(0, 3));

//         const totalPages = Math.ceil(count / queryParams.limit);
//         const hasNextPage = queryParams.page < totalPages;
//         const hasPreviousPage = queryParams.page > 1;

//         console.log('=== Sending response with', formattedRows.length, 'assignments ===');
        
//         return res.status(200).json({
//             success: true,
//             message: 'Task assignments retrieved successfully',
//             data: formattedRows,
//             pagination: {
//                 totalRecords: count,
//                 currentPage: queryParams.page,
//                 totalPages,
//                 pageSize: queryParams.limit,
//                 hasNextPage,
//                 hasPreviousPage
//             }
//         });

//     } catch (err) {
//         console.error('Error in getAllTaskAssign:', err);
//         return res.status(500).json({
//             success: false,
//             message: 'Internal server error',
 
//         });
//     }
// };

// export const getTaskAssignById = async (req: Request, res: Response) => {
//     try {
//         // Validate ID
//         const validation = validateWithZod<{ id: number }>(
//             taskAssignIdSchema,
//             req.params
//         );

//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid ID parameter',
//                 errors: validation.errors
//             });
//         }

//         const { id } = validation.data!;

//         // Fetch assignment
//         const taskAssign = await TaskAssign_Master.findOne({
//             where: {
//                 Id: id
//             }
//         });

//         if (!taskAssign) {
//             return notFound(res, 'Project-Employee Assignment not found');
//         }

//         // Fetch project details
//         let projectDetails;
//         if (taskAssign.Project_Id) {
//             const project = await Project_Master.findOne({
//                 where: {
//                     Project_Id: taskAssign.Project_Id
//                 },
//                 attributes: ['Project_Id', 'Project_Name', 'Project_Code', 'Project_Status']
//             });
            
//             if (project) {
//                 projectDetails = {
//                     Project_Id: project.Project_Id,
//                     Project_Name: project.Project_Name
//                 };
//             }
//         }

//         // Fetch employee details
//         let employeeDetails;
//         if (taskAssign.User_Id) {
//             const employee = await Employee_Master.findOne({
//                 where: {
//                     Emp_Id: taskAssign.User_Id
//                 },
//                 attributes: ['User_Id']
//             });
            
//             if (employee) {
//                 employeeDetails = {
//                     User_Id: employee.Emp_Id
//                 };
//             }
//         }

//         // Format response
//         const formattedData = {
//             ...taskAssign.toJSON(),
//             Project_Details: projectDetails,
//             Employee_Details: employeeDetails
//         };

//         return res.status(200).json({
//             success: true,
//             message: 'Project-Employee Assignment fetched successfully',
//             data: formattedData
//         });

//     } catch (e) {
//         console.error('Error fetching assignment by ID:', e);
//         servError(e, res);
//     }
// };

// export const createTaskAssign = async (req: Request, res: Response) => {
//     try {
//         // Normalize request body
//         const normalizedBody = {
//             ...req.body,
//             Project_Id: req.body.Project_Id,
//             User_Id: req.body.User_Id
//         };

//         // Duplicate check - Check if same user is already assigned to same project
//         const existing = await TaskAssign_Master.findOne({
//             where: {
//                 Project_Id: normalizedBody.Project_Id,
//                 User_Id: normalizedBody.User_Id
//             }
//         });

//         if (existing) {
//             return res.status(409).json({
//                 success: false,
//                 message: 'Employee is already assigned to this project',
//                 field: 'User_Id'
//             });
//         }

//         // Prepare data
//         const preparedData = prepareTaskAssignData(normalizedBody);

//         // Validate
//         const validation = validateWithZod<TaskAssignCreateInput>(
//             taskAssignCreationSchema,
//             preparedData
//         );

//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors: validation.errors
//             });
//         }

// // const taskAssign = await TaskAssign_Master.create(validation.data as TaskAssignCreateInput);

//         // Create record
//         const taskAssign = await TaskAssign_Master.create(validation.data);

//         // Fetch created record with details
//         const createdTaskAssign = await getTaskAssignByIdInternal(taskAssign.Id);

//         return created(res, createdTaskAssign, 'Project-Employee Assignment created successfully');

//     } catch (error) {
//         console.error('Error creating assignment:', error);
//         return servError(error, res);
//     }
// };

// export const updateTaskAssign = async (req: Request, res: Response) => {
//     try {
//         // Validate ID parameter
//         const idValidation = validateWithZod<{ id: number }>(taskAssignIdSchema, req.params);
//         if (!idValidation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid ID parameter',
//                 errors: idValidation.errors
//             });
//         }

//         const { id } = idValidation.data!;

//         // Check if assignment exists
//         const taskAssign = await TaskAssign_Master.findOne({
//             where: {
//                 Id: id
//             }
//         });

//         if (!taskAssign) {
//             return notFound(res, 'Project-Employee Assignment not found');
//         }

//         // If updating Project_Id or User_Id, check for duplicates
//         if (req.body.Project_Id || req.body.User_Id) {
//             const duplicateWhere: any = {};
            
//             duplicateWhere.Project_Id = req.body.Project_Id || taskAssign.Project_Id;
//             duplicateWhere.User_Id = req.body.User_Id || taskAssign.User_Id;
            
//             // Exclude current record
//             duplicateWhere.Id = { [Op.ne]: id };

//             const duplicateTaskAssign = await TaskAssign_Master.findOne({
//                 where: duplicateWhere
//             });

//             if (duplicateTaskAssign) {
//                 return res.status(409).json({
//                     success: false,
//                     message: 'Employee is already assigned to this project',
//                     field: 'User_Id'
//                 });
//             }
//         }

//         // Validate request body
//         const validation = validateWithZod<TaskAssignUpdateInput>(taskAssignUpdateSchema, req.body);
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Validation failed',
//                 errors: validation.errors
//             });
//         }

//         const validatedBody = validation.data!;

//         // Prepare data
//         const updateData = prepareTaskAssignData(validatedBody);

//         await taskAssign.update(updateData);

//         // Fetch updated record with details
//         const updatedTaskAssign = await getTaskAssignByIdInternal(id);

//         updated(res, updatedTaskAssign, 'Project-Employee Assignment updated successfully');

//     } catch (e) {
//         console.error('Error updating assignment:', e);
//         servError(e, res);
//     }
// };

// export const deleteTaskAssign = async (req: Request, res: Response) => {
//     try {
//         // Validate ID parameter
//         const validation = validateWithZod<{ id: number }>(taskAssignIdSchema, req.params);
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Invalid ID parameter',
//                 errors: validation.errors
//             });
//         }

//         const { id } = validation.data!;

//         const taskAssign = await TaskAssign_Master.findByPk(id);

//         if (!taskAssign) {
//             return notFound(res, 'Project-Employee Assignment not found');
//         }

//         // Delete the record (hard delete since it's a junction table with no soft delete flag)
//         await taskAssign.destroy();

//         deleted(res, 'Project-Employee Assignment deleted successfully');

//     } catch (e) {
//         console.error('Error deleting assignment:', e);
//         servError(e, res);
//     }
// };

// export const getActiveTaskAssignments = async (req: Request, res: Response) => {
//     try {
//         const { projectId, userId } = req.query;

//         const whereClause: any = {};

//         if (projectId && !isNaN(Number(projectId))) {
//             whereClause.Project_Id = Number(projectId);
//         }

//         if (userId && !isNaN(Number(userId))) {
//             whereClause.User_Id = Number(userId);
//         }

//         const taskAssignments = await TaskAssign_Master.findAll({
//             where: whereClause,
//             order: [['Id', 'ASC']]
//         });

//         // Get project and employee details for all assignments
//         const formattedAssignments = await Promise.all(
//             taskAssignments.map(async (assignment) => {
//                 const assignmentData = assignment.toJSON();
                
//                 // Fetch project details
//                 let projectDetails;
//                 if (assignmentData.Project_Id) {
//                     const project = await Project_Master.findByPk(assignmentData.Project_Id, {
//                         attributes: ['Project_Name', 'Project_Code']
//                     });
                    
//                     if (project) {
//                         projectDetails = {
//                             Project_Name: project.Project_Name,
//                         };
//                     }
//                 }

//                 // Fetch employee details
//                 let employeeDetails;
//                 if (assignmentData.User_Id) {
//                     const employee = await Employee_Master.findByPk(assignmentData.User_Id, {
//                         attributes: []
//                     });
                    
//                     if (employee) {
//                         employeeDetails = {
//                             Emp_Name: employee.Emp_Name,
                          
//                         };
//                     }
//                 }

//                 return {
//                     Id: assignmentData.Id,
//                     Project_Id: assignmentData.Project_Id,
//                     User_Id: assignmentData.User_Id,
//                     Project_Details: projectDetails,
//                     Employee_Details: employeeDetails
//                 };
//             })
//         );

//         sentData(res, formattedAssignments);

//     } catch (e) {
//         console.error('Error fetching assignments:', e);
//         servError(e, res);
//     }
// };

// // Helper function to get assignment with details
// const getTaskAssignByIdInternal = async (id: number) => {
//     const assignment = await TaskAssign_Master.findByPk(id);
    
//     if (!assignment) {
//         return null;
//     }

//     const assignmentData = assignment.toJSON();
    
//     // Fetch project details
//     let projectDetails;
//     if (assignmentData.Project_Id) {
//         const project = await Project_Master.findByPk(assignmentData.Project_Id, {
//             attributes: ['Project_Name', 'Project_Code']
//         });
        
//         if (project) {
//             projectDetails = {
//                 Project_Name: project.Project_Name,
//             };
//         }
//     }

//     // Fetch employee details
//     let employeeDetails;
//     if (assignmentData.User_Id) {
//         const employee = await Employee_Master.findByPk(assignmentData.User_Id, {
//             attributes: ['Emp_Name']
//         });
        
//         if (employee) {
//             employeeDetails = {
//                Emp_Name:employee.Emp_Name
//             };
//         }
//     }

//     return {
//         ...assignmentData,
//         Project_Details: projectDetails,
//         Employee_Details: employeeDetails
//     };
// };

// // Additional endpoints similar to taskType controller

// export const getAssignmentsByProject = async (req: Request, res: Response) => {
//     try {
//         const { projectId } = req.params;
//         const { page = 1, limit = 20 } = req.query;

//         if (!projectId || isNaN(Number(projectId))) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid Project ID is required'
//             });
//         }

//         const whereClause: any = {
//             Project_Id: Number(projectId)
//         };

//         const { rows, count } = await TaskAssign_Master.findAndCountAll({
//             where: whereClause,
//             limit: Number(limit),
//             offset: (Number(page) - 1) * Number(limit),
//             order: [['Id', 'ASC']]
//         });

//         // Get project details
//         const project = await Project_Master.findByPk(projectId, {
//             attributes: ['Project_Name', 'Project_Code', 'Project_Status']
//         });

//         if (!project) {
//             return notFound(res, 'Project not found');
//         }

//         // Get employee details for each assignment
//         const formattedRows = await Promise.all(
//             rows.map(async (row) => {
//                 const assignmentData = row.toJSON();
                
//                 let employeeDetails;
//                 if (assignmentData.User_Id) {
//                     const employee = await Employee_Master.findByPk(assignmentData.User_Id, {
//                         attributes: ['Emp_First_Name', 'Emp_Last_Name', 'Emp_Code', 'Designation', 'Department']
//                     });
                    
//                     if (employee) {
          
//                         employeeDetails = {
//                             User_Id: employee.Emp_Id
                          
//                         };
//                     }
//                 }

//                 return {
//                     Id: assignmentData.Id,
//                     Project_Id: assignmentData.Project_Id,
//                     User_Id: assignmentData.User_Id,
//                     Employee_Details: employeeDetails
//                 };
//             })
//         );

//         const totalPages = Math.ceil(count / Number(limit));

//         return res.status(200).json({
//             success: true,
//             message: 'Project assignments retrieved successfully',
//             project: {
//                 Project_Id: project.Project_Id,
//                 Project_Name: project.Project_Name,
//                 Project_Status: project.Project_Status
//             },
//             data: formattedRows,
//             pagination: {
//                 totalRecords: count,
//                 currentPage: Number(page),
//                 totalPages,
//                 pageSize: Number(limit),
//                 hasNextPage: Number(page) < totalPages,
//                 hasPreviousPage: Number(page) > 1
//             }
//         });

//     } catch (error) {
//         console.error('Error fetching project assignments:', error);
//         servError(error as Error, res);
//     }
// };

// export const getAssignmentsByUser = async (req: Request, res: Response) => {
//     try {
//         const { userId } = req.params;
//         const { page = 1, limit = 20 } = req.query;

//         if (!userId || isNaN(Number(userId))) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid User ID is required'
//             });
//         }

//         const whereClause: any = {
//             User_Id: Number(userId)
//         };

//         const { rows, count } = await TaskAssign_Master.findAndCountAll({
//             where: whereClause,
//             limit: Number(limit),
//             offset: (Number(page) - 1) * Number(limit),
//             order: [['Id', 'ASC']]
//         });

//         // Get user details
//         const user = await Employee_Master.findByPk(userId, {
//             attributes: ['Emp_First_Name', 'Emp_Last_Name', 'Emp_Code', 'Designation', 'Department']
//         });

//         if (!user) {
//             return notFound(res, 'Employee not found');
//         }

//         // Get project details for each assignment
//         const formattedRows = await Promise.all(
//             rows.map(async (row) => {
//                 const assignmentData = row.toJSON();
                
//                 let projectDetails;
//                 if (assignmentData.Project_Id) {
//                     const project = await Project_Master.findByPk(assignmentData.Project_Id, {
//                         attributes: ['Project_Name', 'Project_Code', 'Project_Status']
//                     });
                    
//                     if (project) {
//                         projectDetails = {
//                             Project_Id: project.Project_Id,
//                             Project_Name: project.Project_Name,
//                             Project_Status: project.Project_Status
//                         };
//                     }
//                 }

//                 return {
//                     Id: assignmentData.Id,
//                     Project_Id: assignmentData.Project_Id,
//                     User_Id: assignmentData.User_Id,
//                     Project_Details: projectDetails
//                 };
//             })
//         );

//         const totalPages = Math.ceil(count / Number(limit));

//         return res.status(200).json({
//             success: true,
//             message: 'Employee assignments retrieved successfully',
//             employee: {
//                 User_Id: user.Emp_Id,
//                 Emp_Name: user.Emp_Name
//             },
//             data: formattedRows,
//             pagination: {
//                 totalRecords: count,
//                 currentPage: Number(page),
//                 totalPages,
//                 pageSize: Number(limit),
//                 hasNextPage: Number(page) < totalPages,
//                 hasPreviousPage: Number(page) > 1
//             }
//         });

//     } catch (error) {
//         console.error('Error fetching employee assignments:', error);
//         servError(error as Error, res);
//     }
// };


// export const restoreTaskAssign = async (req: Request, res: Response) => {
//     try {
      
//         const validation = validateWithZod<{ id: number }>(taskAssignIdSchema, req.params);
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid ID parameter is required',
//                 errors: validation.errors
//             });
//         }

//         const { id } = validation.data!;

//         return res.status(400).json({
//             success: false,
//             message: 'Restore functionality is not available for project-employee assignments'
//         });

//     } catch (error) {
//         console.error('Error in restore assignment:', error);
//         servError(error as Error, res);
//     }
// };

// export const hardDeleteTaskAssign = async (req: Request, res: Response) => {
//     try {
     
//         const validation = validateWithZod<{ id: number }>(taskAssignIdSchema, req.params);
//         if (!validation.success) {
//             return res.status(400).json({
//                 success: false,
//                 message: 'Valid ID parameter is required',
//                 errors: validation.errors
//             });
//         }

//         const { id } = validation.data!;

//         const taskAssign = await TaskAssign_Master.findByPk(id);

//         if (!taskAssign) {
//             return notFound(res, 'Project-Employee Assignment not found');
//         }

       
//         await taskAssign.destroy();

//         res.status(200).json({
//             success: true,
//             message: 'Project-Employee Assignment permanently deleted'
//         });

//     } catch (error) {
//         console.error('Error hard deleting assignment:', error);
//         servError(error as Error, res);
//     }
// };














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
  TaskAssignQueryParams
} from '../../../models/masters/taskAssign/type.model';

import { Project_Master } from '../../../models/masters/project/type.model';
import { Employee_Master } from '../../../models/masters/employee/type.model';

import { ZodError } from 'zod';
import { Op } from 'sequelize';

/* ================= ZOD VALIDATOR ================= */
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

/* ================================================= */
/* ================= GET ALL ======================= */
/* ================================================= */
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

  } catch (error) {
    console.error('getAllTaskAssign error:', error);
    return res.status(500).json({ success: false, message: 'Internal server error' });
  }
};


/* ================================================= */
/* ================= GET BY ID ===================== */
/* ================================================= */
export const getTaskAssignById = async (req: Request, res: Response) => {
  try {
    // Validate ID param
    const validation = validateWithZod<{ id: number }>(taskAssignIdSchema, req.params);
    if (!validation.success) {
      return res.status(400).json({ success: false, errors: validation.errors });
    }

    const taskAssignId = validation.data!.id;

    // Fetch the task assignment with its project
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

    // Fetch all employees assigned to this project
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

    // Format response
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

  } catch (error) {
    console.error('getTaskAssignById error:', error);
    return servError(error, res);
  }
};


/* ================================================= */
/* ================= CREATE ======================== */
/* ================================================= */
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

  } catch (error) {
    return servError(error, res);
  }
};

/* ================================================= */
/* ================= UPDATE ======================== */
/* ================================================= */
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

  } catch (error) {
    return servError(error, res);
  }
};

/* ================================================= */
/* ================= DELETE ======================== */
/* ================================================= */
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

  } catch (error) {
    return servError(error, res);
  }
};
