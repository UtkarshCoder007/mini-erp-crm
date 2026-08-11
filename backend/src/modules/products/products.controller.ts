import { Response } from 'express';
import { z } from 'zod';
import { AuthRequest } from '../../middleware/auth';
import * as productService from './products.service';

const productSchema = z.object({
  name: z.string().min(1),
  sku: z.string().min(1),
  category: z.string().optional().nullable(),
  unit_price: z.number().nonnegative(),
  current_stock: z.number().int().nonnegative().optional(),
  min_stock_alert: z.number().int().nonnegative().optional(),
  warehouse_location: z.string().optional().nullable(),
});

const updateSchema = productSchema.omit({ sku: true, current_stock: true });

const movementSchema = z.object({
  quantity: z.number().int().positive(),
  movement_type: z.enum(['IN', 'OUT']),
  reason: z.string().min(1),
});

export async function list(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const search = req.query.search as string | undefined;
  const category = req.query.category as string | undefined;

  const { products, total } = await productService.getProducts(page, limit, search, category);
  res.json({ data: products, meta: { page, limit, total } });
}

export async function lowStock(req: AuthRequest, res: Response) {
  const products = await productService.getLowStockProducts();
  res.json({ data: products });
}

export async function getById(req: AuthRequest, res: Response) {
  const product = await productService.getProductById(parseInt(req.params.id as string, 10));
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ data: product });
}

export async function create(req: AuthRequest, res: Response) {
  const parsed = productSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  try {
    const product = await productService.createProduct(parsed.data);
    res.status(201).json({ data: product });
  } catch (err: any) {
    if (err.code === '23505') return res.status(409).json({ error: 'SKU already exists' });
    throw err;
  }
}

export async function update(req: AuthRequest, res: Response) {
  const parsed = updateSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  const product = await productService.updateProduct(parseInt(req.params.id as string, 10), parsed.data);
  if (!product) return res.status(404).json({ error: 'Product not found' });
  res.json({ data: product });
}

export async function addMovement(req: AuthRequest, res: Response) {
  const parsed = movementSchema.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: 'Invalid input', details: parsed.error.flatten() });

  try {
    const movement = await productService.addStockMovement(
      parseInt(req.params.id as string, 10),
      parsed.data.quantity,
      parsed.data.movement_type,
      parsed.data.reason,
      req.user!.id
    );
    res.status(201).json({ data: movement });
  } catch (err: any) {
    if (err.status) return res.status(err.status).json({ error: err.message });
    throw err;
  }
}

export async function listMovements(req: AuthRequest, res: Response) {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const movements = await productService.getStockMovements(parseInt(req.params.id as string, 10), page, limit);
  res.json({ data: movements, meta: { page, limit } });
}