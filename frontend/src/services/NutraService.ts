import axios from 'axios';
import {
  Product, ProductCreate, ProductUpdate,
  ProductVariation, ProductVariationCreate,
  Kit, KitCreate, KitUpdate,
  Distributor, DistributorCreate, DistributorUpdate,
  Order, OrderCreate, OrderUpdate,
  StockHistory, StockHistoryCreate,
  KitSale, KitSaleCreate,
  ProductStockStatus, SalesAnalytics, InventorySummary
} from '../types/NutraTypes';
// AuthService import removed

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8000/api/v1';
const NUTRA_API = `${API_URL}/nutra`;

// Helper function to get auth headers
const getAuthHeaders = () => {
  // Get token from localStorage
  const token = localStorage.getItem('auth_tokens') ?
    JSON.parse(localStorage.getItem('auth_tokens') || '{}').access_token :
    null;
  return {
    headers: {
      Authorization: `Bearer ${token}`
    }
  };
};

// Product API calls
export const getProducts = async (activeOnly: boolean = true): Promise<Product[]> => {
  const response = await axios.get(`${NUTRA_API}/products?active_only=${activeOnly}`, getAuthHeaders());
  return response.data;
};

export const getProduct = async (id: number): Promise<Product> => {
  const response = await axios.get(`${NUTRA_API}/products/${id}`, getAuthHeaders());
  return response.data;
};

export const createProduct = async (product: ProductCreate): Promise<Product> => {
  console.log('API call to create product with data:', JSON.stringify(product));
  console.log('API URL:', `${NUTRA_API}/products`);
  console.log('Auth headers:', getAuthHeaders());
  try {
    const response = await axios.post(`${NUTRA_API}/products`, product, getAuthHeaders());
    console.log('API response:', response);
    return response.data;
  } catch (error: any) {
    console.error('API error details:', error);
    if (error.response) {
      console.error('Error response data:', error.response.data);
      console.error('Error response status:', error.response.status);
      console.error('Error response headers:', error.response.headers);
    } else if (error.request) {
      console.error('Error request:', error.request);
    } else {
      console.error('Error message:', error.message);
    }
    throw error;
  }
};

export const updateProduct = async (id: number, product: ProductUpdate): Promise<Product> => {
  const response = await axios.put(`${NUTRA_API}/products/${id}`, product, getAuthHeaders());
  return response.data;
};

export const deleteProduct = async (id: number): Promise<void> => {
  await axios.delete(`${NUTRA_API}/products/${id}`, getAuthHeaders());
};

export const adjustStock = async (productId: number, stockChange: StockHistoryCreate): Promise<StockHistory> => {
  const response = await axios.post(
    `${NUTRA_API}/products/${productId}/adjust-stock`,
    stockChange,
    getAuthHeaders()
  );
  return response.data;
};

export const getStockHistory = async (productId: number): Promise<StockHistory[]> => {
  const response = await axios.get(
    `${NUTRA_API}/products/${productId}/stock-history`,
    getAuthHeaders()
  );
  return response.data;
};

export const addProductVariation = async (productId: number, variation: ProductVariationCreate): Promise<ProductVariation> => {
  const response = await axios.post(
    `${NUTRA_API}/products/${productId}/variations`,
    variation,
    getAuthHeaders()
  );
  return response.data;
};

// Kit API calls
export const getKits = async (activeOnly: boolean = true): Promise<Kit[]> => {
  const response = await axios.get(`${NUTRA_API}/kits?active_only=${activeOnly}`, getAuthHeaders());
  return response.data;
};

export const getKit = async (id: number): Promise<Kit> => {
  const response = await axios.get(`${NUTRA_API}/kits/${id}`, getAuthHeaders());
  return response.data;
};

export const createKit = async (kit: KitCreate): Promise<Kit> => {
  const response = await axios.post(`${NUTRA_API}/kits`, kit, getAuthHeaders());
  return response.data;
};

export const updateKit = async (id: number, kit: KitUpdate): Promise<Kit> => {
  const response = await axios.put(`${NUTRA_API}/kits/${id}`, kit, getAuthHeaders());
  return response.data;
};

