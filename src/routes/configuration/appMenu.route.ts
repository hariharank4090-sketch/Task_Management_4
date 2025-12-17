import appMenu from '../../controllers/configuration/menuManagement/index';
import express from 'express';

const router = express.Router();

router.get('/', appMenu.getMenu);
router.post('/', appMenu.createMenu);
router.put('/:id', appMenu.updateMenu);

export default router;