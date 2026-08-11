import { Router } from 'express';
import { authenticate, AuthRequest } from '../../middleware/auth';
import { requireRole } from '../../middleware/requireRole';
import * as controller from './challans.controller';
import * as challanService from './challans.service';
import { generateInvoicePdf } from './invoice';
import { Response } from 'express';

const router = Router();

router.use(authenticate);

router.get('/', controller.list);
router.get('/:id', controller.getById);
router.post('/', requireRole('admin', 'sales'), controller.create);
router.post('/:id/confirm', requireRole('admin', 'sales', 'warehouse'), controller.confirm);
router.post('/:id/cancel', requireRole('admin', 'sales', 'warehouse'), controller.cancel);
router.delete('/:id', requireRole('admin', 'sales'), controller.remove);

router.get('/:id/invoice-pdf', requireRole('admin', 'sales', 'accounts'), async (req: AuthRequest, res: Response) => {
  const challan = await challanService.getChallanById(parseInt(req.params.id as string, 10));
  if (!challan) return res.status(404).json({ error: 'Challan not found' });
  generateInvoicePdf(challan, res);
});

export default router;