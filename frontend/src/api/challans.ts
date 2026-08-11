import client from './client';
import type { Challan } from '../types';

export async function getChallans(params: { page?: number; status?: string; customer_id?: number } = {}) {
  const res = await client.get('/challans', { params });
  return res.data as { data: Challan[]; meta: { page: number; limit: number; total: number } };
}

export async function getChallan(id: number) {
  const res = await client.get(`/challans/${id}`);
  return res.data.data as Challan;
}

export async function createChallan(customerId: number, items: { product_id: number; quantity: number }[]) {
  const res = await client.post('/challans', { customer_id: customerId, items });
  return res.data.data as Challan;
}

export async function confirmChallan(id: number) {
  const res = await client.post(`/challans/${id}/confirm`);
  return res.data.data as Challan;
}

export async function cancelChallan(id: number) {
  const res = await client.post(`/challans/${id}/cancel`);
  return res.data.data as Challan;
}

export async function deleteChallan(id: number) {
  await client.delete(`/challans/${id}`);
}

export function getInvoicePdfUrl(id: number) {
  return `${import.meta.env.VITE_API_URL}/challans/${id}/invoice-pdf`;
}