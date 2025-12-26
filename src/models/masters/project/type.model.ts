import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'Project_Master';

export interface ProjectMasterAttributes {
    Project_Id: number;
    Project_Name: string;
    Project_Desc: string | null;
    Company_Id?: number | null;
    Project_Head?: number | null;
    Est_Start_Dt?: Date | null;
    Est_End_Dt?: Date | null;
    Project_Status?: number | null;
    Entry_By?: number | null;
    Entry_Date?: Date | null;
    Updated_By?: number | null;
    Updated_Date?: Date | null;
    IsActive?: number | null;
}

type ProjectMasterCreationAttributes = Optional<ProjectMasterAttributes, 'Project_Id'>;

export class Project_Master
    extends Model<ProjectMasterAttributes, ProjectMasterCreationAttributes>
    implements ProjectMasterAttributes {

    declare Project_Id: number;
    declare Project_Name: string;
    declare Project_Desc: string | null;
    declare Company_Id: number | null;
    declare Project_Head: number | null;
    declare Est_Start_Dt: Date | null;
    declare Est_End_Dt: Date | null;
    declare Project_Status: number | null;
    declare Entry_By: number | null;
    declare Entry_Date: Date | null;
    declare IsActive: number | null;
}

// CORRECTED Zod schemas
export const projectMasterCreationSchema = z.object({
    Project_Name: z.string()
        .min(1, 'Project_Name is required')
        .max(250, 'Project_Name cannot exceed 250 characters')
        .trim(),
    Project_Desc: z.string()
        .nullable()
        .optional(),
    Company_Id: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional()
        .default(null),
    Project_Head: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional()
        .default(null),
    Est_Start_Dt: z.coerce.date()
        .nullable()
        .optional()
        .default(null),
    Est_End_Dt: z.coerce.date()
        .nullable()
        .optional()
        .default(null),
    Project_Status: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional()
        .default(null)
});

export const projectMasterUpdateSchema = z.object({
    Project_Name: z.string()
        .max(250, 'Project cannot exceed 250 characters')
        .trim()
        .optional(),
    Project_Desc: z.string()
        .nullable()
        .optional(),
    Company_Id: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional(),
    Project_Head: z.coerce.number()
        .int()
        .min(0)
        .nullable()
        .optional(),
    Est_Start_Dt: z.coerce.date()
        .nullable()
        .optional(),
    Est_End_Dt: z.coerce.date()
        .nullable()
        .optional(),
    Project_Status: z.coerce.number()
        .int()
        .min(0)
        .max(1)
        .optional()
});

export const projectMasterQuerySchema = z.object({
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
    Project_Status: z.enum(['0', '1', 'all'])
        .default('all'),
    sortBy: z.enum(['Project_Id', 'Project_Name', 'Est_Start_Dt', 'Est_End_Dt'])
        .default('Project_Id'),
    sortOrder: z.enum(['ASC', 'DESC'])
        .default('ASC')
});

export const projectIdSchema = z.object({
    id: z.coerce.number()
        .int()
        .positive('Valid ID is required')
});

export type ProjectMasterCreate = z.infer<typeof projectMasterCreationSchema>;
export type ProjectMasterUpdate = z.infer<typeof projectMasterUpdateSchema>;
export type ProjectMasterQuery = z.infer<typeof projectMasterQuerySchema>;

// Initialize the model
Project_Master.init(
    {
        Project_Id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
            field: 'Project_Id'
        },
        Project_Name: {
            type: DataTypes.STRING(250),
            allowNull: false,
            field: 'Project_Name',
            validate: {
                notEmpty: true
            }
        },
        Project_Desc: {
            type: DataTypes.TEXT,
            allowNull: true,
            field: 'Project_Desc'
        },
        Company_Id: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Company_Id'
        },
        Project_Head: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Project_Head'
        },
        Est_Start_Dt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'Est_Start_Dt'
        },
        Est_End_Dt: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'Est_End_Dt'
        },
        Project_Status: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            field: 'Project_Status',
            validate: {
                min: 0,
                max: 1
            }
        },
        Entry_By: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'Entry_By'
        },
        Entry_Date: {
            type: DataTypes.DATE,
            allowNull: true,
            field: 'Entry_Date',
            defaultValue: DataTypes.NOW
        },
        IsActive: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
            field: 'IsActive',
            validate: {
                min: 0,
                max: 1
            }
        }
    },
    {
        sequelize,
        tableName: 'tbl_Project_Master',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            where: {
                IsActive: 1
            }
        }
    }
);

export const projectMasterAccKey = {
    Project_Id: `${modelName}.Project_Id`,
    Project_Name: `${modelName}.Project_Name`,
    Project_Desc: `${modelName}.Project_Desc`,
    Company_Id: `${modelName}.Company_Id`,
    Project_Head: `${modelName}.Project_Head`,
    Est_Start_Dt: `${modelName}.Est_Start_Dt`,
    Est_End_Dt: `${modelName}.Est_End_Dt`,
    Project_Status: `${modelName}.Project_Status`,
    Entry_By: `${modelName}.Entry_By`,
    Entry_Date: `${modelName}.Entry_Date`,
    IsActive: `${modelName}.IsActive`
};