export interface User {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'collector' | 'seller';
  is_active: boolean;
}
