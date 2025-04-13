import OrderService from '../OrderService';
import api from '../api';

// Mock the api module
jest.mock('../api');
const mockedApi = api as jest.Mocked<typeof api>;

describe('OrderService', () => {
  beforeEach(() => {
    // Clear localStorage and reset mocks before each test
    localStorage.clear();
    jest.clearAllMocks();
    
    // Force mock mode
    process.env.REACT_APP_MOCK_API = 'true';
  });

  describe('getOrders', () => {
    it('should return mock orders in mock mode', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'Test Customer' },
        { idVenda: '2', cliente: 'Another Customer' }
      ]));

      const orders = await OrderService.getOrders();
      
      expect(orders).toHaveLength(2);
      expect(orders[0].idVenda).toBe('1');
      expect(orders[1].idVenda).toBe('2');
      
      // API should not be called in mock mode
      expect(mockedApi.get).not.toHaveBeenCalled();
    });

    it('should return empty array if no orders in localStorage', async () => {
      const orders = await OrderService.getOrders();
      
      expect(orders).toHaveLength(0);
      expect(Array.isArray(orders)).toBe(true);
    });
  });

  describe('getOrder', () => {
    it('should return a specific order by ID', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'Test Customer' },
        { idVenda: '2', cliente: 'Another Customer' }
      ]));

      const order = await OrderService.getOrder('2');
      
      expect(order).not.toBeNull();
      expect(order?.idVenda).toBe('2');
      expect(order?.cliente).toBe('Another Customer');
    });

    it('should return null if order not found', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'Test Customer' }
      ]));

      const order = await OrderService.getOrder('999');
      
      expect(order).toBeNull();
    });
  });

  describe('createOrder', () => {
    it('should create a new order in mock mode', async () => {
      const newOrder = {
        cliente: 'New Customer',
        telefone: '1234567890',
        endereco: 'Test Address',
        valorTotal: 100,
        idVendedor: '1'
      };

      const createdOrder = await OrderService.createOrder(newOrder);
      
      expect(createdOrder).toHaveProperty('idVenda');
      expect(createdOrder.cliente).toBe('New Customer');
      
      // Check that order was added to localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      expect(storedOrders).toHaveLength(1);
      expect(storedOrders[0].cliente).toBe('New Customer');
    });
  });

  describe('updateOrder', () => {
    it('should update an existing order', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'Test Customer', valorTotal: 100 }
      ]));

      const updatedOrder = await OrderService.updateOrder('1', {
        cliente: 'Updated Customer',
        valorTotal: 150
      });
      
      expect(updatedOrder.idVenda).toBe('1');
      expect(updatedOrder.cliente).toBe('Updated Customer');
      expect(updatedOrder.valorTotal).toBe(150);
      
      // Check that order was updated in localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      expect(storedOrders[0].cliente).toBe('Updated Customer');
      expect(storedOrders[0].valorTotal).toBe(150);
    });

    it('should throw error if order not found', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'Test Customer' }
      ]));

      await expect(OrderService.updateOrder('999', { cliente: 'Updated' }))
        .rejects.toThrow('Pedido não encontrado');
    });
  });

  describe('deleteOrder', () => {
    it('should delete an existing order', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'Test Customer' },
        { idVenda: '2', cliente: 'Another Customer' }
      ]));

      await OrderService.deleteOrder('1');
      
      // Check that order was removed from localStorage
      const storedOrders = JSON.parse(localStorage.getItem('orders') || '[]');
      expect(storedOrders).toHaveLength(1);
      expect(storedOrders[0].idVenda).toBe('2');
    });

    it('should throw error if order not found', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'Test Customer' }
      ]));

      await expect(OrderService.deleteOrder('999'))
        .rejects.toThrow('Pedido não encontrado');
    });
  });

  describe('searchOrders', () => {
    it('should search orders by query', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'John Doe', telefone: '1234567890' },
        { idVenda: '2', cliente: 'Jane Doe', telefone: '0987654321' },
        { idVenda: '3', cliente: 'Bob Smith', telefone: '5555555555' }
      ]));

      const results = await OrderService.searchOrders('doe');
      
      expect(results).toHaveLength(2);
      expect(results[0].cliente).toBe('John Doe');
      expect(results[1].cliente).toBe('Jane Doe');
    });

    it('should return empty array if no matches', async () => {
      // Set up mock localStorage data
      localStorage.setItem('orders', JSON.stringify([
        { idVenda: '1', cliente: 'John Doe' },
        { idVenda: '2', cliente: 'Jane Doe' }
      ]));

      const results = await OrderService.searchOrders('xyz');
      
      expect(results).toHaveLength(0);
      expect(Array.isArray(results)).toBe(true);
    });
  });
});
