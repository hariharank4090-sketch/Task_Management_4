// models/masters/taskParamType/paramMaster.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'Param_Master';

export interface ParamMasterAttributes {
    Paramet_Id: number;
    Paramet_Name: string;
    Paramet_Data_Type: number | null;
    Company_id: number | null;
    Del_Flag: number;
}

type ParamMasterCreationAttributes = Optional<ParamMasterAttributes, 'Paramet_Id'>;

export class ParamMaster
    extends Model<ParamMasterAttributes, ParamMasterCreationAttributes>
    implements ParamMasterAttributes {
    
    declare Paramet_Id: number;
    declare Paramet_Name: string;
    declare Paramet_Data_Type: number | null;
    declare Company_id: number | null;
    declare Del_Flag: number;
}

// Zod schemas for validation
export const ParamMasterCreationSchema = z.object({
    Paramet_Name: z.string()
        .min(1, 'Paramet_Name is required')
        .max(250, 'Paramet_Name cannot exceed 250 characters')
        .trim(),
    Paramet_Data_Type: z.coerce.number()
        .int()
        .nullable()
        .optional(),
    Company_id: z.coerce.number()
        .int()
        .nullable()
        .optional()
});

export const ParamMasterUpdateSchema = z.object({
    Paramet_Name: z.string()
        .max(250, 'Paramet_Name cannot exceed 250 characters')
        .trim()
        .optional(),
    Paramet_Data_Type: z.coerce.number()
        .int()
        .nullable()
        .optional(),
    Company_id: z.coerce.number()
        .int()
        .nullable()
        .optional(),
    Del_Flag: z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .optional()
});

// In paramMaster.model.ts, update the ParamMasterQuerySchema:
export const ParamMasterQuerySchema = z.object({
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
    companyId: z.coerce.number()
        .int()
        .positive()
        .optional(),
    // Accept both old and new field names
    sortBy: z.enum([
        'Paramet_Id', 'Paramet_Name', 'Paramet_Data_Type', 'Company_id',
        // Old field names for backward compatibility
        'Para_Data_Type_Id', 'Para_Data_Type', 'Para_Display_Name'
    ])
    .transform((value) => {
        // Map old field names to new ones
        const fieldMap: Record<string, string> = {
            'Para_Data_Type_Id': 'Paramet_Id',
            'Para_Data_Type': 'Paramet_Name',
            'Para_Display_Name': 'Paramet_Data_Type'
        };
        return fieldMap[value] || value;
    })
    .default('Paramet_Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});

export const paramMasterIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid ID is required')
});

// TypeScript types from Zod schemas
export type ParamMasterCreate = z.infer<typeof ParamMasterCreationSchema>;
export type ParamMasterUpdate = z.infer<typeof ParamMasterUpdateSchema>;
export type ParamMasterQuery = z.infer<typeof ParamMasterQuerySchema>;

// Initialize the model
ParamMaster.init(
    {
        Paramet_Id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            primaryKey: true,
            field: 'Paramet_Id'
        },
        Paramet_Name: {
            type: DataTypes.STRING(250),
            allowNull: false,
            field: 'Paramet_Name',
            validate: {
                notEmpty: true
            }
        },
        Paramet_Data_Type: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Paramet_Data_Type'
        },
        Company_id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Company_id'
        },
        Del_Flag: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
            field: 'Del_Flag',
            validate: {
                min: 0,
                max: 1
            }
        }
    },
    {
        sequelize,
        tableName: 'tbl_Paramet_Master',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            where: {
                Del_Flag: 0
            }
        }
    }
);

export const paramMasterAccKey = {
    Paramet_Id: `${modelName}.Paramet_Id`,
    Paramet_Name: `${modelName}.Paramet_Name`,
    Paramet_Data_Type: `${modelName}.Paramet_Data_Type`,
    Company_id: `${modelName}.Company_id`,
    Del_Flag: `${modelName}.Del_Flag`
};

export default ParamMaster;