import axios, { AxiosInstance, AxiosRequestConfig } from 'axios';
import AuthService from './AuthService';

// Estender a interface AxiosInstance para incluir os métodos personalizados
interface EnhancedAxiosInstance extends AxiosInstance {
  getData<T>(endpoint: string, config?: AxiosRequestConfig): Promise<T>;
  postData<T>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<T>;
}

// Criando uma instância axios com configurações padrão
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos de timeout
}) as EnhancedAxiosInstance;

// Interceptor para adicionar token de autenticação se disponível
api.interceptors.request.use(config => {
  // Get token from AuthService
  const token = localStorage.getItem('auth_tokens') ?
    JSON.parse(localStorage.getItem('auth_tokens') || '{}').access_token :
    null;

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
}, error => {
  return Promise.reject(error);
});

// Interceptor de resposta para tratamento de erros e refresh de token
api.interceptors.response.use(
  response => response,
  async error => {
    const originalRequest = error.config;

    // Se o erro for 401 (não autorizado) e não for uma tentativa de refresh
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Simplified token refresh for compatibility
        console.log('Token expired, redirecting to login');

        // Logout and redirect to login
        AuthService.logout();
        window.location.href = '/login';

        return Promise.reject(error);
      } catch (refreshError) {
        console.error('Erro ao atualizar token:', refreshError);

        // Redirecionar para login em caso de falha no refresh
        AuthService.logout();
      }
    }

    return Promise.reject(error);
  }
);

// Função de helper para extrair somente os dados da resposta
api.getData = async function<T>(endpoint: string, config = {}): Promise<T> {
  const response = await api.get<T>(endpoint, config);
  return response.data;
};

// Função de helper para criar e extrair dados
api.postData = async function<T>(endpoint: string, data = {}, config = {}): Promise<T> {
  const response = await api.post<T>(endpoint, data, config);
  return response.data;
};

export default api;