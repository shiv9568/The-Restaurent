import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
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

// Food Items API
export const foodItemsAPI = {
  getAll: (params?: { category?: string; categoryId?: string; displayOnHomepage?: boolean; isAvailable?: boolean }) =>
    api.get('/food-items', { params }),
  
  getById: (id: string) =>
    api.get(`/food-items/${id}`),
  
  create: (data: any) =>
    api.post('/food-items', data),
  
  update: (id: string, data: any) =>
    api.put(`/food-items/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/food-items/${id}`),
};

// Categories API
export const categoriesAPI = {
  getAll: (params?: { displayOnHomepage?: boolean }) =>
    api.get('/categories', { params }),
  
  getById: (id: string) =>
    api.get(`/categories/${id}`),
  
  create: (data: any) =>
    api.post('/categories', data),
  
  update: (id: string, data: any) =>
    api.put(`/categories/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/categories/${id}`),
  
  initialize: () =>
    api.post('/categories/initialize'),
};

// Orders API
export const ordersAPI = {
  getAll: (params?: { status?: string; userId?: string; restaurantId?: string }) =>
    api.get('/orders', { params }),
  
  getById: (id: string) =>
    api.get(`/orders/${id}`),
  
  create: (data: any) =>
    api.post('/orders', data),
  
  update: (id: string, data: any) =>
    api.put(`/orders/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/orders/${id}`),
};

// Restaurants API
export const restaurantsAPI = {
  getAll: (params?: { isActive?: boolean }) =>
    api.get('/restaurants', { params }),
  
  getById: (id: string) =>
    api.get(`/restaurants/${id}`),
  
  create: (data: any) =>
    api.post('/restaurants', data),
  
  update: (id: string, data: any) =>
    api.put(`/restaurants/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/restaurants/${id}`),
};

// Auth API
export const authAPI = {
  register: (data: { name: string; email: string; password: string; phone?: string; role?: string }) =>
    api.post('/auth/register', data),
  
  login: (data: { email: string; password: string }) =>
    api.post('/auth/login', data),
};

// Users API
export const usersAPI = {
  getAll: () =>
    api.get('/users'),
  
  getById: (id: string) =>
    api.get(`/users/${id}`),
  
  update: (id: string, data: any) =>
    api.put(`/users/${id}`, data),
  
  delete: (id: string) =>
    api.delete(`/users/${id}`),
};

export default api;
