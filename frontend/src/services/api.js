import axios from 'axios';

// API configuration
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Create axios instance with base URL
const api = axios.create({
  baseURL: API_URL,
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

// Products API
export const productsApi = {
  // Get paginated products with optional search and category filters
  getProducts: async (params = { page: 1, perPage: 12 }) => {
    const response = await api.get('/products', { params });
    return response.data;
  },

  // Get single product with reviews
  getProduct: async (id, params = { page: 1, perPage: 10 }) => {
    const response = await api.get(`/products/${id}`, { params });
    return response.data;
  },

  // Create new product
  createProduct: async (productData) => {
    const response = await api.post('/products', productData);
    return response.data;
  },

  // Update product
  updateProduct: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Delete product
  deleteProduct: async (id) => {
    const response = await api.delete(`/products/${id}`);
    return response.data;
  },

  // Get seller's products
  getSellerProducts: async (params = { page: 1, perPage: 10 }) => {
    const response = await api.get('/products/seller/my-products', { params });
    return response.data;
  },

  // Update product with history tracking
  updateProductWithHistory: async (id, productData) => {
    const response = await api.put(`/products/${id}`, productData);
    return response.data;
  },

  // Get product edit history
  getProductHistory: async (id, params = { page: 1, perPage: 20 }) => {
    const response = await api.get(`/products/${id}/history`, { params });
    return response.data;
  },
};

// Reviews API
export const reviewsApi = {
  // Get paginated reviews for a product
  getProductReviews: async (productId, params = { page: 1, perPage: 10 }) => {
    const response = await api.get(`/reviews/product/${productId}`, { params });
    return response.data;
  },

  // Create a new review
  createReview: async (productId, reviewData) => {
    const response = await api.post(`/reviews/${productId}`, reviewData);
    return response.data;
  },

  // Update a review
  updateReview: async (reviewId, reviewData) => {
    const response = await api.put(`/reviews/${reviewId}`, reviewData);
    return response.data;
  },

  // Delete a review
  deleteReview: async (reviewId) => {
    const response = await api.delete(`/reviews/${reviewId}`);
    return response.data;
  },
};

// Orders API
export const ordersApi = {
  // Create a new order
  createOrder: async (orderData) => {
    const response = await api.post('/orders', orderData);
    return response.data;
  },

  // Get user's orders
  getOrders: async (params = { page: 1, perPage: 10 }) => {
    const response = await api.get('/orders', { params });
    return response.data;
  },

  // Get specific order
  getOrder: async (orderId) => {
    const response = await api.get(`/orders/${orderId}`);
    return response.data;
  },

  // Update order status (admin only)
  updateOrderStatus: async (orderId, status) => {
    const response = await api.put(`/orders/${orderId}/status`, { status });
    return response.data;
  },

  // Create return request
  createReturnRequest: async (orderId, returnData) => {
    const response = await api.post(`/orders/${orderId}/return`, returnData);
    return response.data;
  },

  // Get user's return requests
  getReturnRequests: async () => {
    const response = await api.get('/orders/returns/my');
    return response.data;
  },

  // Get all orders (admin only)
  getAllOrders: async (params = { page: 1, perPage: 100 }) => {
    const response = await api.get('/orders/admin', { params });
    return response.data;
  },
};

// Auth API
export const authApi = {
  login: async (credentials) => {
    const response = await api.post('/users/login', credentials);
    return response.data;
  },

  register: async (userData) => {
    const response = await api.post('/users/register', userData);
    return response.data;
  },

  logout: () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  },
};

export default api; 