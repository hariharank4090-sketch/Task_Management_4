import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'Process_Master';

export interface ProcessMasterAttributes {
    Id: number;
    Process_Name: string;
}

type ProcessMasterCreationAttributes = Optional<ProcessMasterAttributes, 'Id'>;

export class Process_Master
    extends Model<ProcessMasterAttributes, ProcessMasterCreationAttributes>
    implements ProcessMasterAttributes {

    declare Id: number;
    declare Process_Name: string;
 
}

// CORRECTED Zod schemas
export const  processMasterCreateSchema= z.object({
    Process_Name: z.string()
        .min(1, 'Process_Name is required')
        .max(250, 'Process_Name cannot exceed 250 characters')
        .trim(),
    Id: z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .default(0),
});

export const processMasterUpdateSchema = z.object({
     Process_Name: z.string()
        .min(1, 'Process_Name is required')
        .max(250, 'Process_Name cannot exceed 250 characters')
        .trim(),
    Id: z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .default(0),
});

export const processMasterQuerySchema = z.object({
    page: z.coerce.number()
        .int()
        .positive()
        .default(1),
    limit: z.coerce.number()
        .int()
        .min(1)
        .max(100)
        .default(20),
    search: z.string().optional(),
    Id: z.coerce.number()
        .int()
        .positive()
        .optional(),
    sortBy: z.enum(['Id',])
        .default('Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});
 

export const processMasterIdSchema = z.object({
    Id: z.coerce.number()
        .int()
        .positive('Valid ID is required')
});

export type ProcessMasterCreateInput = z.infer<typeof processMasterCreateSchema>;
export type ProcessMasterUpdateInput = z.infer<typeof processMasterUpdateSchema>;
export type ProcessMasterQueryParams = z.infer<typeof processMasterQuerySchema>;

// Initialize the model
Process_Master.init(
    {
        Id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Id'
        },
        Process_Name: {
            type: DataTypes.STRING(250),
            allowNull: false,
            field: 'Process_Name',
            validate: {
                notEmpty: true
            }
        },
    },
    {
        sequelize,
        tableName: 'tbl_Process_Master',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
           
            attributes: { exclude: [] }
        }
    }
);

export const taskTypeAccKey = {
    Id: `${modelName}.Id`,
    Process_Name: `${modelName}.Process_Name`,
   
};