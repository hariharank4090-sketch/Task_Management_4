// controllers/masters/taskManagement/paramMaster.controller.ts
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
    ParamMaster,
    ParamMasterCreationSchema,
    ParamMasterUpdateSchema,
    ParamMasterQuerySchema,
    paramMasterIdSchema,
    ParamMasterCreate,
    ParamMasterUpdate,
    ParamMasterQuery
} from '../../../models/masters/parametMaster/type.model';
import { ZodError } from 'zod';
import { sequelize } from '../../../config/sequalizer';

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

export const getAllParamMasters = async (req: Request, res: Response) => {
    try {
        const sortBy = req.query.sortBy as string || 'Paramet_Id';
        const sortOrder = req.query.sortOrder as string || 'ASC';

        const queryData = {
            ...req.query,
            sortBy,
            sortOrder
        };

        const validation = validateWithZod<ParamMasterQuery>(ParamMasterQuerySchema, queryData);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.errors
            });
        }

        const queryParams = validation.data!;

        // Build WHERE conditions
        let whereConditions = '';
        let whereParams: any[] = [];
        
        // Start with Del_Flag = 0 for active records
        whereConditions = 'WHERE Del_Flag = 0';
        
        if (queryParams.search) {
            whereConditions += ` AND (Paramet_Name LIKE ?)`;
            whereParams.push(`%${queryParams.search}%`);
        }

        if (queryParams.companyId) {
            whereConditions += ` AND Company_id = ?`;
            whereParams.push(queryParams.companyId);
        }

        // Count total records
        const countQuery = `
            SELECT COUNT(*) as total 
            FROM tbl_Paramet_Master
            ${whereConditions}
        `;
        
        const countResult = await sequelize.query(countQuery, {
            replacements: whereParams,
            type: 'SELECT'
        }) as any[];
        
        const totalRecords = countResult[0]?.total || 0;

        // Get paginated data using SQL Server pagination
        const offset = (queryParams.page - 1) * queryParams.limit;
        const orderField = queryParams.sortBy || 'Paramet_Id';
        const orderDirection = queryParams.sortOrder || 'ASC';

        // For SQL Server 2012+, use OFFSET-FETCH
        const dataQuery = `
            SELECT 
                Paramet_Id,
                Paramet_Name,
                Paramet_Data_Type,
                Company_id,
                Del_Flag
            FROM tbl_Paramet_Master
            ${whereConditions}
            ORDER BY ${orderField} ${orderDirection}
            OFFSET ${offset} ROWS
            FETCH NEXT ${queryParams.limit} ROWS ONLY
        `;

        const rows = await sequelize.query(dataQuery, {
            replacements: whereParams,
            type: 'SELECT'
        }) as any[];

        const totalPages = Math.ceil(totalRecords / queryParams.limit);

        return sentData(res, rows, {
            totalRecords,
            currentPage: queryParams.page,
            totalPages,
            pageSize: queryParams.limit,
            hasNextPage: queryParams.page < totalPages,
            hasPreviousPage: queryParams.page > 1
        });

    } catch (err) {
        console.error('Error fetching parameter masters:', err);
        servError(err, res);
    }
};

export const getParamMasterById = async (req: Request, res: Response) => {
    try {
        const validation = validateWithZod<{ id: number }>(paramMasterIdSchema, req.params);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;
 
        const query = `
            SELECT 
                Paramet_Id,
                Paramet_Name,
                Paramet_Data_Type,
                Company_id,
                Del_Flag
            FROM tbl_Paramet_Master
            WHERE Paramet_Id = ? AND Del_Flag = 0
        `;

        const result = await sequelize.query(query, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        if (result.length === 0) {
            return notFound(res, 'Parameter Master not found');
        }

        sentData(res, result);

    } catch (e) {
        console.error('Error fetching parameter master by ID:', e);
        servError(e, res);
    }
};

export const createParamMaster = async (req: Request, res: Response) => {
    try {
        const normalizedBody = {
            ...req.body,
            Paramet_Name: req.body.Paramet_Name?.trim()
        };

       
        if (normalizedBody.Paramet_Name) {
            const checkDuplicateQuery = `
                SELECT Paramet_Id 
                FROM tbl_Paramet_Master 
                WHERE UPPER(Paramet_Name) = UPPER(?) AND Del_Flag = 0
            `;
            
            const existing = await sequelize.query(checkDuplicateQuery, {
                replacements: [normalizedBody.Paramet_Name],
                type: 'SELECT'
            }) as any[];

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Parameter Master with this name already exists',
                    field: 'Paramet_Name'
                });
            }
        }

        // Find max ID
        const maxIdQuery = `
            SELECT MAX(Paramet_Id) as maxId 
            FROM tbl_Paramet_Master
        `;
        
        const maxIdResult = await sequelize.query(maxIdQuery, {
            type: 'SELECT'
        }) as any[];

        const nextId = (maxIdResult[0]?.maxId || 0) + 1;

        const preparedData = {
            ...normalizedBody,
            Paramet_Id: nextId,
            Del_Flag: 0
        };

        const validation = validateWithZod<ParamMasterCreate>(
            ParamMasterCreationSchema,
            preparedData
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { Paramet_Name, Paramet_Data_Type, Company_id } = validation.data!;

        // INSERT query
        const insertQuery = `
            INSERT INTO tbl_Paramet_Master 
            (Paramet_Id, Paramet_Name, Paramet_Data_Type, Company_id, Del_Flag)
            VALUES (?, ?, ?, ?, 0)
        `;

        await sequelize.query(insertQuery, {
            replacements: [
                nextId, 
                Paramet_Name, 
                Paramet_Data_Type || null, 
                Company_id || null
            ]
        });

        // Get the inserted record
        const getInsertedQuery = `
            SELECT * FROM tbl_Paramet_Master 
            WHERE Paramet_Id = ?
        `;

        const insertedRecord = await sequelize.query(getInsertedQuery, {
            replacements: [nextId],
            type: 'SELECT'
        }) as any[];

        return created(res, insertedRecord[0], 'Parameter Master created successfully');

    } catch (error) {
        console.error('Error creating parameter master:', error);
        return servError(error, res);
    }
};

