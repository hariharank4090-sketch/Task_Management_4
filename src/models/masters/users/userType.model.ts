import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from '../../../config/sequalizer';
import { z } from "zod";

const modelName = 'UserTypeMaster';

export interface UserTypeAttributes {
    Id: number;
    UserType: string | null;
    Alias: string | null;
    IsActive: number;
}

export type UserTypeCreationAttributes = Optional<UserTypeAttributes, "Id" | "Alias" | "IsActive">

export class UserTypeMaster extends Model<UserTypeAttributes, UserTypeCreationAttributes> { }

export const userTypeSchema = z.object({
    UserType: z.string('UserType is required'),
    Alias: z.string().optional().nullable(),
    IsActive: z.number(),
});

UserTypeMaster.init({
    Id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    UserType: {
        type: DataTypes.STRING(250),
        allowNull: false,
        unique: true,
    },
    Alias: {
        type: DataTypes.STRING(250),
        allowNull: true,
    },
    IsActive: {
        type: DataTypes.INTEGER,
        allowNull: false,
    }
}, {
    sequelize,
    tableName: 'tbl_User_Type',
    modelName: modelName,
    timestamps: false,
    freezeTableName: true
});

export const userTypeAccKey = {
    Id: `${modelName}.Id`,
    UserType: `${modelName}.UserType`,
    Alias: `${modelName}.Alias`,
    IsActive: `${modelName}.IsActive`,
}