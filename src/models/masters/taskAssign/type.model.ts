// models/masters/taskAssign/type.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'Project_Employee';

export interface TaskAssignAttributes {
    Id: number;
    Project_Id: number;
    User_Id: number;
}

export type TaskAssignCreationAttributes = Optional<TaskAssignAttributes, 'Id'>;
export type TaskAssignUpdateAttributes = Partial<TaskAssignAttributes>;

export class TaskAssign_Master
    extends Model<TaskAssignAttributes, TaskAssignCreationAttributes>
    implements TaskAssignAttributes {

    declare Id: number;
    declare Project_Id: number;
    declare User_Id: number;
    Project: any;
    Employee: any;
}

// Zod schemas
export const taskAssignCreationSchema = z.object({
    Project_Id: z.coerce.number().int().positive("Project ID is required"),
    User_Id: z.coerce.number().int().positive("User ID is required")
});

export const taskAssignUpdateSchema = z.object({
    Project_Id: z.coerce.number().int().positive().optional(),
    User_Id: z.coerce.number().int().positive().optional()
});

export const taskAssignQuerySchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    projectId: z.coerce.number().int().positive().optional(),
    userId: z.coerce.number().int().positive().optional(),
    sortBy: z.enum(['Id', 'Project_Id', 'User_Id']).default('Id'),
    sortOrder: z.enum(['ASC', 'DESC']).default('ASC')
});

export const taskAssignIdSchema = z.object({
    id: z.coerce.number().int().positive('Valid ID is required')
});

export type TaskAssignCreateInput = z.infer<typeof taskAssignCreationSchema>;
export type TaskAssignUpdateInput = z.infer<typeof taskAssignUpdateSchema>;
export type TaskAssignQueryParams = z.infer<typeof taskAssignQuerySchema>;

// Initialize the model
TaskAssign_Master.init(
    {
        Id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Id'
        },
        Project_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Project_Id'
        },
        User_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'User_Id'
        }
    },
    {
        sequelize,
        tableName: 'tbl_Project_Employee',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true
    }
);







import { Project_Master } from '../project/type.model';
import { Employee_Master } from '../employee/type.model';

/* ================= ASSOCIATIONS ================= */

// Project_Employee → Project_Master

TaskAssign_Master.belongsTo(Project_Master, {
  foreignKey: 'Project_Id',
  targetKey: 'Project_Id',
  as: 'Project'
});

TaskAssign_Master.belongsTo(Employee_Master, {
  foreignKey: 'User_Id',
  targetKey: 'Emp_Id',
  as: 'Employee'
});