export const deleteKit = async (id: number): Promise<void> => {
  await axios.delete(`${NUTRA_API}/kits/${id}`, getAuthHeaders());
};

// Kit sales API calls
export const createKitSale = async (kitSale: KitSaleCreate): Promise<KitSale> => {
  const response = await axios.post(`${NUTRA_API}/kit-sales`, kitSale, getAuthHeaders());
  return response.data;
};

export const getKitSales = async (startDate?: Date, endDate?: Date): Promise<KitSale[]> => {
  let url = `${NUTRA_API}/kit-sales`;

  if (startDate || endDate) {
    const params = new URLSearchParams();
    if (startDate) params.append('start_date', startDate.toISOString());
    if (endDate) params.append('end_date', endDate.toISOString());
    url += `?${params.toString()}`;
  }

  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

// Distributor API calls
export const getDistributors = async (activeOnly: boolean = true): Promise<Distributor[]> => {
  const response = await axios.get(`${NUTRA_API}/distributors?active_only=${activeOnly}`, getAuthHeaders());
  return response.data;
};

export const getDistributor = async (id: number): Promise<Distributor> => {
  const response = await axios.get(`${NUTRA_API}/distributors/${id}`, getAuthHeaders());
  return response.data;
};

export const createDistributor = async (distributor: DistributorCreate): Promise<Distributor> => {
  const response = await axios.post(`${NUTRA_API}/distributors`, distributor, getAuthHeaders());
  return response.data;
};

export const updateDistributor = async (id: number, distributor: DistributorUpdate): Promise<Distributor> => {
  const response = await axios.put(`${NUTRA_API}/distributors/${id}`, distributor, getAuthHeaders());
  return response.data;
};

export const deleteDistributor = async (id: number): Promise<void> => {
  await axios.delete(`${NUTRA_API}/distributors/${id}`, getAuthHeaders());
};

// Order API calls
export const getOrders = async (status?: string): Promise<Order[]> => {
  let url = `${NUTRA_API}/orders`;
  if (status) url += `?status=${status}`;

  const response = await axios.get(url, getAuthHeaders());
  return response.data;
};

export const getOrder = async (id: number): Promise<Order> => {
  const response = await axios.get(`${NUTRA_API}/orders/${id}`, getAuthHeaders());
  return response.data;
};

export const createOrder = async (order: OrderCreate): Promise<Order> => {
  const response = await axios.post(`${NUTRA_API}/orders`, order, getAuthHeaders());
  return response.data;
};

export const updateOrder = async (id: number, order: OrderUpdate): Promise<Order> => {
  const response = await axios.put(`${NUTRA_API}/orders/${id}`, order, getAuthHeaders());
  return response.data;
};

export const completeOrder = async (id: number): Promise<Order> => {
  const response = await axios.post(`${NUTRA_API}/orders/${id}/complete`, {}, getAuthHeaders());
  return response.data;
};

// Analytics API calls
export const getLowStockProducts = async (thresholdPercentage: number = 100): Promise<ProductStockStatus[]> => {
  const response = await axios.get(
    `${NUTRA_API}/analytics/low-stock?threshold_percentage=${thresholdPercentage}`,
    getAuthHeaders()
  );
  return response.data;
};

export const getSalesAnalytics = async (days: number = 30): Promise<SalesAnalytics> => {
  const response = await axios.get(
    `${NUTRA_API}/analytics/sales?days=${days}`,
    getAuthHeaders()
  );
  return response.data;
};

export const getInventorySummary = async (): Promise<InventorySummary> => {
  const response = await axios.get(`${NUTRA_API}/analytics/inventory`, getAuthHeaders());
  return response.data;
};

const NutraService = {
  // Products
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  adjustStock,
  getStockHistory,
  addProductVariation,

  // Kits
  getKits,
  getKit,
  createKit,
  updateKit,
  deleteKit,

  // Kit Sales
  createKitSale,
  getKitSales,

  // Distributors
  getDistributors,
  getDistributor,
  createDistributor,
  updateDistributor,
  deleteDistributor,

  // Orders
  getOrders,
  getOrder,
  createOrder,
  updateOrder,
  completeOrder,

  // Analytics
  getLowStockProducts,
  getSalesAnalytics,
  getInventorySummary
};

export default NutraService;
