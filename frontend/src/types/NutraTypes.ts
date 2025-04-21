// Enums
export enum ProductType {
  CAPSULAS = "cápsulas",
  GOTAS = "gotas",
  COMPRIMIDOS = "comprimidos",
  PO = "pó",
  GEL = "gel",
  OUTRO = "outro"
}

export enum OrderStatus {
  PENDENTE = "pendente",
  CANCELADO = "cancelado",
  COMPLETO = "completo"
}

export enum StockChangeReason {
  MANUAL = "manual",
  KIT_SALE = "kit_sale",
  ORDER_RECEIVED = "order_received",
  ADJUSTMENT = "adjustment",
  DAMAGED = "damaged",
  EXPIRED = "expired"
}

// Product interfaces
export interface Product {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
  variations?: ProductVariation[];
}

export interface ProductVariation {
  id: number;
  product_id: number;
  type: ProductType;
  cost: number;
  sale_price: number;
  current_stock: number;
  minimum_stock: number;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface ProductCreate {
  name: string;
  description?: string;
  active?: boolean;
}

export interface ProductVariationCreate {
  product_id: number;
  type: ProductType;
  cost: number;
  sale_price: number;
  minimum_stock: number;
  current_stock?: number;
  active?: boolean;
}

export interface ProductUpdate {
  name?: string;
  description?: string;
  active?: boolean;
}

export interface ProductVariationUpdate {
  type?: ProductType;
  cost?: number;
  sale_price?: number;
  minimum_stock?: number;
  active?: boolean;
}

// Kit interfaces
export interface KitProduct {
  id: number;
  kit_id: number;
  variation_id: number;
  quantity: number;
  variation?: ProductVariation;
}

export interface Kit {
  id: number;
  name: string;
  description?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
  kit_products: KitProduct[];
  variations?: ProductVariation[];
}

export interface KitCreate {
  name: string;
  description?: string;
  active?: boolean;
  variations: { variation_id: number; quantity: number }[];
}

export interface KitUpdate {
  name?: string;
  description?: string;
  active?: boolean;
  variations?: { variation_id: number; quantity: number }[];
}

// Distributor interfaces
export interface Distributor {
  id: number;
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  active: boolean;
  created_at: string;
  updated_at?: string;
}

export interface DistributorCreate {
  name: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
}

export interface DistributorUpdate {
  name?: string;
  contact_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  active?: boolean;
}

// Order interfaces
export interface OrderItem {
  id: number;
  order_id: number;
  variation_id: number;
  quantity: number;
  variation?: ProductVariation;
}

export interface Order {
  id: number;
  distributor_id: number;
  user_id: number;
  expected_delivery_date?: string;
  status: OrderStatus;
  notes?: string;
  created_at: string;
  updated_at?: string;
  items: OrderItem[];
  distributor?: Distributor;
}

export interface OrderCreate {
  distributor_id: number;
  expected_delivery_date?: string;
  notes?: string;
  items: { variation_id: number; quantity: number }[];
}

export interface OrderUpdate {
  distributor_id?: number;
  expected_delivery_date?: string;
  status?: OrderStatus;
  notes?: string;
  items?: { variation_id: number; quantity: number }[];
}

// Stock history interfaces
export interface StockHistory {
  id: number;
  variation_id: number;
  user_id: number;
  change_amount: number;
  reason: StockChangeReason;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
  created_at: string;
  variation?: ProductVariation;
}

export interface StockHistoryCreate {
  variation_id: number;
  change_amount: number;
  reason: StockChangeReason;
  reference_type?: string;
  reference_id?: number;
  notes?: string;
}

// Kit sale interfaces
export interface KitSale {
  id: number;
  kit_id: number;
  quantity: number;
  sale_date: string;
  user_id: number;
  notes?: string;
  created_at: string;
  kit?: Kit;
}

export interface KitSaleCreate {
  kit_id: number;
  quantity: number;
  sale_date?: string;
  notes?: string;
}

// Analytics interfaces
export interface ProductStockStatus {
  id: number;
  name: string;
  type: ProductType;
  current_stock: number;
  minimum_stock: number;
  status: "ok" | "low" | "out";
  percentage: number;
}

export interface SalesAnalytics {
  total_sales: number;
  total_revenue: number;
  products_sold: Record<string, number>;
  kits_sold: Record<string, number>;
}

export interface InventorySummary {
  total_products: number;
  low_stock_count: number;
  out_of_stock_count: number;
  total_inventory_value: number;
  low_stock_items: ProductStockStatus[];
}
