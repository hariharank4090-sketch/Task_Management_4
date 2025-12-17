

import { login } from '../../controllers/configuration/login/index';
import express from 'express';

const router = express.Router();

router.post('/', login);

export default router;