import express from 'express';

import taskTypeRoutes from './taskType.routes';
import projectRoutes from './project.routes';       
import taskAssignRoutes from './taskAssign.route' 
import processMasterRoutes from './processMaster.routes'
import taskParamTypeRoutes from './taskParamType.route'
import paramMasterRoutes from './paramMaster.routes'
import dropdownRoutes from './dropdown.route'
import taskRoutes from './task.routes'


const router = express.Router();


router.use('/taskType', taskTypeRoutes)
router.use('/project',projectRoutes)
router.use('/projectAssign',taskAssignRoutes)
router.use('/processMaster',processMasterRoutes)
router.use('/parametDataTypes',taskParamTypeRoutes)
router.use('/paramMaster',paramMasterRoutes)
router.use('/dropdowns',dropdownRoutes)
router.use('/tasks',taskRoutes)


export default router;