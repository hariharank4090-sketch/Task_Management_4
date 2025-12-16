import { Sequelize } from 'sequelize';
import dotenv from "dotenv";
dotenv.config();

export const sequelize = new Sequelize({
    dialect: 'mssql',
    host: process.env.SERVER as string,
    username: process.env.USER as string,
    password: process.env.PASSWORD as string,
    database: process.env.DATABASE as string,
    logging: false,
    dialectOptions: {
        options: {
            encrypt: false,
            trustedConnection: true,
            trustServerCertificate: true,
            requestTimeout: 60000,
        }
    }
});