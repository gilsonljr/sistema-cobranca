import { VariationType } from './Product';

// Transaction types
export enum InventoryTransactionType {
  SALE = 'sale',           // Deduct from inventory when a sale is made
  PURCHASE = 'purchase',   // Add to inventory when purchasing from supplier
  ADJUSTMENT = 'adjustment', // Manual inventory adjustment
  RETURN = 'return'        // Add to inventory when a customer returns an item
}

// Inventory item interface representing base stock for each variation
export interface InventoryItem {
  id: string;
  variationType: VariationType;
  quantity: number;
  minimumLevel: number;    // For reorder alerts
  costPerUnit: number;     // Cost price of the item
  lastUpdated: string;
}

// Inventory transaction interface for tracking inventory changes
export interface InventoryTransaction {
  id: string;
  date: string;
  variationType: VariationType;
  quantity: number;        // Positive for additions, negative for deductions
  transactionType: InventoryTransactionType;
  orderId?: string;        // Related order ID if applicable
  notes: string;
  createdBy: string;
}

// Interface for inventory levels by variation
export interface InventoryLevels {
  gel: number;
  capsulas: number;
}

// Interface for inventory statistics
export interface InventoryStats {
  totalItems: number;
  lowStockItems: number;
  totalValue: number;
  mostSoldVariation: VariationType | null;
}

// Generate a unique ID for inventory items and transactions
export const generateInventoryId = (): string => {
  return `inv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

// Initial inventory data
export const initialInventory: InventoryItem[] = [
  {
    id: generateInventoryId(),
    variationType: 'gel',
    quantity: 500,
    minimumLevel: 100,
    costPerUnit: 25.5,
    lastUpdated: new Date().toISOString()
  },
  {
    id: generateInventoryId(),
    variationType: 'capsulas',
    quantity: 750,
    minimumLevel: 150,
    costPerUnit: 18.2,
    lastUpdated: new Date().toISOString()
  }
]; 