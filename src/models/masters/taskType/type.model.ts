import { DataTypes, Model, Optional } from "sequelize";
import { sequelize } from "../../../config/sequalizer";
import { z } from 'zod'

const modelName = "TaskType_Master";

// Interface definitions
export interface TaskTypeAttributes {
    Task_Type_Id: number;
    Task_Type: string;
    Is_Reptative: number;
    Hours_Duration: number | null;
    Day_Duration: number | null;
    TT_Del_Flag: number;
    Project_Id: number | null;
    Est_StartTime: Date | null;
    Est_EndTime: Date | null;
    Status: number;
}

export type TaskTypeCreationAttributes = Optional<
    TaskTypeAttributes,
    "Task_Type_Id" | "TT_Del_Flag" | "Status" | "Hours_Duration" |
    "Day_Duration" | "Project_Id" | "Est_StartTime" | "Est_EndTime"
>;

export class TaskType_Master extends Model<TaskTypeAttributes, TaskTypeCreationAttributes>
    implements TaskTypeAttributes {

    public Task_Type_Id!: number;
    public Task_Type!: string;
    public Is_Reptative!: number;
    public Hours_Duration!: number | null;
    public Day_Duration!: number | null;
    public TT_Del_Flag!: number;
    public Project_Id!: number | null;
    public Est_StartTime!: Date | null;
    public Est_EndTime!: Date | null;
    public Status!: number;

    // Static method for getting active task types
    public static async getActiveTaskTypes(projectId?: number) {
        const whereClause: any = {
            TT_Del_Flag: 0,
            Status: 1
        };

        if (projectId) {
            whereClause.Project_Id = projectId;
        }

        return this.findAll({
            where: whereClause,
            order: [['Task_Type', 'ASC']]
        });
    }
}

// Helper function for boolean/number validation
const validateBooleanNumber = (val: any): number => {
    if (typeof val === 'boolean') return val ? 1 : 0;
    if (typeof val === 'number') return val === 1 ? 1 : 0;
    if (typeof val === 'string') {
        return val === 'true' || val === '1' ? 1 : 0;
    }
    return 0;
};

// Zod schemas for validation
export const taskTypeCreateSchema = z.object({
    Task_Type: z.string()
        .min(1, "Task Type name is required")
        .max(250, 'Task Type name must be at most 250 characters')
        .trim(),
    Is_Reptative: z.union([z.number(), z.boolean(), z.string()])
        .transform(val => validateBooleanNumber(val))
        .refine(val => val === 0 || val === 1, {
            message: "Is_Reptative must be 0 or 1"
        })
        .default(0),
    Hours_Duration: z.union([z.number(), z.string(), z.null()])
        .transform(val => {
            if (val === null || val === undefined || val === '' || val === 'null') return null;
            if (typeof val === 'string') {
                const num = Number(val);
                return isNaN(num) ? null : Math.max(0, num);
            }
            return Math.max(0, val);
        })
        .refine(val => val === null || (typeof val === 'number' && val >= 0), {
            message: "Hours_Duration must be null or a positive number"
        })
        .optional()
        .default(null),
    Day_Duration: z.union([z.number(), z.string(), z.null()])
        .transform(val => {
            if (val === null || val === undefined || val === '' || val === 'null') return null;
            if (typeof val === 'string') {
                const num = Number(val);
                return isNaN(num) ? null : Math.max(0, num);
            }
            return Math.max(0, val);
        })
        .refine(val => val === null || (typeof val === 'number' && val >= 0), {
            message: "Day_Duration must be null or a positive number"
        })
        .optional()
        .default(null),
    Project_Id: z.union([z.number(), z.string(), z.null()])
        .transform(val => {
            if (val === null || val === undefined || val === '' || val === 'null') return null;
            if (typeof val === 'string') {
                const num = Number(val);
                return isNaN(num) ? null : Math.floor(num);
            }
            return Math.floor(val);
        })
        .refine(val => val === null || (typeof val === 'number' && val > 0), {
            message: "Project_Id must be null or a positive integer"
        })
        .optional()
        .default(null),
    Est_StartTime: z.union([z.string(), z.date(), z.null()])
        .transform(val => {
            if (val === null || val === undefined || val === '' || val === 'null') return null;
            if (val instanceof Date) return val;
            if (typeof val === 'string') {
                const date = new Date(val);
                return isNaN(date.getTime()) ? null : date;
            }
            return null;
        })
        .refine(val => val === null || val instanceof Date, {
            message: "Invalid date format for Est_StartTime"
        })
        .optional()
        .default(null),
    Est_EndTime: z.union([z.string(), z.date(), z.null()])
        .transform(val => {
            if (val === null || val === undefined || val === '' || val === 'null') return null;
            if (val instanceof Date) return val;
            if (typeof val === 'string') {
                const date = new Date(val);
                return isNaN(date.getTime()) ? null : date;
            }
            return null;
        })
        .refine(val => val === null || val instanceof Date, {
            message: "Invalid date format for Est_EndTime"
        })
        .optional()
        .default(null),
}).refine(data => {
    // Validate time range if both dates are provided
    if (data.Est_StartTime && data.Est_EndTime) {
        return data.Est_EndTime > data.Est_StartTime;
    }
    return true;
}, {
    message: "End time must be after start time",
    path: ["Est_EndTime"]
});

