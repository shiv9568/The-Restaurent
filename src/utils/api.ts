import axios from 'axios';

const DEFAULT_API_BASE = typeof window !== 'undefined'
  ? (import.meta?.env?.VITE_API_BASE_URL || 'http://localhost:5000/api')
  : process.env.API_BASE_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: DEFAULT_API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests if available
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const restaurantAPI = {
  getAll: () => api.get('/restaurants'),
  getById: (id: string) => api.get(`/restaurants/${id}`),
  getMenu: (id: string) => api.get(`/restaurants/${id}/menu`),
};

export const orderAPI = {
  create: (orderData: any) => api.post('/orders', orderData),
  getAll: () => api.get('/orders'),
  getById: (id: string) => api.get(`/orders/${id}`),
  track: (id: string) => api.get(`/orders/${id}/track`),
  getInvoice: (id: string) => api.get(`/orders/${id}/invoice`),
  emailReceipt: (id: string) => api.post(`/orders/${id}/email-receipt`, {}),
};

export const userAPI = {
  login: (credentials: { email: string; password: string }) =>
    api.post('/users/login', credentials),
  signup: (userData: any) => api.post('/users/signup', userData),
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data: any) => api.put('/users/profile', data),

  // Address CRUD
  getUserAddresses: (userId: string) => api.get(`/users/${userId}/addresses`),
  addUserAddress: (userId: string, address: any) => api.post(`/users/${userId}/addresses`, address),
  updateUserAddress: (userId: string, addressId: string, address: any) =>
    api.put(`/users/${userId}/addresses/${addressId}`, address),
  deleteUserAddress: (userId: string, addressId: string) =>
    api.delete(`/users/${userId}/addresses/${addressId}`),
};

export const restaurantBrandAPI = {
  get: () => api.get('/restaurant-brand'),
  upsert: (data: any) => api.put('/restaurant-brand', data),
};

export default api;
