import express from "express";
import cors from "cors";
import morgan from "morgan";
import dotenv from "dotenv";
import { connectDB } from "./config/dbConfig";
import appRoutes from './routes/index.route';
import { sequelize } from "./config/sequalizer";
import authRoutes from './routes/configuration/login.route';
import { listRoutes } from "./config/apiDoc";
import path from 'path';
import fs from 'fs';
import { createUploadFolders } from "./middleware/createUploadFolders";

import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";



dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

app.use(cors({
    origin: "*",
    // http://localhost:5174
    credentials: true,
}));

app.use(express.json());
app.use(morgan("dev"));
app.use(express.urlencoded({ extended: true }));

connectDB();
createUploadFolders();

(async () => {
    try {
        await sequelize.authenticate();
        // await sequelize.sync({ force: false, alter: false });
        console.log('seqalizer initialized');
    } catch (err) {
        console.error('seqalizer initialization failed', err);
    }
})();



app.use('/api/configuration/login', authRoutes);

app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use('/api', appRoutes);

app.use('/api', (req, res) => {
    try {
        return listRoutes(app, res);
    } catch (e) {
        console.error(e);
        res.status(500).send('Failed to list routes');
    }
});

app.use((req, res, next) => {
    console.log(`[${new Date().toISOString()}] ${req.method} ${req.path}`);
    console.log('Request Body:', req.body);
    next();
});
const reactBuildPath = path.join(__dirname, '../frontend');
app.use(express.static(reactBuildPath));

// staticPaths.forEach(({ route, folder }) => {
//     const resolvedPath = path.join(__dirname, folder);
//     app.use(route, express.static(resolvedPath));
// });

app.get('*', (req, res) => {
    res.sendFile(path.join(reactBuildPath, 'index.html'));
});





app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});