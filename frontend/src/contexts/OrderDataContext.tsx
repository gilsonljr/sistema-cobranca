import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Order } from '../types/Order';
import OrderService from '../services/OrderService';

interface OrderDataContextType {
  orders: Order[];
  filteredOrders: Order[];
  loading: boolean;
  error: string | null;
  fetchOrders: () => Promise<void>;
  updateOrder: (updatedOrder: Order) => Promise<void>;
  addOrder: (newOrder: Order) => Promise<void>;
  setFilteredOrders: React.Dispatch<React.SetStateAction<Order[]>>;
  clearAllOrders: () => void;
}

const OrderDataContext = createContext<OrderDataContextType | undefined>(undefined);

interface OrderDataProviderProps {
  children: ReactNode;
}

export const OrderDataProvider: React.FC<OrderDataProviderProps> = ({ children }) => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await OrderService.getOrders();
      setOrders(data);
      setFilteredOrders(data);
    } catch (err) {
      console.error('Error fetching orders:', err);
      setError('Erro ao carregar pedidos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const updateOrder = async (updatedOrder: Order) => {
    try {
      setLoading(true);
      if (!updatedOrder.idVenda) {
        throw new Error('ID de venda não fornecido');
      }

      await OrderService.updateOrder(updatedOrder.idVenda, updatedOrder);
      
      // Update orders in state
      setOrders(prevOrders => 
        prevOrders.map(order => 
          order.idVenda === updatedOrder.idVenda ? updatedOrder : order
        )
      );

      // Update filtered orders as well
      setFilteredOrders(prevOrders => 
        prevOrders.map(order => 
          order.idVenda === updatedOrder.idVenda ? updatedOrder : order
        )
      );
    } catch (err) {
      console.error('Error updating order:', err);
      setError('Erro ao atualizar pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const addOrder = async (newOrder: Order) => {
    try {
      setLoading(true);
      const createdOrder = await OrderService.createOrder(newOrder);
      
      // Add the new order to state
      setOrders(prevOrders => [...prevOrders, createdOrder]);
      
      // Add to filtered orders if they should be included based on current filters
      setFilteredOrders(prevOrders => [...prevOrders, createdOrder]);
    } catch (err) {
      console.error('Error adding order:', err);
      setError('Erro ao adicionar pedido');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const clearAllOrders = () => {
    localStorage.removeItem('orders');
    setOrders([]);
    setFilteredOrders([]);
  };

  return (
    <OrderDataContext.Provider
      value={{
        orders,
        filteredOrders,
        loading,
        error,
        fetchOrders,
        updateOrder,
        addOrder,
        setFilteredOrders,
        clearAllOrders,
      }}
    >
      {children}
    </OrderDataContext.Provider>
  );
};

export const useOrderData = (): OrderDataContextType => {
  const context = useContext(OrderDataContext);
  if (context === undefined) {
    throw new Error('useOrderData must be used within an OrderDataProvider');
  }
  return context;
}; 