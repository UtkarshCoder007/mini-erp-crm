import { Router } from 'express';
import { authenticate } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import * as controller from './customers.controller';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', requireRole('admin', 'sales'), controller.create);
router.put('/:id', requireRole('admin', 'sales'), controller.update);
router.post('/:id/followups', requireRole('admin', 'sales'), controller.addFollowup);
router.get('/:id/followups', controller.listFollowups);

export default router;