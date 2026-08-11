import { Response } from 'express';
import { AuthRequest } from '../../middleware/auth';
import { getDashboardStats } from './dashboard.service';

export async function stats(req: AuthRequest, res: Response) {
  const data = await getDashboardStats();
  res.json({ data });
}