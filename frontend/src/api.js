import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || 'https://demure-bakes-backend-production.up.railway.app';

const api = axios.create({
  baseURL: API_BASE,
  timeout: 15000,
});

// Attach auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('admin_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Products
export const getProducts = () => api.get('/api/products').then(r => r.data);
export const getProduct = (id) => api.get(`/api/products/${id}`).then(r => r.data);
export const createProduct = (data) => api.post('/api/products', data).then(r => r.data);
export const updateProduct = (id, data) => api.put(`/api/products/${id}`, data).then(r => r.data);
export const deleteProduct = (id) => api.delete(`/api/products/${id}`).then(r => r.data);

// Testimonials
export const getTestimonials = () => api.get('/api/testimonials').then(r => r.data);
export const getAllTestimonials = () => api.get('/api/testimonials/all').then(r => r.data);
export const createTestimonial = (data) => api.post('/api/testimonials', data).then(r => r.data);
export const updateTestimonial = (id, data) => api.put(`/api/testimonials/${id}`, data).then(r => r.data);
export const deleteTestimonial = (id) => api.delete(`/api/testimonials/${id}`).then(r => r.data);

// Bank Details
export const getBankDetails = () => api.get('/api/bank-details').then(r => r.data);
export const updateBankDetails = (data) => api.put('/api/bank-details', data).then(r => r.data);

// Gallery
export const getGallery = () => api.get('/api/gallery').then(r => r.data);
export const addGalleryImage = (data) => api.post('/api/gallery', data).then(r => r.data);
export const deleteGalleryImage = (id) => api.delete(`/api/gallery/${id}`).then(r => r.data);

// Instagram feed (auto-updates from @demurebakes)
export const getInstagramFeed = () => api.get('/api/instagram-feed').then(r => r.data);

// Orders
export const createOrder = (data) => api.post('/api/orders', data).then(r => r.data);
export const getOrders = () => api.get('/api/orders').then(r => r.data);
export const updateOrderStatus = (id, status) => api.put(`/api/orders/${id}/status`, { status }).then(r => r.data);

// Upload
export const uploadImages = (files) => {
  const formData = new FormData();
  files.forEach(f => formData.append('images', f));
  return api.post('/api/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};
export const uploadSingleImage = (file) => {
  const formData = new FormData();
  formData.append('image', file);
  return api.post('/api/upload/single', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }).then(r => r.data);
};

// Auth
export const login = (username, password) =>
  api.post('/api/auth/login', { username, password }).then(r => r.data);
export const changePassword = (currentPassword, newPassword) =>
  api.post('/api/auth/change-password', { currentPassword, newPassword }).then(r => r.data);

export const BACKEND_URL = API_BASE;
export default api;
