// // import sql from "mssql";
// // import dotenv from "dotenv";
// // dotenv.config();


// // const config: sql.config = {
// //     server: process.env.SERVER as string,
// //     database: process.env.DATABASE as string,
// //     user: process.env.USER as string,
// //     password: process.env.PASSWORD as string,
// //     driver: "SQL Server",
// //     options: {
// //         trustedConnection: true,
// //         trustServerCertificate: true,
// //         requestTimeout: 60000,
// //     }
// // };

// // export const connectDB = () => {
// //     sql.connect(config, (err) => {
// //         if (err) {
// //             console.log(err);
// //         } else {
// //             console.log("connected Successfully -----");
// //         }
// //     })
// // };






// import { Sequelize } from 'sequelize';
// import dotenv from "dotenv";
// dotenv.config();

// const sequelize = new Sequelize({
//     dialect: 'mssql',
//     host: process.env.SERVER as string,
//     username: process.env.USER as string,
//     password: process.env.PASSWORD as string,
//     database: process.env.DATABASE as string,
//     logging: false,
//     dialectOptions: {
//         options: {
//             encrypt: false,
//             trustedConnection: true,
//             trustServerCertificate: true,
//             requestTimeout: 60000,
//         }
//     },
//     pool: {
//         max: 10,
//         min: 0,
//         acquire: 30000,
//         idle: 10000
//     }
// });

// // Test connection function
// export const connectDB = async (): Promise<boolean> => {
//     try {
//         await sequelize.authenticate();
//         console.log('MSSQL Database connection established successfully.');
//         return true;
//     } catch (error) {
//         console.error('Unable to connect to MSSQL database:', error);
//         return false;
//     }
// };

// export default sequelize;






import sql from "mssql";
import dotenv from "dotenv";
dotenv.config();


const config: sql.config = {
    server: process.env.SERVER as string,
    database: process.env.DATABASE as string,
    user: process.env.USER as string,
    password: process.env.PASSWORD as string,
    driver: "SQL Server",
    options: {
        trustedConnection: true,
        trustServerCertificate: true,
        requestTimeout: 60000,
    }
};

export const connectDB = () => {
    sql.connect(config, (err) => {
        if (err) {
            console.log(err);
        } else {
            console.log("connected Successfully -----");
        }
    })
};