import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'Project_Employee';

export interface TaskAssignAttributes {
    Id: number;
    Project_Id: number;
    User_Id?: number;
}

type TaskAssignCreationAttributes = Optional<TaskAssignAttributes, 'Id'>;

export class TaskAssign_Master
    extends Model<TaskAssignAttributes, TaskAssignCreationAttributes>
    implements TaskAssignAttributes {

    declare Id: number;
    declare Project_Id: number;
    declare User_Id: number;
}


export const taskAssignCreationSchema = z.object({
    Project_Id: z.coerce.number()
        .int()
        .min(1)
        .nullable()
        .optional()
        .default(null),


});

export const taskAssignUpdateSchema = z.object({

    Project_Id: z.coerce.number()
        .int()
        .min(1)
        .nullable()
        .optional(),
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
    sortBy: z.enum(['Id', 'User_Id', 'Project_Id'])
        .default('Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});

export const taskTypeIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid ID is required')
});

export type TaskTypeCreateInput = z.infer<typeof taskAssignCreationSchema>;
export type TaskTypeUpdateInput = z.infer<typeof taskAssignUpdateSchema>;
export type TaskTypeQueryParams = z.infer<typeof taskTypeQuerySchema>;

// Initialize the model
TaskAssign_Master.init(
    {
        Id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Task_Type_Id'
        },
        User_Id: {
            type: DataTypes.STRING(250),
            allowNull: false,
            field: 'Task_Type',
            validate: {
                notEmpty: true
            }
        },

        Project_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Id',
            validate: {
                min: 1
            }
        }
    },
    {
        sequelize,
        tableName: 'tbl_Project_Employee',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            attributes: { exclude: [] }
        }
    }
);

export const taskTypeAccKey = {
    id: `${modelName}.Id`,
    Project_Id: `${modelName}.Project_Id`,
    User_Id: `${modelName}.User_Id`
};