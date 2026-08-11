import client from './client';
import type { Customer } from '../types';

export async function getCustomers(params: { page?: number; search?: string; status?: string } = {}) {
  const res = await client.get('/customers', { params });
  return res.data as { data: Customer[]; meta: { page: number; limit: number; total: number } };
}

export async function getCustomer(id: number) {
  const res = await client.get(`/customers/${id}`);
  return res.data.data as Customer;
}

export async function createCustomer(data: Partial<Customer>) {
  const res = await client.post('/customers', data);
  return res.data.data as Customer;
}

export async function updateCustomer(id: number, data: Partial<Customer>) {
  const res = await client.put(`/customers/${id}`, data);
  return res.data.data as Customer;
}

export async function addFollowup(customerId: number, note: string) {
  const res = await client.post(`/customers/${customerId}/followups`, { note });
  return res.data.data;
}

export async function getFollowups(customerId: number) {
  const res = await client.get(`/customers/${customerId}/followups`);
  return res.data.data;
}