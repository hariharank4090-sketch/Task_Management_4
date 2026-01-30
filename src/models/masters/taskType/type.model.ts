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
        .min(0, 'Is_Reptative must be 0 or 1')
        .max(1, 'Is_Reptative must be 0 or 1')
        .default(0),
    Hours_Duration: z.coerce.number()
        .int()
        .min(0, 'Hours Duration cannot be negative')
        .nullable()
        .optional()
        .default(null),
    Day_Duration: z.coerce.number()
        .int()
        .min(0, 'Day Duration cannot be negative')
        .nullable()
        .optional()
        .default(null),
    Project_Id: z.coerce.number()
        .int()
        .min(1, 'Project ID must be positive')
        .nullable()
        .optional()
        .default(null),
    Company_id: z.coerce.number()
        .int()
        .min(1, 'Company ID must be positive')
        .nullable()
        .optional()
        .default(null),
    Status: z.coerce.number()
        .int()
        .min(0, 'Status must be 0 or 1')
        .max(1, 'Status must be 0 or 1')
        .default(1)
});

export const taskTypeUpdateSchema = z.object({
    Task_Type: z.string()
        .max(250, 'Task Type cannot exceed 250 characters')
        .trim()
        .optional(),
    Is_Reptative: z.coerce.number()
        .int()
        .min(0, 'Is_Reptative must be 0 or 1')
        .max(1, 'Is_Reptative must be 0 or 1')
        .optional(),
    Hours_Duration: z.coerce.number()
        .int()
        .min(0, 'Hours Duration cannot be negative')
        .nullable()
        .optional(),
    Day_Duration: z.coerce.number()
        .int()
        .min(0, 'Day Duration cannot be negative')
        .nullable()
        .optional(),
    Project_Id: z.coerce.number()
        .int()
        .min(1, 'Project ID must be positive')
        .nullable()
        .optional(),
    Company_id: z.coerce.number()
        .int()
        .min(1, 'Company ID must be positive')
        .nullable()
        .optional(),
    Status: z.coerce.number()
        .int()
        .min(0, 'Status must be 0 or 1')
        .max(1, 'Status must be 0 or 1')
        .optional(),
    TT_Del_Flag: z.coerce.number()
        .int()
        .min(0, 'TT_Del_Flag must be 0 or 1')
        .max(1, 'TT_Del_Flag must be 0 or 1')
        .optional()
});

export const taskTypeQuerySchema = z.object({
    projectId: z.coerce.number()
        .int()
        .positive('Project ID must be positive')
        .nullable()
        .optional(),
    companyId: z.coerce.number()
        .int()
        .positive('Company ID must be positive')
        .nullable()
        .optional(),
    status: z.enum(['0', '1', 'all'])
        .default('1'),
    ttDelFlag: z.enum(['0', '1', 'all'])
        .default('0'),
    isReptative: z.enum(['0', '1'])
        .optional(),
    sortBy: z.enum([
        'Task_Type_Id', 
        'Task_Type', 
        'Project_Id', 
        'Company_id', 
        'Entry_Date', 
        'Status'
    ])
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

// Initialize the model with ALL fields properly defined
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
                notEmpty: {
                    msg: 'Task Type is required'
                }
            }
        },
        Is_Reptative: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'Is_Reptative',
            validate: {
                min: 0,
                max: 1,
                isIn: {
                    args: [[0, 1]],
                    msg: 'Is_Reptative must be 0 or 1'
                }
            }
        },
        Hours_Duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Hours_Duration',
            validate: {
                min: {
                    args: [0],
                    msg: 'Hours_Duration cannot be negative'
                }
            }
        },
        Day_Duration: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Day_Duration',
            validate: {
                min: {
                    args: [0],
                    msg: 'Day_Duration cannot be negative'
                }
            }
        },
        TT_Del_Flag: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 0,
            field: 'TT_Del_Flag',
            validate: {
                min: 0,
                max: 1,
                isIn: {
                    args: [[0, 1]],
                    msg: 'TT_Del_Flag must be 0 or 1'
                }
            }
        },
        Project_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Id',
            validate: {
                min: {
                    args: [1],
                    msg: 'Project_Id must be positive'
                }
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
                max: 1,
                isIn: {
                    args: [[0, 1]],
                    msg: 'Status must be 0 or 1'
                }
            }
        },
        // Add missing fields that are typically in master tables
       
    
    },
    {
        sequelize,
        tableName: 'tbl_Task_Type',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        // Remove or modify default scope to be more flexible
        defaultScope: {
            where: {
                TT_Del_Flag: 0
            }
        },
        scopes: {
            active: {
                where: {
                    TT_Del_Flag: 0,
                    Status: 1
                }
            },
            deleted: {
                where: {
                    TT_Del_Flag: 1
                }
            },
            byCompany: (companyId: number) => ({
                where: {
                    Company_id: companyId,
                    TT_Del_Flag: 0
                }
            }),
            byProject: (projectId: number) => ({
                where: {
                    Project_Id: projectId,
                    TT_Del_Flag: 0
                }
            })
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
    Status: `${modelName}.Status`,

};


TaskType_Master.prototype.toJSON = function () {
    const values = Object.assign({}, this.get());
    

    delete values.TT_Del_Flag;
 
    
    return values;
};



export default TaskType_Master;