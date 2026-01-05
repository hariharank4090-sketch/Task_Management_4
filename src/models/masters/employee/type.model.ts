import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from 'zod';

// Interface for Employee attributes
export interface EmployeeAttributes {
    Emp_Id: number;
    Branch: number;
    fingerPrintEmpId: number;
    Emp_Code: string;
    Emp_Name: string;
    Designation: number | string; 
    DOB: Date;
    DOJ: Date;
    Department_ID: number;
    Address_1: string;
    Address_2?: string | null;
    City: string;
    Country: string;
    Pincode: string;
    Mobile_No: string;
    Education?: string | null;
    Fathers_Name?: string | null;
    Mothers_Name?: string | null;
    Spouse_Name?: string | null;
    Sex: string;
    Emp_Religion?: string | null;
    Salary: number;
    Total_Loan: number;
    Salary_Advance: number;
    Due_Loan: number;
    User_Mgt_Id: number;
    Entry_By: number;
    Entry_Date: Date;
    Department?: string | null;
    Location?: string | null;
    IsActive?: number;
}

// Interface for creation attributes (optional ID)
export interface EmployeeCreationAttributes extends Optional<EmployeeAttributes, 'Emp_Id'> {}

// Interface for update attributes (all optional)
export interface EmployeeUpdateAttributes extends Partial<EmployeeAttributes> {}

// Interface for query parameters
export interface EmployeeQueryParams {
    page: number;
    limit: number;
    search?: string;
    branch?: string;
    departmentId?: string;
    designation?: string;
    isActive?: string;
    sortBy?: string;
    sortOrder?: 'ASC' | 'DESC';
}

// Zod schemas for validation
export const employeeIdSchema = z.object({
    id: z.coerce.number().int().positive()
});

export const employeeCreateSchema = z.object({
    Branch: z.coerce.number().int().min(1, "Branch is required"),
    fingerPrintEmpId: z.coerce.number().int().min(0).optional(),
    Emp_Code: z.string().min(1, "Employee Code is required").max(50),
    Emp_Name: z.string().min(1, "Employee Name is required").max(255),
    Designation: z.union([z.coerce.number().int(), z.string()]),
    DOB: z.coerce.date(),
    DOJ: z.coerce.date(),
    Department_ID: z.coerce.number().int().min(1, "Department ID is required"),
    Address_1: z.string().min(1, "Address 1 is required").max(255),
    Address_2: z.string().max(255).optional().nullable(),
    City: z.string().min(1, "City is required").max(100),
    Country: z.string().min(1, "Country is required").max(100),
    Pincode: z.string().min(1, "Pincode is required").max(20),
    Mobile_No: z.string().min(10, "Valid mobile number is required").max(15),
    Education: z.string().max(255).optional().nullable(),
    Fathers_Name: z.string().max(255).optional().nullable(),
    Mothers_Name: z.string().max(255).optional().nullable(),
    Spouse_Name: z.string().max(255).optional().nullable(),
    Sex: z.enum(['Male', 'Female', 'Other']),
    Emp_Religion: z.string().max(100).optional().nullable(),
    Salary: z.coerce.number().min(0, "Salary must be positive"),
    Total_Loan: z.coerce.number().min(0, "Total loan must be positive").optional().default(0),
    Salary_Advance: z.coerce.number().min(0, "Salary advance must be positive").optional().default(0),
    Due_Loan: z.coerce.number().min(0, "Due loan must be positive").optional().default(0),
    User_Mgt_Id: z.coerce.number().int().min(1, "User management ID is required"),
    Entry_By: z.coerce.number().int().min(1, "Entry by is required"),
    Department: z.string().max(100).optional().nullable(),
    Location: z.string().max(100).optional().nullable()
});

export const employeeUpdateSchema = z.object({
    Branch: z.coerce.number().int().min(1).optional(),
    fingerPrintEmpId: z.coerce.number().int().min(0).optional(),
    Emp_Code: z.string().min(1).max(50).optional(),
    Emp_Name: z.string().min(1).max(255).optional(),
    Designation: z.union([z.coerce.number().int(), z.string()]).optional(),
    DOB: z.coerce.date().optional(),
    DOJ: z.coerce.date().optional(),
    Department_ID: z.coerce.number().int().min(1).optional(),
    Address_1: z.string().min(1).max(255).optional(),
    Address_2: z.string().max(255).optional().nullable(),
    City: z.string().min(1).max(100).optional(),
    Country: z.string().min(1).max(100).optional(),
    Pincode: z.string().min(1).max(20).optional(),
    Mobile_No: z.string().min(10).max(15).optional(),
    Education: z.string().max(255).optional().nullable(),
    Fathers_Name: z.string().max(255).optional().nullable(),
    Mothers_Name: z.string().max(255).optional().nullable(),
    Spouse_Name: z.string().max(255).optional().nullable(),
    Sex: z.enum(['Male', 'Female', 'Other']).optional(),
    Emp_Religion: z.string().max(100).optional().nullable(),
    Salary: z.coerce.number().min(0).optional(),
    Total_Loan: z.coerce.number().min(0).optional(),
    Salary_Advance: z.coerce.number().min(0).optional(),
    Due_Loan: z.coerce.number().min(0).optional(),
    User_Mgt_Id: z.coerce.number().int().min(1).optional(),
    IsActive: z.enum(['0', '1']).optional()
});

