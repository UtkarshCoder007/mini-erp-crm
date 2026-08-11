export type UserRole = 'admin' | 'sales' | 'warehouse' | 'accounts';

export interface AuthUser {
  id: number;
  name: string;
  email: string;
  role: UserRole;
}