export const taskTypeUpdateSchema = taskTypeCreateSchema.partial().extend({
    Status: z.union([z.number(), z.boolean(), z.string()])
        .transform(val => validateBooleanNumber(val))
        .refine(val => val === 0 || val === 1, {
            message: "Status must be 0 or 1"
        })
        .optional(),
    TT_Del_Flag: z.union([z.number(), z.boolean(), z.string()])
        .transform(val => validateBooleanNumber(val))
        .refine(val => val === 0 || val === 1, {
            message: "TT_Del_Flag must be 0 or 1"
        })
        .optional(),
});

// Query parameter schema for GET requests
export const taskTypeQuerySchema = z.object({
    page: z.string()
        .optional()
        .default("1")
        .transform(val => {
            const num = parseInt(val);
            return isNaN(num) || num < 1 ? 1 : num;
        }),
    limit: z.string()
        .optional()
        .default("20")
        .transform(val => {
            const num = parseInt(val);
            return isNaN(num) || num < 1 ? 20 : Math.min(num, 100);
        }),
    search: z.string()
        .optional()
        .transform(val => val?.trim()),
    projectId: z.string()
        .optional()
        .transform(val => {
            if (!val) return undefined;
            const num = parseInt(val);
            return isNaN(num) ? undefined : num;
        }),
    status: z.enum(['0', '1', 'all'])
        .optional()
        .default('1'),
    ttDelFlag: z.enum(['0', '1', 'all'])
        .optional()
        .default('0'),
    isReptative: z.enum(['0', '1'])
        .optional()
        .transform(val => val === '1' ? '1' : '0'),
    sortBy: z.enum(['Task_Type_Id', 'Task_Type', 'Project_Id'])
        .optional()
        .default('Task_Type_Id'),
    // sortOrder: z.enum(['ASC', 'DESC', 'asc', 'desc'])
    //     .optional()
    //     .transform(val => val.toUpperCase() as 'ASC' | 'DESC')
    //     .default('ASC'),
});

// Schema for ID parameter validation
export const taskTypeIdSchema = z.object({
    id: z.string()
        .min(1, "ID is required")
        .refine(val => !isNaN(Number(val)) && Number(val) > 0, {
            message: "ID must be a positive number"
        })
        .transform(val => parseInt(val)),
});

// Type inference
export type TaskTypeCreateInput = z.infer<typeof taskTypeCreateSchema>;
export type TaskTypeUpdateInput = z.infer<typeof taskTypeUpdateSchema>;
export type TaskTypeQueryParams = z.infer<typeof taskTypeQuerySchema>;

// Model initialization (matching your exact table structure)
TaskType_Master.init({
    Task_Type_Id: {
        type: DataTypes.INTEGER,
        primaryKey: true,
        autoIncrement: true,
        field: 'Task_Type_Id'
    },
    Task_Type: {
        type: DataTypes.STRING(250),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: "Task Type name cannot be empty"
            }
        },
        field: 'Task_Type'
    },
    Is_Reptative: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Is_Reptative must be 0 or 1"
            }
        },
        field: 'Is_Reptative'
    },
    Hours_Duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'Hours_Duration'
    },
    Day_Duration: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'Day_Duration'
    },
    TT_Del_Flag: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 0,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "TT_Del_Flag must be 0 or 1"
            }
        },
        field: 'TT_Del_Flag'
    },
    Project_Id: {
        type: DataTypes.INTEGER,
        allowNull: true,
        defaultValue: null,
        field: 'Project_Id'
    },
    Est_StartTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'Est_StartTime'
    },
    Est_EndTime: {
        type: DataTypes.DATE,
        allowNull: true,
        defaultValue: null,
        field: 'Est_EndTime'
    },
    Status: {
        type: DataTypes.INTEGER,
        allowNull: false,
        defaultValue: 1,
        validate: {
            isIn: {
                args: [[0, 1]],
                msg: "Status must be 0 or 1"
            }
        },
        field: 'Status'
    }
}, {
    sequelize,
    modelName: modelName,
    tableName: "TaskType_Master",
    timestamps: false, // Your table doesn't have timestamps based on data
    indexes: [
        {
            unique: true,
            fields: ['Task_Type'],
            name: 'unique_tasktype'
        },
        {
            fields: ['TT_Del_Flag'],
            name: 'idx_del_flag'
        },
        {
            fields: ['Status'],
            name: 'idx_status'
        }
    ],
    hooks: {
        beforeCreate: (taskType: TaskType_Master) => {
            // Ensure default values
            if (taskType.TT_Del_Flag === undefined) {
                taskType.TT_Del_Flag = 0;
            }
            if (taskType.Status === undefined) {
                taskType.Status = 1;
            }
            if (taskType.Is_Reptative === undefined) {
                taskType.Is_Reptative = 0;
            }
        }
    }
});