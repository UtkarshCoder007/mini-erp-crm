export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}

export interface Customer {
  id: number;
  name: string;
  mobile: string;
  email?: string;
  business_name?: string;
  gst_number?: string;
  customer_type: 'retail' | 'wholesale' | 'distributor';
  address?: string;
  status: 'lead' | 'active' | 'inactive';
  follow_up_date?: string;
  notes?: string;
  created_at: string;
}

export interface Product {
  id: number;
  name: string;
  sku: string;
  category?: string;
  unit_price: number;
  current_stock: number;
  min_stock_alert: number;
  warehouse_location?: string;
  created_at: string;
}

export interface ChallanItem {
  id: number;
  product_id: number;
  product_name_snap: string;
  product_sku_snap: string;
  unit_price_snap: number;
  quantity: number;
  line_total: number;
}

export interface Challan {
  id: number;
  challan_number: string;
  customer_id: number;
  customer_name?: string;
  customer_mobile?: string;
  customer_address?: string;
  status: 'draft' | 'confirmed' | 'cancelled';
  total_quantity: number;
  created_at: string;
  confirmed_at?: string;
  cancelled_at?: string;
  items: ChallanItem[];
}