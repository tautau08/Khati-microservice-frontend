import axios, { AxiosError, AxiosInstance } from 'axios';

// API Base URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8080';

console.log('API Base URL:', API_BASE_URL);

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Log request details for debugging
    if (config.url?.includes('update-role')) {
      console.log('🔍 Update Role Request:');
      console.log('URL:', config.url);
      console.log('Method:', config.method);
      console.log('Data:', config.data);
      console.log('Data Type:', typeof config.data);
      console.log('Data JSON:', JSON.stringify(config.data));
    }
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      if (typeof window !== 'undefined') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// API Functions

// Authentication
export const authAPI = {
  register: (data: { username: string; password: string; email: string }) =>
    apiClient.post('/api/auth/register', data),
  
  login: (data: { username: string; password: string }) =>
    apiClient.post('/api/auth/login', data),
  
  updateRole: (userId: number, roles: string[]) => {
    return apiClient.put(`/api/auth/update-role?userId=${userId}`, roles, {
      headers: {
        'Content-Type': 'application/json',
      },
      transformRequest: [(data) => {
        // Ensure the array is sent as JSON array
        return JSON.stringify(data);
      }],
    });
  },
};

// Users
export const userAPI = {
  getCurrentUser: () => apiClient.get('/api/users/me'),
  
  getAllUsers: () => apiClient.get('/api/users'),
  
  getCustomers: () => apiClient.get('/api/users/customers'),
  
  getUserById: (id: number) => apiClient.get(`/api/users/${id}`),
  
  updateManagerInfo: (id: number, data: { salary?: number; joiningDate?: string; attendance?: number }) =>
    apiClient.put(`/api/users/${id}/manager-info`, data),
};

// Products
export const productAPI = {
  getAllProducts: () => apiClient.get('/api/inventory/products'),
  
  getProductById: (id: number) => apiClient.get(`/api/inventory/products/${id}`),
  
  createProduct: (data: {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
  }) => apiClient.post('/api/inventory/admin/products', data),
  
  updateProduct: (id: number, data: {
    name: string;
    description: string;
    price: number;
    stockQuantity: number;
    categoryId: number;
  }) => apiClient.put(`/api/inventory/admin/products/${id}`, data),
  
  deleteProduct: (id: number) => apiClient.delete(`/api/inventory/admin/products/${id}`),
};

// Categories
export const categoryAPI = {
  getAllCategories: () => apiClient.get('/api/inventory/categories'),
  
  createCategory: (data: { name: string; description: string }) =>
    apiClient.post('/api/inventory/admin/categories', data),
  
  updateCategory: (id: number, data: { name: string; description: string }) =>
    apiClient.put(`/api/inventory/admin/categories/${id}`, data),
  
  deleteCategory: (id: number) => apiClient.delete(`/api/inventory/admin/categories/${id}`),
};

// Orders
export const orderAPI = {
  createOrder: (data: { items: Array<{ productId: number; quantity: number }> }) =>
    apiClient.post('/api/orders', data),
  
  getMyOrders: () => apiClient.get('/api/orders/my'),
  
  getOrderById: (id: number) => apiClient.get(`/api/orders/${id}`),
  
  getAllOrders: () => apiClient.get('/api/orders/all'),
  
  getAllOrdersManager: () => apiClient.get('/api/orders/all'),
  
  updateOrderStatusAdmin: (id: number, status: string) =>
    apiClient.put(`/api/orders/${id}/status`, { status }),
  
  updateOrderStatusManager: (id: number, status: string) =>
    apiClient.put(`/api/orders/${id}/status`, { status }),
};

export default apiClient;
