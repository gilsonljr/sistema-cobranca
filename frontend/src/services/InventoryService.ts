import { 
  InventoryItem, 
  InventoryTransaction, 
  InventoryTransactionType, 
  InventoryLevels,
  InventoryStats, 
  generateInventoryId,
  initialInventory 
} from '../types/Inventory';
import { Order } from '../types/Order';
import { Product, Offer } from '../types/Product';
import ProductService from './ProductService';

class InventoryService {
  private inventoryKey = 'inventory';
  private transactionsKey = 'inventoryTransactions';

  /**
   * Get inventory items from localStorage or initialize with default data
   */
  getInventory(): InventoryItem[] {
    const storedInventory = localStorage.getItem(this.inventoryKey);
    if (storedInventory) {
      return JSON.parse(storedInventory);
    }

    // Initialize with default inventory
    this.saveInventory(initialInventory);
    return initialInventory;
  }

  /**
   * Save inventory items to localStorage
   */
  saveInventory(inventory: InventoryItem[]): void {
    localStorage.setItem(this.inventoryKey, JSON.stringify(inventory));
  }

  /**
   * Get inventory transactions from localStorage
   */
  getTransactions(): InventoryTransaction[] {
    const storedTransactions = localStorage.getItem(this.transactionsKey);
    if (storedTransactions) {
      return JSON.parse(storedTransactions);
    }
    return [];
  }

  /**
   * Save inventory transactions to localStorage
   */
  saveTransactions(transactions: InventoryTransaction[]): void {
    localStorage.setItem(this.transactionsKey, JSON.stringify(transactions));
  }

  /**
   * Add a new transaction and update inventory levels
   */
  addTransaction(transaction: Omit<InventoryTransaction, 'id' | 'date'>): InventoryTransaction {
    const inventory = this.getInventory();
    const transactions = this.getTransactions();

    // Generate ID and add timestamp
    const newTransaction: InventoryTransaction = {
      ...transaction,
      id: generateInventoryId(),
      date: new Date().toISOString()
    };

    // Update inventory quantity
    const inventoryItem = inventory.find(item => item.variationType === transaction.variationType);
    if (inventoryItem) {
      inventoryItem.quantity += transaction.quantity;
      inventoryItem.lastUpdated = newTransaction.date;
    } else {
      // Create new inventory item if it doesn't exist
      inventory.push({
        id: generateInventoryId(),
        variationType: transaction.variationType,
        quantity: transaction.quantity,
        minimumLevel: 50, // Default minimum level
        costPerUnit: 0,   // Default cost
        lastUpdated: newTransaction.date
      });
    }

    // Save updated inventory and transactions
    transactions.push(newTransaction);
    this.saveInventory(inventory);
    this.saveTransactions(transactions);

    return newTransaction;
  }

  /**
   * Update inventory based on a sale
   */
  processOrderInventory(order: Order): void {
    // Find the product offer associated with this order
    const products = ProductService.getProducts();
    const orderOfferName = order.oferta;
    let offer: Offer | null = null;
    
    // Find matching offer
    for (const product of products) {
      const matchingOffer = product.offers.find((o: Offer) => 
        `${product.name} - ${o.name}` === orderOfferName
      );
      if (matchingOffer) {
        offer = matchingOffer;
        break;
      }
    }

    if (!offer) {
      console.error(`No matching offer found for order: ${order.idVenda} with offer: ${orderOfferName}`);
      return;
    }

    // Create transactions for each product variation in the offer
    if (offer.gelQuantity > 0) {
      this.addTransaction({
        variationType: 'gel',
        quantity: -offer.gelQuantity, // Negative because we're removing from inventory
        transactionType: InventoryTransactionType.SALE,
        orderId: order.idVenda,
        notes: `Order #${order.idVenda}: ${orderOfferName}`,
        createdBy: 'system'
      });
    }

    if (offer.capsulasQuantity > 0) {
      this.addTransaction({
        variationType: 'capsulas',
        quantity: -offer.capsulasQuantity, // Negative because we're removing from inventory
        transactionType: InventoryTransactionType.SALE,
        orderId: order.idVenda,
        notes: `Order #${order.idVenda}: ${orderOfferName}`,
        createdBy: 'system'
      });
    }
  }

