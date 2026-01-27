import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'TaskType_Master';

export interface TaskTypeAttributes {
    Task_Type_Id: number;
    Task_Type: string;
    Is_Reptative?: number | null;
    Hours_Duration?: number | null;
    Day_Duration?: number | null;
    TT_Del_Flag?: number | null;
    Project_Id?: number | null;
    Est_StartTime?: Date | null;
    Est_EndTime?: Date | null;
    Status?: number | null;
}

type TaskTypeCreationAttributes = Optional<TaskTypeAttributes, 'Task_Type_Id'>;

export class TaskType_Master
    extends Model<TaskTypeAttributes, TaskTypeCreationAttributes>
    implements TaskTypeAttributes {

    declare Task_Type_Id: number;
    declare Task_Type: string;
    declare Is_Reptative: number | null;
    declare Hours_Duration: number | null;
    declare Day_Duration: number | null;
    declare TT_Del_Flag: number | null;
    declare Project_Id: number | null;
    declare Est_StartTime: Date | null;
    declare Est_EndTime: Date | null;
    declare Status: number | null;
}

// CORRECTED Zod schemas
export const taskTypeCreateSchema = z.object({
    Task_Type: z.string()
        .min(1, 'Task Type is required')
        .max(250, 'Task Type cannot exceed 250 characters')
        .trim(),
    Is_Reptative: z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .default(0),
    Hours_Duration: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional()
        .default(null),
    Day_Duration: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional()
        .default(null),
    Project_Id: z.coerce.number()
        .int()
        .min(1)
        .nullable()
        .optional()
        .default(null),
  
  
});

export const taskTypeUpdateSchema = z.object({
    Task_Type: z.string()
        .max(250, 'Task Type cannot exceed 250 characters')
        .trim()
        .optional(),
    Is_Reptative: z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .optional(),
    Hours_Duration: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional(),
    Day_Duration: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional(),
    Project_Id: z.coerce.number()
        .int()
        .min(1)
        .nullable()
        .optional(),
   
    Status: z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .optional()
});

export const taskTypeQuerySchema = z.object({
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
    projectId: z.coerce.number()
        .int()
        .positive()
        .optional(),
    status: z.enum(['0', '1', 'all'])
        .default('1'),
    ttDelFlag: z.enum(['0', '1', 'all'])
        .default('0'),
    isReptative: z.enum(['0', '1'])
        .optional(),
    sortBy: z.enum(['Task_Type_Id', 'Task_Type', 'Project_Id'])
        .default('Task_Type_Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});

export const taskTypeIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid ID is required')
});

export type TaskTypeCreateInput = z.infer<typeof taskTypeCreateSchema>;
export type TaskTypeUpdateInput = z.infer<typeof taskTypeUpdateSchema>;
export type TaskTypeQueryParams = z.infer<typeof taskTypeQuerySchema>;

// Initialize the model
TaskType_Master.init(
    {
        Task_Type_Id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Task_Type_Id'
        },
        
        Task_Type: {
            type: DataTypes.STRING(250),
            allowNull: false,
            field: 'Task_Type',
            validate: {
                notEmpty: true
            }
        },
        Is_Reptative: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'Is_Reptative',
            validate: {
                min: 0,
                max: 1
            }
        },
        Hours_Duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Hours_Duration',
            validate: {
                min: 0
            }
        },
        Day_Duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Day_Duration',
            validate: {
                min: 0
            }
        },
        TT_Del_Flag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'TT_Del_Flag',
            validate: {
                min: 0,
                max: 1
            }
        },
        Project_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Id',
            validate: {
                min: 1
            }
        },
        Est_StartTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'Est_StartTime'
        },
        Est_EndTime: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'Est_EndTime'
        },
        Status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            field: 'Status',
            validate: {
                min: 0,
                max: 1
            }
        }
    },
    {
        sequelize,
        tableName: 'tbl_Task_Type',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            where: {
                TT_Del_Flag: 0,
                Status: 1
            },
            attributes: { exclude: [] }
        }
    }
);

export const taskTypeAccKey = {
    id: `${modelName}.Task_Type_Id`,
    Task_Type: `${modelName}.Task_Type`,
    Is_Reptative: `${modelName}.Is_Reptative`,
    Hours_Duration: `${modelName}.Hours_Duration`,
    Day_Duration: `${modelName}.Day_Duration`,
    TT_Del_Flag: `${modelName}.TT_Del_Flag`,
    Project_Id: `${modelName}.Project_Id`,
    Est_StartTime: `${modelName}.Est_StartTime`,
    Est_EndTime: `${modelName}.Est_EndTime`,
    Status: `${modelName}.Status`
};