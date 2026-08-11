import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import * as customerService from './customers.service';

const customerSchema = z.object({
  name: z.string().min(1),
  mobile: z.string().min(10).max(15),
  email: z.string().email().optional().nullable(),
  business_name: z.string().optional().nullable(),
  gst_number: z.string().optional().nullable(),
  customer_type: z.enum(['retail', 'wholesale', 'distributor']),
  address: z.string().optional().nullable(),
  status: z.enum(['lead', 'active', 'inactive']).optional(),
  follow_up_date: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

export async function list(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;
  const status = req.query.status as string | undefined;

  const { customers, total } = await customerService.getCustomers(page, limit, search, status);
  res.json({ data: customers, meta: { page, limit, total } });
}

export async function getById(req: AuthRequest, res: Response) {
  const customer = await customerService.getCustomerById(parseInt(req.params.id as string, 10));
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ data: customer });
}

export async function create(req: AuthRequest, res: Response) {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const customer = await customerService.createCustomer(parsed.data, req.user!.id);
  res.status(201).json({ data: customer });
}

export async function update(req: AuthRequest, res: Response) {
  const parsed = customerSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const customer = await customerService.updateCustomer(parseInt(req.params.id as string, 10), parsed.data);
  if (!customer) return res.status(404).json({ error: 'Customer not found' });
  res.json({ data: customer });
}

export async function addFollowup(req: AuthRequest, res: Response) {
  const schema = z.object({ note: z.string().min(1) });
  const parsed = schema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const followup = await customerService.addFollowup(parseInt(req.params.id as string, 10), parsed.data.note, req.user!.id);
  res.status(201).json({ data: followup });
}

export async function listFollowups(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const followups = await customerService.getFollowups(parseInt(req.params.id as string, 10), page, limit);
  res.json({ data: followups, meta: { page, limit } });
}