// models/masters/taskParamType/paramMaster.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'Param_Master';


export interface ParametDataTypeAttributes {
    Para_Data_Type_Id: number;
    Para_Data_Type: string;
    Para_Display_Name: string | null;
}

type ParametDataTypeCreationAttributes = Optional<ParametDataTypeAttributes, 'Para_Data_Type_Id'>;

export class ParametDataType
    extends Model<ParametDataTypeAttributes, ParametDataTypeCreationAttributes>
    implements ParametDataTypeAttributes {
    
    declare Para_Data_Type_Id: number;
    declare Para_Data_Type: string;
    declare Para_Display_Name: string | null;
}


export const ParametDataTypeCreationSchema = z.object({
    Para_Data_Type: z.string()
        .min(1, 'Para_Data_Type is required')
        .max(250, 'Para_Data_Type cannot exceed 250 characters')
        .trim(),
    Para_Display_Name: z.string()
        .nullable()
        .optional()
});

export const ParametDataTypeUpdateSchema = z.object({
    Para_Data_Type: z.string()
        .max(250, 'Para_Data_Type cannot exceed 250 characters')  // Fixed error message
        .trim()
        .optional(),
    Para_Display_Name: z.string()
        .nullable()
        .optional()
});

export const ParametDataTypeQuerySchema = z.object({
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
    Para_Data_Type: z.string().optional(),  
    sortBy: z.enum(['Para_Data_Type', 'Para_Display_Name', 'Para_Data_Type_Id']) 
        .default('Para_Data_Type_Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});

export const parametDataTypeIdSchema = z.object({  
    id: z.coerce.number()
        .int()
        .positive('Valid ID is required')
});


export type ParametDataTypeCreate = z.infer<typeof ParametDataTypeCreationSchema>;
export type ParametDataTypeUpdate = z.infer<typeof ParametDataTypeUpdateSchema>;
export type ParametDataTypeQuery = z.infer<typeof ParametDataTypeQuerySchema>;


ParametDataType.init(  
    {
        Para_Data_Type_Id: { 
            type: DataTypes.INTEGER, 
            autoIncrement: true,
            primaryKey: true,
            field: 'Para_Data_Type_Id'
        },
        Para_Data_Type: {
            type: DataTypes.STRING(250),
            allowNull: false,
            field: 'Para_Data_Type',
            validate: {
                notEmpty: true
            }
        },
        Para_Display_Name: {
            type: DataTypes.STRING(250), 
            allowNull: true,
            field: 'Para_Display_Name'
        }
       
    },
    {
        sequelize,
        tableName: 'tbl_Paramet_Data_Type', 
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            where: {

            }
        }
    }
);

export const parametDataTypeAccKey = {  
    Para_Data_Type_Id: `${modelName}.Para_Data_Type_Id`,
    Para_Data_Type: `${modelName}.Para_Data_Type`,
    Para_Display_Name: `${modelName}.Para_Display_Name`
};