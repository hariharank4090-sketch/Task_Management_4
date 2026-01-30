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
    ParametDataTypeCreationSchema,
    ParametDataTypeUpdateSchema,
    ParametDataTypeQuerySchema,
    parametDataTypeIdSchema,
    ParametDataTypeCreate,
    ParametDataTypeUpdate,
    ParametDataTypeQuery
} from '../../../models/masters/taskParamType/type.model';
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

export const getAllParametDataTypes = async (req: Request, res: Response) => {
    try {
        const queryData = {
            ...req.query
        };

        const validation = validateWithZod<ParametDataTypeQuery>(ParametDataTypeQuerySchema, queryData);

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid query parameters',
                errors: validation.errors
            });
        }

        const queryParams = validation.data!;

        // Build WHERE conditions
        const whereConditions: string[] = [];
        const queryParamsArray: any[] = [];

        if (queryParams.Para_Data_Type) {
            whereConditions.push(`pd.Para_Data_Type LIKE ?`);
            queryParamsArray.push(`%${queryParams.Para_Data_Type}%`);
        }

        const whereClause = whereConditions.length > 0 
            ? `WHERE ${whereConditions.join(' AND ')}` 
            : '';

        const orderField = queryParams.sortBy || 'Para_Data_Type_Id';
        const orderDirection = queryParams.sortOrder || 'ASC';

        const dataQuery = `
            SELECT 
                pd.Para_Data_Type_Id,
                pd.Para_Data_Type,
                pd.Para_Display_Name
            FROM tbl_Paramet_Data_Type pd
            ${whereClause}
            ORDER BY ${orderField} ${orderDirection}
        `;

        const rows = await sequelize.query(dataQuery, {
            replacements: queryParamsArray,
            type: 'SELECT'
        }) as any[];

        // Return all data without pagination metadata
        return sentData(res, rows);

    } catch (err) {
        console.error('Error fetching parameter data types:', err);
        servError(err, res);
    }
};