export const employeeQuerySchema = z.object({
    page: z.coerce.number().int().min(1).default(1),
    limit: z.coerce.number().int().min(1).max(100).default(20),
    search: z.string().optional(),
    branch: z.string().optional(),
    departmentId: z.string().optional(),
    designation: z.string().optional(),
    isActive: z.enum(['0', '1', 'all']).default('1'),
    sortBy: z.enum(['Emp_Id', 'Emp_Code', 'Emp_Name', 'DOJ', 'Entry_Date']).default('Emp_Id'),
    sortOrder: z.enum(['ASC', 'DESC']).default('ASC')
});

// Sequelize Model
export class Employee_Master extends Model<EmployeeAttributes, EmployeeCreationAttributes> 
    implements EmployeeAttributes {
    
    public Emp_Id!: number;
    public Branch!: number;
    public fingerPrintEmpId!: number;
    public Emp_Code!: string;
    public Emp_Name!: string;
    public Designation!: number | string;
    public DOB!: Date;
    public DOJ!: Date;
    public Department_ID!: number;
    public Address_1!: string;
    public Address_2!: string | null;
    public City!: string;
    public Country!: string;
    public Pincode!: string;
    public Mobile_No!: string;
    public Education!: string | null;
    public Fathers_Name!: string | null;
    public Mothers_Name!: string | null;
    public Spouse_Name!: string | null;
    public Sex!: string;
    public Emp_Religion!: string | null;
    public Salary!: number;
    public Total_Loan!: number;
    public Salary_Advance!: number;
    public Due_Loan!: number;
    public User_Mgt_Id!: number;
    public Entry_By!: number;
    public Entry_Date!: Date;
    public Department!: string | null;
    public Location!: string | null;
    public IsActive!: number;

    // Timestamps
    public readonly createdAt!: Date;
    public readonly updatedAt!: Date;
}

// Model initialization
Employee_Master.init(
    {
        Emp_Id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
            field: 'Emp_Id'
        },
        Branch: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Branch'
        },
        fingerPrintEmpId: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'fingerPrintEmpId'
        },
        Emp_Code: {
            type: DataTypes.STRING(50),
            allowNull: false,
            field: 'Emp_Code'
        },
        Emp_Name: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'Emp_Name'
        },
        Designation: {
            type: DataTypes.STRING(100), // Storing as string, but can be number if it's an ID
            allowNull: false,
            field: 'Designation'
        },
        DOB: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'DOB'
        },
        DOJ: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'DOJ'
        },
        Department_ID: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Department_ID'
        },
        Address_1: {
            type: DataTypes.STRING(255),
            allowNull: false,
            field: 'Address_1'
        },
        Address_2: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Address_2'
        },
        City: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'City'
        },
        Country: {
            type: DataTypes.STRING(100),
            allowNull: false,
            field: 'Country'
        },
        Pincode: {
            type: DataTypes.STRING(20),
            allowNull: false,
            field: 'Pincode'
        },
        Mobile_No: {
            type: DataTypes.STRING(15),
            allowNull: false,
            field: 'Mobile_No'
        },
        Education: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Education'
        },
        Fathers_Name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Fathers_Name'
        },
        Mothers_Name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Mothers_Name'
        },
        Spouse_Name: {
            type: DataTypes.STRING(255),
            allowNull: true,
            field: 'Spouse_Name'
        },
        Sex: {
            type: DataTypes.STRING(10),
            allowNull: false,
            field: 'Sex'
        },
        Emp_Religion: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'Emp_Religion'
        },
        Salary: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: false,
            field: 'Salary'
        },
        Total_Loan: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'Total_Loan',
            defaultValue: 0
        },
        Salary_Advance: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'Salary_Advance',
            defaultValue: 0
        },
        Due_Loan: {
            type: DataTypes.DECIMAL(10, 2),
            allowNull: true,
            field: 'Due_Loan',
            defaultValue: 0
        },
        User_Mgt_Id: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'User_Mgt_Id'
        },
        Entry_By: {
            type: DataTypes.INTEGER,
            allowNull: false,
            field: 'Entry_By'
        },
        Entry_Date: {
            type: DataTypes.DATE,
            allowNull: false,
            field: 'Entry_Date'
        },
        Department: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'Department'
        },
        Location: {
            type: DataTypes.STRING(100),
            allowNull: true,
            field: 'Location'
        },
        IsActive: {
            type: DataTypes.INTEGER,
            allowNull: true,
            field: 'IsActive',
            defaultValue: 1
        }
    },
    {
        sequelize,
        tableName: 'tbl_Employee_Master',
        timestamps: false, // Disable createdAt and updatedAt since you have Entry_Date
        indexes: [
            {
                unique: true,
                fields: ['Emp_Code']
            },
            {
                fields: ['Emp_Name']
            },
            {
                fields: ['Branch']
            },
            {
                fields: ['Department_ID']
            },
            {
                fields: ['IsActive']
            }
        ]
    }
);

// If you need associations (for Department or Branch)
// You can add them here if you have those models

export type EmployeeCreateInput = z.infer<typeof employeeCreateSchema>;
export type EmployeeUpdateInput = z.infer<typeof employeeUpdateSchema>;