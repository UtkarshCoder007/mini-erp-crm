import client from './client';

export interface DashboardStats {
  customers: { total: number; leads: number; active: number; inactive: number };
  products: { total: number; lowStock: number };
  challans: { total: number; draft: number; confirmed: number; cancelled: number };
  recentChallans: {
    id: number;
    challan_number: string;
    status: string;
    total_quantity: number;
    created_at: string;
    customer_name: string;
  }[];
}

export async function getDashboardStats() {
  const res = await client.get('/dashboard/stats');
  return res.data.data as DashboardStats;
}