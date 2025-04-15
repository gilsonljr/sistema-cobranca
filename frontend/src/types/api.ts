// API response types that match the backend models

// User types
export interface ApiUser {
  id: number;
  email: string;
  full_name: string;
  role: 'admin' | 'supervisor' | 'collector' | 'seller';
  is_active: boolean;
}

// Order status enum
export enum OrderStatus {
  PENDING = 'pending',
  IN_PROGRESS = 'in_progress',
  PAID = 'paid',
  PARTIALLY_PAID = 'partially_paid',
  NEGOTIATING = 'negotiating',
  CANCELLED = 'cancelled',
  DELIVERED = 'delivered',
  DELETED = 'deleted'
}

// Order types
export interface ApiBillingHistory {
  id: number;
  order_id: number;
  amount: number;
  notes: string | null;
  created_at: string;
  created_by: number;
  created_by_name?: string; // This might be populated by the backend
}

export interface ApiOrder {
  id: number;
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  paid_amount: number;
  status: OrderStatus;
  tracking_code: string | null;
  created_at: string;
  updated_at: string | null;
  seller_id: number;
  collector_id: number | null;
  is_duplicate: boolean;
  billing_history: ApiBillingHistory[];

  // These fields might be populated by the backend
  seller_name?: string;
  collector_name?: string;
}

export interface ApiOrderCreate {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  tracking_code?: string | null;
  seller_id: number;
}

export interface ApiOrderUpdate {
  customer_name?: string;
  customer_phone?: string;
  customer_address?: string;
  total_amount?: number;
  paid_amount?: number;
  status?: OrderStatus;
  tracking_code?: string | null;
  collector_id?: number | null;
  is_duplicate?: boolean;
}

export interface ApiBillingHistoryCreate {
  order_id: number;
  amount: number;
  notes?: string | null;
}

// Webhook types
export interface ApiWebhookOrder {
  order_number: string;
  customer_name: string;
  customer_phone: string;
  customer_address: string;
  total_amount: number;
  seller_id: number;
  tracking_code?: string | null;
}

// Statistics types
export interface ApiOrderStatistics {
  total_orders: number;
  total_amount: number;
  total_paid: number;
  payment_rate: number;
  status_counts: Record<OrderStatus, number>;
}

// Tracking types
export interface ApiTrackingUpdate {
  order_id: string;  // Changed to string to match Order.idVenda
  tracking_code: string;
  status: string;
  last_update: string;
  location?: string;
  estimated_delivery?: string;
  is_critical?: boolean;
}
