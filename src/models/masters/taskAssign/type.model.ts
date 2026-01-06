// models/masters/taskAssign/type.model.ts
import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

const modelName = 'Project_Employee';

/* ================= TYPES ================= */

export interface TaskAssignAttributes {
  Id: number;
  Project_Id: number;
  User_Id: number;
}

export type TaskAssignCreationAttributes = Optional<TaskAssignAttributes, 'Id'>;
export type TaskAssignUpdateAttributes = Partial<TaskAssignAttributes>;

/* ================= MODEL ================= */

export class TaskAssign_Master
  extends Model<TaskAssignAttributes, TaskAssignCreationAttributes>
  implements TaskAssignAttributes {

  declare Id: number;
  declare Project_Id: number;
  declare User_Id: number;

  declare Project?: any;
  declare Employee?: any;
}

/* ================= ZOD SCHEMAS ================= */

// Create single assignment
export const taskAssignCreationSchema = z.object({
  Project_Id: z.coerce.number().int().positive(),
  User_Id: z.coerce.number().int().positive()
}).strict();

// Update single assignment
export const taskAssignUpdateSchema = z.object({
  Project_Id: z.coerce.number().int().positive().optional(),
  User_Id: z.coerce.number().int().positive().optional()
}).strict();

// Query params
export const taskAssignQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  search: z.string().optional(),
  projectId: z.coerce.number().int().positive().optional(),
  userId: z.coerce.number().int().positive().optional(),
  sortBy: z.enum(['Id', 'Project_Id', 'User_Id']).default('Id'),
  sortOrder: z.enum(['ASC', 'DESC']).default('ASC')
}).strict();

// ID param
export const taskAssignIdSchema = z.object({
  id: z.coerce.number().int().positive()
}).strict();

/* ================= BULK SCHEMAS ================= */

// ✅ BULK CREATE
export const taskAssignBulkCreateSchema = z.array(
  z.object({
    Project_Id: z.number().int().positive(),
    User_Id: z.number().int().positive()
  }).strict()
).min(1).max(100);

// ✅ BULK UPDATE (PROJECT → USERS REPLACEMENT)
export const taskAssignBulkUpdateSchema = z.array(
  z.object({
    Project_Id: z.number().int().positive(),
    User_Id: z.number().int().positive()  // matches your request
  })
).min(1, "At least one assignment is required");

/* ================= TYPES ================= */

export type TaskAssignCreateInput = z.infer<typeof taskAssignCreationSchema>;
export type TaskAssignUpdateInput = z.infer<typeof taskAssignUpdateSchema>;
export type TaskAssignQueryParams = z.infer<typeof taskAssignQuerySchema>;

export type TaskAssignBulkUpdateInput = z.infer<
  typeof taskAssignBulkUpdateSchema
>;

/* ================= SEQUELIZE INIT ================= */

TaskAssign_Master.init(
  {
    Id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true
    },
    Project_Id: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    User_Id: {
      type: DataTypes.INTEGER,
      allowNull: false
    }
  },
  {
    sequelize,
    tableName: 'tbl_Project_Employee',
    modelName,
    timestamps: false,
    freezeTableName: true
  }
);

/* ================= ASSOCIATIONS ================= */

import { Project_Master } from '../project/type.model';
import { Employee_Master } from '../employee/type.model';

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

// ✅ BULK DELETE SCHEMA
export const taskAssignBulkDeleteSchema = z.array(
  z.number().int().positive()
).min(1).max(100);
