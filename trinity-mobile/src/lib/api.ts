import axios, { AxiosInstance } from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://presystolic-uninterruptedly-wren.ngrok-free.dev';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
    'ngrok-skip-browser-warning': 'true',
  },
});

apiClient.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/users/login', { email, password });
    const { token, user } = response.data;
    
    await AsyncStorage.setItem('token', token);
    await AsyncStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  register: async (userData: any) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  },

  logout: async () => {
    await AsyncStorage.removeItem('token');
    await AsyncStorage.removeItem('user');
  },

  getCurrentUser: async () => {
    const userStr = await AsyncStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: async () => {
    const token = await AsyncStorage.getItem('token');
    return !!token;
  },
};

export const productsAPI = {
  getAll: async (page: number = 1, limit: number = 20, category?: string) => {
    const params: any = { page, limit, includeTotal: page === 1 };
    if (category) params.category = category;
    const response = await apiClient.get('/products', { params });
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/products/detail/${id}`);
    return response.data;
  },
};

export const invoicesAPI = {
  getByUserId: async (userId: string) => {
    const response = await apiClient.get(`/invoices/user/${userId}`);
    return response.data;
  },
};

export const paypalAPI = {
  createOrder: async (orderData: any) => {
    const response = await apiClient.post('/paypal/create-order', orderData);
    return response.data;
  },

  captureOrder: async (orderId: string, userId: string, items: any[]) => {
    const response = await apiClient.post('/paypal/capture-order', {
      orderId,
      userId,
      items,
    });
    return response.data;
  },
};