  /**
   * Add inventory from purchase or other source
   */
  addInventory(data: {
    variationType: string, 
    quantity: number, 
    costPerUnit: number,
    notes: string,
    createdBy: string
  }): void {
    // Validate input
    if (data.quantity <= 0) {
      throw new Error('Quantity must be greater than zero');
    }

    // Add transaction
    this.addTransaction({
      variationType: data.variationType as any, // Type conversion
      quantity: data.quantity,
      transactionType: InventoryTransactionType.PURCHASE,
      notes: data.notes,
      createdBy: data.createdBy
    });

    // Update cost per unit in inventory
    const inventory = this.getInventory();
    const item = inventory.find(i => i.variationType === data.variationType);
    if (item) {
      item.costPerUnit = data.costPerUnit;
      this.saveInventory(inventory);
    }
  }

  /**
   * Calculate current inventory levels
   */
  getInventoryLevels(): InventoryLevels {
    const inventory = this.getInventory();
    
    // Default values
    const levels: InventoryLevels = {
      gel: 0,
      capsulas: 0
    };

    // Update with actual values
    inventory.forEach(item => {
      if (item.variationType in levels) {
        levels[item.variationType] = item.quantity;
      }
    });

    return levels;
  }

  /**
   * Get inventory statistics
   */
  getInventoryStats(): InventoryStats {
    const inventory = this.getInventory();
    const transactions = this.getTransactions();

    // Calculate total items and value
    let totalItems = 0;
    let totalValue = 0;
    let lowStockItems = 0;

    inventory.forEach(item => {
      totalItems += item.quantity;
      totalValue += item.quantity * item.costPerUnit;
      
      if (item.quantity <= item.minimumLevel) {
        lowStockItems++;
      }
    });

    // Find most sold variation
    const salesByVariation: Record<string, number> = {};
    transactions
      .filter(t => t.transactionType === InventoryTransactionType.SALE)
      .forEach(t => {
        if (!salesByVariation[t.variationType]) {
          salesByVariation[t.variationType] = 0;
        }
        salesByVariation[t.variationType] += Math.abs(t.quantity);
      });

    let mostSoldVariation: string | null = null;
    let highestSales = 0;

    Object.entries(salesByVariation).forEach(([variation, sales]) => {
      if (sales > highestSales) {
        highestSales = sales;
        mostSoldVariation = variation;
      }
    });

    return {
      totalItems,
      lowStockItems,
      totalValue,
      mostSoldVariation: mostSoldVariation as any // Type conversion
    };
  }

  /**
   * Filter inventory transactions by type, date range
   */
  filterTransactions(filters: {
    type?: InventoryTransactionType,
    startDate?: string,
    endDate?: string,
    variationType?: string
  }): InventoryTransaction[] {
    let transactions = this.getTransactions();

    // Filter by transaction type
    if (filters.type) {
      transactions = transactions.filter(t => t.transactionType === filters.type);
    }

    // Filter by date range
    if (filters.startDate) {
      const startDate = new Date(filters.startDate);
      transactions = transactions.filter(t => new Date(t.date) >= startDate);
    }

    if (filters.endDate) {
      const endDate = new Date(filters.endDate);
      transactions = transactions.filter(t => new Date(t.date) <= endDate);
    }

    // Filter by variation type
    if (filters.variationType) {
      transactions = transactions.filter(t => t.variationType === filters.variationType);
    }

    // Sort by date descending (newest first)
    return transactions.sort((a, b) => 
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  /**
   * Check if an inventory adjustment would result in negative inventory
   */
  wouldAdjustmentCauseNegativeInventory(variationType: string, adjustment: number): boolean {
    const inventory = this.getInventory();
    const item = inventory.find(i => i.variationType === variationType);
    
    if (!item) {
      return adjustment < 0; // If no item exists, negative adjustment would cause negative inventory
    }
    
    return (item.quantity + adjustment) < 0;
  }

  /**
   * Make inventory adjustment
   */
  adjustInventory(data: {
    variationType: string, 
    quantity: number, 
    notes: string,
    createdBy: string
  }): void {
    // Check if adjustment would cause negative inventory
    if (this.wouldAdjustmentCauseNegativeInventory(data.variationType, data.quantity)) {
      throw new Error('Adjustment would cause negative inventory');
    }

    // Add transaction
    this.addTransaction({
      variationType: data.variationType as any, // Type conversion
      quantity: data.quantity,
      transactionType: InventoryTransactionType.ADJUSTMENT,
      notes: data.notes,
      createdBy: data.createdBy
    });
  }
}

export default new InventoryService(); 