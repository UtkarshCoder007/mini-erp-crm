import client from './client';
import type { AuthUser } from '../types';

export async function login(email: string, password: string) {
  const res = await client.post('/auth/login', { email, password });
  return res.data.data as { token: string; user: AuthUser };
}

export async function getMe() {
  const res = await client.get('/auth/me');
  return res.data.data as AuthUser;
}