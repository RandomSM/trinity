import axios, { AxiosInstance, AxiosError } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:4000';

const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401 || error.response?.status === 403) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      
      if (typeof window !== 'undefined' && 
          !window.location.pathname.includes('/login') && 
          !window.location.pathname.includes('/register')) {
        window.location.href = '/login?expired=true';
      }
    }
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await apiClient.post('/users/login', { email, password });
    const { token, user } = response.data;
    
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    
    return response.data;
  },

  register: async (userData: {
    email: string;
    password: string;
    firstName?: string;
    lastName?: string;
    phone?: string;
    billing?: any;
  }) => {
    const response = await apiClient.post('/users/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  getCurrentUser: () => {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  },

  isAuthenticated: () => {
    return !!localStorage.getItem('token');
  },

  isAdmin: () => {
    const user = authAPI.getCurrentUser();
    return user?.isAdmin === true;
  },
};

export const usersAPI = {
  getAll: async () => {
    const response = await apiClient.get('/users');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  },

  update: async (id: string, userData: any) => {
    const response = await apiClient.put('/users/edit', { id, ...userData });
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete('/users/delete', { data: { id } });
    return response.data;
  },

  adminEdit: async (id: string, userData: any) => {
    const response = await apiClient.put(`/users/admin-edit/${id}`, userData);
    return response.data;
  },

  adminDelete: async (id: string) => {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  },
};

export const productsAPI = {
  getAll: async (page = 1, limit = 50, category?: string) => {
    const url = category 
      ? `/products?page=${page}&limit=${limit}&category=${category}`
      : `/products?page=${page}&limit=${limit}`;
    const response = await apiClient.get(url);
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/products/detail/${id}`);
    return response.data;
  },

  create: async (productData: any) => {
    const response = await apiClient.post('/products', productData);
    return response.data;
  },

  update: async (id: string, productData: any) => {
    const response = await apiClient.put(`/products/${id}`, productData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/products/${id}`);
    return response.data;
  },
};

export const invoicesAPI = {
  getAll: async () => {
    const response = await apiClient.get('/invoices');
    return response.data;
  },

  getById: async (id: string) => {
    const response = await apiClient.get(`/invoices/${id}`);
    return response.data;
  },

  getByUserId: async (userId: string) => {
    const response = await apiClient.get(`/invoices/user/${userId}`);
    return response.data;
  },

  create: async (userId: string, invoiceData: any) => {
    const response = await apiClient.post(`/invoices/${userId}`, invoiceData);
    return response.data;
  },

  update: async (id: string, invoiceData: any) => {
    const response = await apiClient.put(`/invoices/${id}`, invoiceData);
    return response.data;
  },

  delete: async (id: string) => {
    const response = await apiClient.delete(`/invoices/${id}`);
    return response.data;
  },

  refund: async (id: string, itemsToRefund?: Array<{index: number, quantity: number}>) => {
    const response = await apiClient.post(`/invoices/${id}/refund`, { itemsToRefund });
    return response.data;
  },
};

export const paypalAPI = {
  createOrder: async (orderData: any) => {
    const response = await apiClient.post('/paypal/create-order', orderData);
    return response.data;
  },

  captureOrder: async (orderId: string, userId: string, items: any[]) => {
    const response = await apiClient.post('/paypal/capture-order', { orderId, userId, items });
    return response.data;
  },
};

export const reportsAPI = {
  getLatest: async () => {
    const response = await apiClient.get('/reports');
    return response.data;
  },

  getTrendingProducts: async () => {
    const response = await apiClient.get('/reports/trending-products');
    return response.data;
  },

  getHistory: async (days?: number) => {
    const url = days ? `/reports/history?days=${days}` : '/reports/history';
    const response = await apiClient.get(url);
    return response.data;
  },

  updateKPIs: async () => {
    const response = await apiClient.post('/reports/update-kpis');
    return response.data;
  },
};

export default apiClient;
