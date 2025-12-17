import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from "zod";
import { UserTypeMaster } from './userType.model';

const modelName = 'UserMaster';

export interface UserAttributes {
    id: number;
    userType: number;
    name: string;
    uniqueName: string;
    password: string;
    branchId: number;
    isActive?: number | null;
}

type UserCreationAttributes = Optional<UserAttributes, 'id' | 'isActive'>;

export class UserMaster
    extends Model<UserAttributes, UserCreationAttributes>
    implements UserAttributes {

    declare id: number;
    declare userType: number;
    declare name: string;
    declare uniqueName: string;
    declare password: string;
    declare branchId: number;
    declare isActive: number | null;
}


export const userCreateSchema = z.object({
    userType: z.number('userType is required'),
    name: z.string('Name is required').min(4, "Name should be minimum 4 chars"),
    uniqueName: z.string('uniqueName is required').min(6, "Unique name should be minimum 6 chars"),
    password: z.string('Password is required').min(6, "Password should be minimum 6 chars"),
    branchId: z.number('branchId is required'),
});

export const userUpdateSchema = z.object({
    userType: z.number('userType is required'),
    name: z.string('Name is required').min(4, "Name should be minimum 4 chars").optional(),
    uniqueName: z.string('uniqueName is required').min(6, "Unique name should be minimum 6 chars").optional(),
    branchId: z.number('branchId is required').optional(),
    isActive: z.number().optional(),
    password: z.never().optional(),
});

export const changePasswordSchema = z.object({
    oldPassword: z.string('oldPassword is required').min(1),
    newPassword: z.string('newPassword is required').min(6),
});

UserMaster.init(
    {
        id: {
            type: DataTypes.BIGINT,
            autoIncrement: true,
            primaryKey: true,
        },
        userType: {
            type: DataTypes.BIGINT,
            allowNull: false,
        },
        name: {
            type: DataTypes.STRING(300),
            allowNull: false,
        },
        uniqueName: {
            type: DataTypes.STRING(200),
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.TEXT,
            allowNull: false,
        },
        branchId: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        isActive: {
            type: DataTypes.INTEGER,
            allowNull: true,
            defaultValue: 1,
        },
    },
    {
        sequelize,
        tableName: 'tbl_Users',
        modelName: modelName,
        timestamps: false,
        freezeTableName: true,
        defaultScope: {
            attributes: { exclude: ['password'] }
        }
    }
);

UserMaster.belongsTo(UserTypeMaster, { foreignKey: 'userType', targetKey: 'Id' });

export const userAccKey = {
    id: `${modelName}.id`,
    userType: `${modelName}.userType`,
    name: `${modelName}.name`,
    uniqueName: `${modelName}.uniqueName`,
    password: `${modelName}.password`,
    branchId: `${modelName}.branchId`,
    isActive: `${modelName}.isActive`,
}