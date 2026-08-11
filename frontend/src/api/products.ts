import client from './client';
import type { Product } from '../types';

export async function getProducts(params: { page?: number; search?: string; category?: string } = {}) {
  const res = await client.get('/products', { params });
  return res.data as { data: Product[]; meta: { page: number; limit: number; total: number } };
}

export async function getProduct(id: number) {
  const res = await client.get(`/products/${id}`);
  return res.data.data as Product;
}

export async function getLowStock() {
  const res = await client.get('/products/low-stock');
  return res.data.data as Product[];
}

export async function createProduct(data: Partial<Product>) {
  const res = await client.post('/products', data);
  return res.data.data as Product;
}

export async function updateProduct(id: number, data: Partial<Product>) {
  const res = await client.put(`/products/${id}`, data);
  return res.data.data as Product;
}

export async function addStockMovement(productId: number, data: { quantity: number; movement_type: 'IN' | 'OUT'; reason: string }) {
  const res = await client.post(`/products/${productId}/stock-movements`, data);
  return res.data.data;
}

export async function getStockMovements(productId: number) {
  const res = await client.get(`/products/${productId}/stock-movements`);
  return res.data.data;
}