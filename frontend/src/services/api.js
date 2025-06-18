import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

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