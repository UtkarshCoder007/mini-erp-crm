import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import * as challanService from './challans.service';

const createChallanSchema = z.object({
  customer_id: z.number().int().positive(),
  items: z.array(
    z.object({
      product_id: z.number().int().positive(),
      quantity: z.number().int().positive(),
    })
  ).min(1),
});

export async function list(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;
  const customerId = req.query.customer_id ? parseInt(req.query.customer_id as string) : undefined;

  const { challans, total } = await challanService.getChallans(page, limit, status, customerId);
  res.json({ data: challans, meta: { page, limit, total } });
}

export async function getById(req: AuthRequest, res: Response) {
  const challan = await challanService.getChallanById(parseInt(req.params.id as string, 10));
  if (!challan) return res.status(404).json({ error: 'Challan not found' });
  res.json({ data: challan });
}

export async function create(req: AuthRequest, res: Response) {
  const parsed = createChallanSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  try {
    const challan = await challanService.createChallan(parsed.data.customer_id, parsed.data.items, req.user!.id);
    res.status(201).json({ data: challan });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
}

export async function confirm(req: AuthRequest, res: Response) {
  try {
    const challan = await challanService.confirmChallan(parseInt(req.params.id as string, 10), req.user!.id);
    res.json({ data: challan });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
}

export async function cancel(req: AuthRequest, res: Response) {
  try {
    const challan = await challanService.cancelChallan(parseInt(req.params.id as string, 10), req.user!.id);
    res.json({ data: challan });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
}

export async function remove(req: AuthRequest, res: Response) {
  const deleted = await challanService.deleteDraftChallan(parseInt(req.params.id as string, 10));
  if (!deleted) {
    return res.status(409).json({ error: 'Only draft challans can be deleted, or challan not found' });
  }
  res.status(204).send();
}