export const updateParamMaster = async (req: Request, res: Response) => {
    try {
        const idValidation = validateWithZod<{ id: number }>(paramMasterIdSchema, req.params);
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

      
        const checkExistsQuery = `
            SELECT Paramet_Name, Paramet_Data_Type, Company_id 
            FROM tbl_Paramet_Master 
            WHERE Paramet_Id = ? AND Del_Flag = 0
        `;
        
        const existingRecord = await sequelize.query(checkExistsQuery, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        if (existingRecord.length === 0) {
            return notFound(res, 'Parameter Master not found');
        }

        const currentRecord = existingRecord[0];

      
        if (req.body.Paramet_Name && req.body.Paramet_Name.trim() !== currentRecord.Paramet_Name) {
            const checkDuplicateQuery = `
                SELECT Paramet_Id 
                FROM tbl_Paramet_Master 
                WHERE UPPER(Paramet_Name) = UPPER(?) AND Paramet_Id != ? AND Del_Flag = 0
            `;
            
            const duplicate = await sequelize.query(checkDuplicateQuery, {
                replacements: [req.body.Paramet_Name.trim(), id],
                type: 'SELECT'
            }) as any[];

            if (duplicate.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Another Parameter Master with this name already exists',
                    field: 'Paramet_Name'
                });
            }
        }

        const validation = validateWithZod<ParamMasterUpdate>(ParamMasterUpdateSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const validatedBody = validation.data!;

        // Build UPDATE query
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (validatedBody.Paramet_Name !== undefined) {
            updateFields.push('Paramet_Name = ?');
            updateValues.push(validatedBody.Paramet_Name);
        }

        if (validatedBody.Paramet_Data_Type !== undefined) {
            updateFields.push('Paramet_Data_Type = ?');
            updateValues.push(validatedBody.Paramet_Data_Type);
        }

        if (validatedBody.Company_id !== undefined) {
            updateFields.push('Company_id = ?');
            updateValues.push(validatedBody.Company_id);
        }

        if (validatedBody.Del_Flag !== undefined) {
            updateFields.push('Del_Flag = ?');
            updateValues.push(validatedBody.Del_Flag);
        }

        // If no fields to update
        if (updateFields.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'No fields to update'
            });
        }

        updateValues.push(id); // Add ID for WHERE clause

        const updateQuery = `
            UPDATE tbl_Paramet_Master 
            SET ${updateFields.join(', ')}
            WHERE Paramet_Id = ?
        `;

        await sequelize.query(updateQuery, {
            replacements: updateValues
        });

        // Get updated record
        const getUpdatedQuery = `
            SELECT * FROM tbl_Paramet_Master 
            WHERE Paramet_Id = ?
        `;

        const updatedRecord = await sequelize.query(getUpdatedQuery, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        updated(res, updatedRecord[0], 'Parameter Master updated successfully');

    } catch (e) {
        console.error('Error updating parameter master:', e);
        servError(e, res);
    }
};

export const deleteParamMaster = async (req: Request, res: Response) => {
    try {
        const validation = validateWithZod<{ id: number }>(paramMasterIdSchema, req.params);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: validation.errors
            });
        }

        const { id } = validation.data!;

        // Check if record exists
        const checkExistsQuery = `
            SELECT Paramet_Id 
            FROM tbl_Paramet_Master 
            WHERE Paramet_Id = ? AND Del_Flag = 0
        `;
        
        const existingRecord = await sequelize.query(checkExistsQuery, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        if (existingRecord.length === 0) {
            return notFound(res, 'Parameter Master not found');
        }

        // SOFT DELETE query (set Del_Flag = 1)
        const deleteQuery = `
            UPDATE tbl_Paramet_Master 
            SET Del_Flag = 1
            WHERE Paramet_Id = ?
        `;

        await sequelize.query(deleteQuery, {
            replacements: [id]
        });

        deleted(res, 'Parameter Master deleted successfully');

    } catch (e) {
        console.error('Error deleting parameter master:', e);
        servError(e, res);
    }
};

export const getAllActiveParamMasters = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                Paramet_Id,
                Paramet_Name,
                Paramet_Data_Type,
                Company_id,
                Del_Flag
            FROM tbl_Paramet_Master
            WHERE Del_Flag = 0
            ORDER BY Paramet_Name ASC
        `;

        const rows = await sequelize.query(query, {
            type: 'SELECT'
        }) as any[];

        sentData(res, rows);

    } catch (e) {
        console.error('Error fetching active parameter masters:', e);
        servError(e, res);
    }
};