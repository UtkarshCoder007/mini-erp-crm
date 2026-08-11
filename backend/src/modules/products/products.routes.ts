import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import * as controller from './products.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/low-stock', controller.lowStock);
router.get('/:id', controller.getById);
router.post('/', requireRole('admin', 'warehouse'), controller.create);
router.put('/:id', requireRole('admin', 'warehouse'), controller.update);
router.post('/:id/stock-movements', requireRole('admin', 'warehouse'), controller.addMovement);
router.get('/:id/stock-movements', controller.listMovements);

export default router;