import api from './api';
import { Order, BillingHistoryEntry } from '../types/Order';
import { ApiOrder, ApiOrderUpdate, ApiBillingHistoryCreate, ApiOrderCreate, ApiBillingHistory, OrderStatus } from '../types/api';
import { formatDate, parseAddress } from '../utils/formatters';

// Helper function to format date strings
const formatDateString = (dateString: string | null): string => {
  if (!dateString) return '';
  try {
    return formatDate(new Date(dateString));
  } catch (e) {
    return '';
  }
};

// Helper function to format billing history
const formatBillingHistory = (billingHistory: ApiBillingHistory[]): string => {
  return billingHistory
    .map(bh => {
      const date = formatDateString(bh.created_at);
      const amount = `R$ ${bh.amount.toFixed(2)}`;
      const notes = bh.notes ? ` - ${bh.notes}` : '';
      const createdBy = bh.created_by_name ? ` (por ${bh.created_by_name})` : '';
      return `${date}: ${amount}${notes}${createdBy}`;
    })
    .join('\n');
};

// Helper function to parse billing history from string
const parseBillingHistoryFromString = (historyString: string): BillingHistoryEntry[] => {
  if (!historyString) return [];

  return historyString.split('\n')
    .filter(line => line.trim() !== '')
    .map(line => {
      // Expected format: "DD/MM/YYYY: R$ 100.00 - Notes (por User)"
      const dateMatch = line.match(/^([0-9]{2}\/[0-9]{2}\/[0-9]{4})/);
      const amountMatch = line.match(/R\$ ([0-9]+(?:\.[0-9]{2})?)/);
      const notesMatch = line.match(/- ([^(]*)/);
      const createdByMatch = line.match(/\(por (.*)\)/);

      return {
        date: dateMatch ? dateMatch[1] : '',
        amount: amountMatch ? parseFloat(amountMatch[1]) : 0,
        notes: notesMatch ? notesMatch[1].trim() : undefined,
        createdBy: createdByMatch ? createdByMatch[1].trim() : undefined
      };
    });
};

class OrderService {
  /**
   * Convert backend order model to frontend order model
   */
  private convertToFrontendOrder(backendOrder: ApiOrder): Order {
    // Parse address components from customer_address
    const addressComponents = parseAddress(backendOrder.customer_address);

    // Create billing history entries
    const billingHistory = backendOrder.billing_history.map(bh => ({
      id: bh.id,
      amount: bh.amount,
      notes: bh.notes || undefined,
      date: formatDateString(bh.created_at),
      createdBy: bh.created_by_name
    }));

    // Create a mapping between backend and frontend models
    return {
      id: backendOrder.id,
      idVenda: backendOrder.order_number,
      dataVenda: formatDateString(backendOrder.created_at),
      cliente: backendOrder.customer_name,
      telefone: backendOrder.customer_phone,
      oferta: '', // This field doesn't exist in backend model
      valorVenda: backendOrder.total_amount,
      status: backendOrder.status,
      situacaoVenda: backendOrder.status, // Map backend status to situacaoVenda
      valorRecebido: backendOrder.paid_amount,
      historico: formatBillingHistory(backendOrder.billing_history),
      ultimaAtualizacao: formatDateString(backendOrder.updated_at || backendOrder.created_at),
      codigoRastreio: backendOrder.tracking_code || '',
      statusCorreios: '', // This will be populated by CorreiosService
      atualizacaoCorreios: '',
      vendedor: backendOrder.seller_name || '',
      operador: backendOrder.collector_name || '',
      zap: backendOrder.customer_phone,

      // Address fields from parsed customer_address
      estadoDestinatario: addressComponents.state,
      cidadeDestinatario: addressComponents.city,
      ruaDestinatario: addressComponents.street,
      cepDestinatario: addressComponents.zipCode,
      complementoDestinatario: addressComponents.complement,
      bairroDestinatario: addressComponents.neighborhood,
      numeroEnderecoDestinatario: addressComponents.number,

      // Additional fields with default values
      dataEstimadaChegada: '',
      codigoAfiliado: '',
      nomeAfiliado: '',
      emailAfiliado: '',
      documentoAfiliado: '',
      dataRecebimento: '',
      dataNegociacao: '',
      formaPagamento: '',
      documentoCliente: '',
      parcial: backendOrder.paid_amount > 0 && backendOrder.paid_amount < backendOrder.total_amount,
      pagamentoParcial: backendOrder.paid_amount,
      formaPagamentoParcial: '',
      dataPagamentoParcial: '',

      // Raw billing history entries
      billingHistory
    };
  }

  /**
   * Convert frontend order model to backend order model for updates
   */
  private convertToBackendOrderUpdate(frontendOrder: Partial<Order>): ApiOrderUpdate {
    const updateData: ApiOrderUpdate = {};

    if (frontendOrder.cliente !== undefined) {
      updateData.customer_name = frontendOrder.cliente;
    }

    if (frontendOrder.telefone !== undefined) {
      updateData.customer_phone = frontendOrder.telefone;
    }

    // Combine address fields if any of them are provided
    if (
      frontendOrder.ruaDestinatario !== undefined ||
      frontendOrder.numeroEnderecoDestinatario !== undefined ||
      frontendOrder.bairroDestinatario !== undefined ||
      frontendOrder.cidadeDestinatario !== undefined ||
      frontendOrder.estadoDestinatario !== undefined ||
      frontendOrder.cepDestinatario !== undefined ||
      frontendOrder.complementoDestinatario !== undefined
    ) {
      // Get current values or empty strings
      const street = frontendOrder.ruaDestinatario || '';
      const number = frontendOrder.numeroEnderecoDestinatario || '';
      const neighborhood = frontendOrder.bairroDestinatario || '';
      const city = frontendOrder.cidadeDestinatario || '';
      const state = frontendOrder.estadoDestinatario || '';
      const zipCode = frontendOrder.cepDestinatario || '';
      const complement = frontendOrder.complementoDestinatario || '';

      // Combine into a single address string
      updateData.customer_address = `${street}, ${number}, ${neighborhood}, ${city}, ${state}, ${zipCode}${complement ? `, ${complement}` : ''}`;
    }

    if (frontendOrder.valorVenda !== undefined) {
      updateData.total_amount = frontendOrder.valorVenda;
    }

    if (frontendOrder.situacaoVenda !== undefined) {
      updateData.status = frontendOrder.situacaoVenda as OrderStatus;
    }

    if (frontendOrder.valorRecebido !== undefined) {
      updateData.paid_amount = frontendOrder.valorRecebido;
    }

    if (frontendOrder.codigoRastreio !== undefined) {
      updateData.tracking_code = frontendOrder.codigoRastreio || null;
    }

    return updateData;
  }

  /**
   * Convert frontend order to backend order create model
   */
  private convertToBackendOrderCreate(frontendOrder: Order): ApiOrderCreate {
    // Combine address fields into a single string
    const address = `${frontendOrder.ruaDestinatario}, ${frontendOrder.numeroEnderecoDestinatario}, ${frontendOrder.bairroDestinatario}, ${frontendOrder.cidadeDestinatario}, ${frontendOrder.estadoDestinatario}, ${frontendOrder.cepDestinatario}${frontendOrder.complementoDestinatario ? `, ${frontendOrder.complementoDestinatario}` : ''}`;

    return {
      order_number: frontendOrder.idVenda,
      customer_name: frontendOrder.cliente,
      customer_phone: frontendOrder.telefone,
      customer_address: address,
      total_amount: frontendOrder.valorVenda,
      tracking_code: frontendOrder.codigoRastreio || null,
      seller_id: parseInt(frontendOrder.vendedor) || 1 // Default to ID 1 if not a valid number
    };
  }

  /**
   * Get all orders
   */
  async getOrders(): Promise<Order[]> {
    try {
      // For development with mock data, use localStorage
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        // Mock data from localStorage
        const ordersData = localStorage.getItem('orders');
        let orders: Order[] = ordersData ? JSON.parse(ordersData) : [];

        return orders.map(order => {
          // Ensure all orders have valid numeric fields
          return {
            ...order,
            valorVenda: order.valorVenda !== undefined ? order.valorVenda : 0,
            valorRecebido: order.valorRecebido !== undefined ? order.valorRecebido : 0,
            // Ensure situation is a string
            situacaoVenda: order.situacaoVenda || 'Pendente'
          };
        });
      }

      // For production with real API
      const response = await api.get<ApiOrder[]>('/api/v1/orders');
      return response.data.map(order => this.convertToFrontendOrder(order));
    } catch (error) {
      console.error('Error fetching orders:', error);
      return [];
    }
  }

  /**
   * Get a specific order by ID
   */
  async getOrder(orderId: string): Promise<Order> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        const orders = savedOrders ? JSON.parse(savedOrders) : [];
        const order = orders.find((o: Order) => o.idVenda === orderId);

        if (!order) {
          throw new Error('Order not found');
        }

        return order;
      }

      // For production with real API
      const response = await api.get<ApiOrder>(`/api/v1/orders/${orderId}`);
      return this.convertToFrontendOrder(response.data);
    } catch (error) {
      console.error(`Error fetching order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Create a new order
   */
  async createOrder(orderData: Order): Promise<Order> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        const orders = savedOrders ? JSON.parse(savedOrders) : [];

        // Check if order already exists
        const existingOrder = orders.find((o: Order) => o.idVenda === orderData.idVenda);
        if (existingOrder) {
          throw new Error('Order with this ID already exists');
        }

        // Add created_at and updated_at
        const newOrder = {
          ...orderData,
          dataVenda: formatDate(new Date()),
          ultimaAtualizacao: formatDate(new Date())
        };

        // Add to orders array
        const updatedOrders = [...orders, newOrder];
        localStorage.setItem('orders', JSON.stringify(updatedOrders));

        return newOrder;
      }

      // For production with real API
      const backendOrderData = this.convertToBackendOrderCreate(orderData);
      const response = await api.post<ApiOrder>('/api/v1/orders', backendOrderData);
      return this.convertToFrontendOrder(response.data);
    } catch (error) {
      console.error('Error creating order:', error);
      throw error;
    }
  }

  /**
   * Update an order
   */
  async updateOrder(orderId: string, orderData: Partial<Order>): Promise<Order> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        let orders = savedOrders ? JSON.parse(savedOrders) : [];

        // Find and update the order
        orders = orders.map((o: Order) => {
          if (o.idVenda === orderId) {
            return {
              ...o,
              ...orderData,
              ultimaAtualizacao: formatDate(new Date()),
              // Update status field to match situacaoVenda if it was updated
              status: orderData.situacaoVenda || o.status
            };
          }
          return o;
        });

        // Save back to localStorage
        localStorage.setItem('orders', JSON.stringify(orders));

        // Return the updated order
        return orders.find((o: Order) => o.idVenda === orderId);
      }

      // For production with real API
      const backendOrderData = this.convertToBackendOrderUpdate(orderData);
      const response = await api.put<ApiOrder>(`/api/v1/orders/${orderId}`, backendOrderData);
      return this.convertToFrontendOrder(response.data);
    } catch (error) {
      console.error(`Error updating order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Add billing history to an order
   */
  async addBillingHistory(orderId: string, amount: number, notes?: string): Promise<Order> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        let orders = savedOrders ? JSON.parse(savedOrders) : [];

        // Find the order
        const orderIndex = orders.findIndex((o: Order) => o.idVenda === orderId);
        if (orderIndex === -1) {
          throw new Error('Order not found');
        }

        const order = orders[orderIndex];

        // Calculate new values
        const newValorRecebido = (order.valorRecebido || 0) + amount;
        const date = formatDate(new Date());
        const newHistoryEntry = `${date}: R$ ${amount.toFixed(2)}${notes ? ` - ${notes}` : ''}`;
        const newHistorico = order.historico ? `${order.historico}\n${newHistoryEntry}` : newHistoryEntry;

        // Update payment status
        let newSituacaoVenda = order.situacaoVenda;
        if (newValorRecebido >= order.valorVenda) {
          newSituacaoVenda = OrderStatus.PAID;
        } else if (newValorRecebido > 0) {
          newSituacaoVenda = OrderStatus.PARTIALLY_PAID;
        }

        // Create new billing history entry
        const newBillingEntry: BillingHistoryEntry = {
          amount,
          notes,
          date,
          createdBy: 'Current User' // In a real app, this would be the current user's name
        };

        // Update the order
        const updatedOrder: Order = {
          ...order,
          valorRecebido: newValorRecebido,
          historico: newHistorico,
          situacaoVenda: newSituacaoVenda,
          status: newSituacaoVenda, // Update status to match situacaoVenda
          ultimaAtualizacao: date,
          billingHistory: [...(order.billingHistory || []), newBillingEntry]
        };

        // Update the orders array
        orders[orderIndex] = updatedOrder;
        localStorage.setItem('orders', JSON.stringify(orders));

        return updatedOrder;
      }

      // For production with real API
      const billingData: ApiBillingHistoryCreate = {
        order_id: parseInt(orderId),
        amount,
        notes: notes || null
      };

      const response = await api.post<ApiOrder>(`/api/v1/orders/${orderId}/billing`, billingData);
      return this.convertToFrontendOrder(response.data);
    } catch (error) {
      console.error(`Error adding billing history to order ${orderId}:`, error);
      throw error;
    }
  }

  /**
   * Update tracking code for an order
   */
  async updateTrackingCode(orderId: string, trackingCode: string): Promise<Order> {
    return this.updateOrder(orderId, { codigoRastreio: trackingCode });
  }

  /**
   * Get duplicate orders
   */
  async getDuplicateOrders(): Promise<Order[]> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        const orders = savedOrders ? JSON.parse(savedOrders) : [];

        // Find orders with the same customer phone
        const duplicates: Order[] = [];
        const phoneMap = new Map<string, Order[]>();

        orders.forEach((order: Order) => {
          if (order.telefone) {
            if (!phoneMap.has(order.telefone)) {
              phoneMap.set(order.telefone, []);
            }
            phoneMap.get(order.telefone)?.push(order);
          }
        });

        // Add orders to duplicates if there are multiple with the same phone
        phoneMap.forEach((orderList) => {
          if (orderList.length > 1) {
            duplicates.push(...orderList);
          }
        });

        return duplicates;
      }

      // For production with real API
      const response = await api.get<ApiOrder[]>('/api/v1/orders/duplicates');
      return response.data.map(order => this.convertToFrontendOrder(order));
    } catch (error) {
      console.error('Error fetching duplicate orders:', error);
      throw error;
    }
  }

  /**
   * Run duplicate detection algorithm
   */
  async detectDuplicates(): Promise<Order[]> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        // In mock mode, just return the existing duplicates
        return this.getDuplicateOrders();
      }

      // For production with real API
      const response = await api.post<ApiOrder[]>('/api/v1/orders/detect-duplicates');
      return response.data.map(order => this.convertToFrontendOrder(order));
    } catch (error) {
      console.error('Error detecting duplicate orders:', error);
      throw error;
    }
  }

  /**
   * Search orders
   */
  async searchOrders(query: string): Promise<Order[]> {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        const orders = savedOrders ? JSON.parse(savedOrders) : [];

        // Search in various fields
        return orders.filter((order: Order) => {
          const searchFields = [
            order.idVenda,
            order.cliente,
            order.telefone,
            order.codigoRastreio
          ];

          return searchFields.some(field =>
            field && field.toLowerCase().includes(query.toLowerCase())
          );
        });
      }

      // For production with real API
      const response = await api.get<ApiOrder[]>(`/api/v1/orders/search?q=${encodeURIComponent(query)}`);
      return response.data.map(order => this.convertToFrontendOrder(order));
    } catch (error) {
      console.error(`Error searching orders with query "${query}":`, error);
      throw error;
    }
  }

  /**
   * Get order statistics
   */
  async getOrderStatistics() {
    try {
      // For development with mock data
      const mockMode = process.env.REACT_APP_MOCK_API === 'true';

      if (mockMode) {
        const savedOrders = localStorage.getItem('orders');
        const orders = savedOrders ? JSON.parse(savedOrders) : [];

        // Calculate statistics
        const totalOrders = orders.length;
        const totalAmount = orders.reduce((sum: number, order: Order) => sum + (order.valorVenda || 0), 0);
        const totalPaid = orders.reduce((sum: number, order: Order) => sum + (order.valorRecebido || 0), 0);

        // Count orders by status
        const statusCounts: Record<string, number> = {};
        orders.forEach((order: Order) => {
          const status = order.situacaoVenda || 'unknown';
          statusCounts[status] = (statusCounts[status] || 0) + 1;
        });

        return {
          total_orders: totalOrders,
          total_amount: totalAmount,
          total_paid: totalPaid,
          payment_rate: totalAmount > 0 ? totalPaid / totalAmount : 0,
          status_counts: statusCounts
        };
      }

      // For production with real API
      const response = await api.get('/api/v1/orders/statistics');
      return response.data;
    } catch (error) {
      console.error('Error fetching order statistics:', error);
      throw error;
    }
  }
}

export default new OrderService();
