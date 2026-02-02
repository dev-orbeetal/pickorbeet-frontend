import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api/v1';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
});

// Request interceptor for adding auth token
api.interceptors.request.use(
  (config) => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('access_token');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor for handling token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      try {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          const response = await axios.post(`${API_BASE_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          
          const { access } = response.data;
          localStorage.setItem('access_token', access);
          
          originalRequest.headers.Authorization = `Bearer ${access}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        window.location.href = '/login';
      }
    }
    
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (data) => api.post('/auth/login/', data),
  register: (data) => api.post('/auth/register/', data),
  logout: (data) => api.post('/auth/logout/', data),
  getProfile: () => api.get('/auth/profile/'),
  updateProfile: (data) => api.patch('/auth/profile/', data),
  changePassword: (data) => api.post('/auth/change-password/', data),
};

// Products API
export const productsAPI = {
  getCategories: () => api.get('/products/categories/'),
  getCategory: (slug) => api.get(`/products/categories/${slug}/`),
  getProducts: (params) => api.get('/products/', { params }),
  getProduct: (slug) => api.get(`/products/${slug}/`),
  getFeaturedProducts: () => api.get('/products/featured/'),
  getProductsByCategory: () => api.get('/products/by-category/'),
};

// Cart API
export const cartAPI = {
  getCart: () => api.get('/orders/cart/'),
  addToCart: (data) => api.post('/orders/cart/add/', data),
  updateCartItem: (itemId, data) => api.patch(`/orders/cart/item/${itemId}/`, data),
  removeCartItem: (itemId) => api.delete(`/orders/cart/item/${itemId}/`),
  clearCart: () => api.delete('/orders/cart/clear/'),
};

// Orders API
export const ordersAPI = {
  checkout: (data) => api.post('/orders/checkout/', data),
  getMyOrders: () => api.get('/orders/my-orders/'),
  getOrder: (id) => api.get(`/orders/my-orders/${id}/`),
  trackOrder: (data) => api.post('/orders/track/', data),
};

// Payments API
export const paymentsAPI = {
  initiatePayment: (data) => api.post('/payments/initiate/', data),
};

export default api;