export const getParametDataTypeById = async (req: Request, res: Response) => {
    try {
        const validation = validateWithZod<{ id: number }>(parametDataTypeIdSchema, req.params);
        
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
                Para_Data_Type_Id,
                Para_Data_Type,
                Para_Display_Name
            FROM tbl_Paramet_Data_Type
            WHERE Para_Data_Type_Id = ?
        `;

        const result = await sequelize.query(query, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        if (result.length === 0) {
            return notFound(res, 'Parameter Data Type not found');
        }

        sentData(res, result);

    } catch (e) {
        console.error('Error fetching parameter data type by ID:', e);
        servError(e, res);
    }
};

export const createParametDataType = async (req: Request, res: Response) => {
    try {
        const normalizedBody = {
            ...req.body,
            Para_Data_Type: req.body.Para_Data_Type?.trim(),
            Para_Display_Name: req.body.Para_Display_Name?.trim()
        };

        // Check for duplicate Para_Data_Type using raw query
        if (normalizedBody.Para_Data_Type) {
            const checkDuplicateQuery = `
                SELECT Para_Data_Type_Id 
                FROM tbl_Paramet_Data_Type 
                WHERE UPPER(Para_Data_Type) = UPPER(?)
            `;
            
            const existing = await sequelize.query(checkDuplicateQuery, {
                replacements: [normalizedBody.Para_Data_Type],
                type: 'SELECT'
            }) as any[];

            if (existing.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Parameter Data Type with this name already exists',
                    field: 'Para_Data_Type'
                });
            }
        }

        // Find max ID using raw query
        const maxIdQuery = `
            SELECT MAX(Para_Data_Type_Id) as maxId 
            FROM tbl_Paramet_Data_Type
        `;
        
        const maxIdResult = await sequelize.query(maxIdQuery, {
            type: 'SELECT'
        }) as any[];

        const nextId = (maxIdResult[0]?.maxId || 0) + 1;

        const preparedData = {
            ...normalizedBody,
            Para_Data_Type_Id: nextId
        };

        const validation = validateWithZod<ParametDataTypeCreate>(
            ParametDataTypeCreationSchema,
            preparedData
        );

        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const { Para_Data_Type, Para_Display_Name } = validation.data!;

        // INSERT using raw query
        const insertQuery = `
            INSERT INTO tbl_Paramet_Data_Type 
            (Para_Data_Type_Id, Para_Data_Type, Para_Display_Name)
            VALUES (?, ?, ?)
        `;

        await sequelize.query(insertQuery, {
            replacements: [nextId, Para_Data_Type, Para_Display_Name || null]
        });

        // Get the inserted record
        const getInsertedQuery = `
            SELECT * FROM tbl_Paramet_Data_Type 
            WHERE Para_Data_Type_Id = ?
        `;

        const insertedRecord = await sequelize.query(getInsertedQuery, {
            replacements: [nextId],
            type: 'SELECT'
        }) as any[];

        return created(res, insertedRecord[0], 'Parameter Data Type created successfully');

    } catch (error) {
        console.error('Error creating parameter data type:', error);
        return servError(error, res);
    }
};

export const updateParametDataType = async (req: Request, res: Response) => {
    try {
        const idValidation = validateWithZod<{ id: number }>(parametDataTypeIdSchema, req.params);
        
        if (!idValidation.success) {
            return res.status(400).json({
                success: false,
                message: 'Invalid ID parameter',
                errors: idValidation.errors
            });
        }

        const { id } = idValidation.data!;

        // Check if record exists
        const checkExistsQuery = `
            SELECT Para_Data_Type, Para_Display_Name 
            FROM tbl_Paramet_Data_Type 
            WHERE Para_Data_Type_Id = ?
        `;
        
        const existingRecord = await sequelize.query(checkExistsQuery, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        if (existingRecord.length === 0) {
            return notFound(res, 'Parameter Data Type not found');
        }

        const currentRecord = existingRecord[0];

        // Check for duplicate Para_Data_Type (excluding current record)
        if (req.body.Para_Data_Type && req.body.Para_Data_Type.trim() !== currentRecord.Para_Data_Type) {
            const checkDuplicateQuery = `
                SELECT Para_Data_Type_Id 
                FROM tbl_Paramet_Data_Type 
                WHERE UPPER(Para_Data_Type) = UPPER(?) AND Para_Data_Type_Id != ?
            `;
            
            const duplicate = await sequelize.query(checkDuplicateQuery, {
                replacements: [req.body.Para_Data_Type.trim(), id],
                type: 'SELECT'
            }) as any[];

            if (duplicate.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Another Parameter Data Type with this name already exists',
                    field: 'Para_Data_Type'
                });
            }
        }

        const validation = validateWithZod<ParametDataTypeUpdate>(ParametDataTypeUpdateSchema, req.body);
        
        if (!validation.success) {
            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: validation.errors
            });
        }

        const validatedBody = validation.data!;

        // Build UPDATE query dynamically based on provided fields
        const updateFields: string[] = [];
        const updateValues: any[] = [];

        if (validatedBody.Para_Data_Type !== undefined) {
            updateFields.push('Para_Data_Type = ?');
            updateValues.push(validatedBody.Para_Data_Type);
        }

        if (validatedBody.Para_Display_Name !== undefined) {
            updateFields.push('Para_Display_Name = ?');
            updateValues.push(validatedBody.Para_Display_Name);
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
            UPDATE tbl_Paramet_Data_Type 
            SET ${updateFields.join(', ')}
            WHERE Para_Data_Type_Id = ?
        `;

        await sequelize.query(updateQuery, {
            replacements: updateValues
        });

        // Get updated record
        const getUpdatedQuery = `
            SELECT * FROM tbl_Paramet_Data_Type 
            WHERE Para_Data_Type_Id = ?
        `;

        const updatedRecord = await sequelize.query(getUpdatedQuery, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        updated(res, updatedRecord[0], 'Parameter Data Type updated successfully');

    } catch (e) {
        console.error('Error updating parameter data type:', e);
        servError(e, res);
    }
};

export const deleteParametDataType = async (req: Request, res: Response) => {
    try {
        const validation = validateWithZod<{ id: number }>(parametDataTypeIdSchema, req.params);
        
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
            SELECT Para_Data_Type_Id 
            FROM tbl_Paramet_Data_Type 
            WHERE Para_Data_Type_Id = ?
        `;
        
        const existingRecord = await sequelize.query(checkExistsQuery, {
            replacements: [id],
            type: 'SELECT'
        }) as any[];

        if (existingRecord.length === 0) {
            return notFound(res, 'Parameter Data Type not found');
        }

        // DELETE using raw query
        const deleteQuery = `
            DELETE FROM tbl_Paramet_Data_Type 
            WHERE Para_Data_Type_Id = ?
        `;

        await sequelize.query(deleteQuery, {
            replacements: [id]
        });

        deleted(res, 'Parameter Data Type deleted successfully');

    } catch (e) {
        console.error('Error deleting parameter data type:', e);
        servError(e, res);
    }
};

export const getAllActiveParametDataTypes = async (req: Request, res: Response) => {
    try {
        const query = `
            SELECT 
                Para_Data_Type_Id,
                Para_Data_Type,
                Para_Display_Name
            FROM tbl_Paramet_Data_Type
            ORDER BY Para_Data_Type ASC
        `;

        const rows = await sequelize.query(query, {
            type: 'SELECT'
        }) as any[];

        sentData(res, rows);

    } catch (e) {
        console.error('Error fetching active parameter data types:', e);
        servError(e, res);
    }
};