import axios from 'axios'

// Create axios instance with base configuration
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || '/api',
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    return response.data
  },
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('token')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication services
export const authService = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  logout: () => api.post('/auth/logout'),
  getCurrentUser: () => api.get('/auth/me'),
  updateProfile: (profileData) => api.put('/auth/profile', profileData),
  changePassword: (passwordData) => api.put('/auth/change-password', passwordData),
  verifyToken: (token) => api.post('/auth/verify-token', { token }),
}

// AI services
export const aiService = {
  query: (query) => api.post('/ai/query', { query }),
  voiceQuery: (audioData) => api.post('/ai/voice', { audioData }),
  chat: (message, conversationId) => api.post('/ai/chat', { message, conversationId }),
  getSuggestions: (context) => api.get(`/ai/suggestions?context=${context}`),
  getStatus: () => api.get('/ai/status'),
  addToKnowledgeBase: (data) => api.post('/ai/knowledge-base/add', data),
}

// Inventory services
export const inventoryService = {
  getAll: (params = {}) => api.get('/inventory', { params }),
  getById: (id) => api.get(`/inventory/${id}`),
  create: (data) => api.post('/inventory', data),
  update: (id, data) => api.put(`/inventory/${id}`, data),
  delete: (id) => api.delete(`/inventory/${id}`),
  getLowStock: () => api.get('/inventory/low-stock'),
  getExpiring: () => api.get('/inventory/expiring'),
  adjustStock: (id, adjustment) => api.post(`/inventory/${id}/adjust`, adjustment),
}

// Product services
export const productService = {
  getAll: (params = {}) => api.get('/products', { params }),
  getById: (id) => api.get(`/products/${id}`),
  create: (data) => api.post('/products', data),
  update: (id, data) => api.put(`/products/${id}`, data),
  delete: (id) => api.delete(`/products/${id}`),
  search: (query) => api.get(`/products/search?q=${query}`),
  getCategories: () => api.get('/products/categories'),
}

// Sales services
export const salesService = {
  getAll: (params = {}) => api.get('/sales', { params }),
  getById: (id) => api.get(`/sales/${id}`),
  create: (data) => api.post('/sales', data),
  update: (id, data) => api.put(`/sales/${id}`, data),
  delete: (id) => api.delete(`/sales/${id}`),
  getReport: (startDate, endDate) => 
    api.get(`/sales/report?start=${startDate}&end=${endDate}`),
  processPayment: (saleId, paymentData) => 
    api.post(`/sales/${saleId}/payment`, paymentData),
}

// Order services
export const orderService = {
  getAll: (params = {}) => api.get('/orders', { params }),
  getById: (id) => api.get(`/orders/${id}`),
  create: (data) => api.post('/orders', data),
  update: (id, data) => api.put(`/orders/${id}`, data),
  delete: (id) => api.delete(`/orders/${id}`),
  approve: (id) => api.put(`/orders/${id}/approve`),
  receive: (id, receivedItems) => api.put(`/orders/${id}/receive`, receivedItems),
  cancel: (id, reason) => api.put(`/orders/${id}/cancel`, { reason }),
}

// Supplier services
export const supplierService = {
  getAll: (params = {}) => api.get('/suppliers', { params }),
  getById: (id) => api.get(`/suppliers/${id}`),
  create: (data) => api.post('/suppliers', data),
  update: (id, data) => api.put(`/suppliers/${id}`, data),
  delete: (id) => api.delete(`/suppliers/${id}`),
  getProducts: (id) => api.get(`/suppliers/${id}/products`),
}

// User services
export const userService = {
  getAll: (params = {}) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  create: (data) => api.post('/users', data),
  update: (id, data) => api.put(`/users/${id}`, data),
  delete: (id) => api.delete(`/users/${id}`),
  activate: (id) => api.put(`/users/${id}/activate`),
  deactivate: (id) => api.put(`/users/${id}/deactivate`),
}

// Analytics services
export const analyticsService = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getSalesReport: (period) => api.get(`/analytics/sales?period=${period}`),
  getInventoryReport: () => api.get('/analytics/inventory'),
  getFinancialReport: (startDate, endDate) => 
    api.get(`/analytics/financial?start=${startDate}&end=${endDate}`),
  getUserActivity: () => api.get('/analytics/user-activity'),
  getTopProducts: (limit = 10) => api.get(`/analytics/top-products?limit=${limit}`),
}

// Alert services
export const alertService = {
  getAll: () => api.get('/alerts'),
  markAsRead: (id) => api.put(`/alerts/${id}/read`),
  markAllAsRead: () => api.put('/alerts/read-all'),
  delete: (id) => api.delete(`/alerts/${id}`),
  create: (data) => api.post('/alerts', data),
}

// Knowledge base services
export const knowledgeService = {
  getAll: (params = {}) => api.get('/knowledge-base', { params }),
  getById: (id) => api.get(`/knowledge-base/${id}`),
  create: (data) => api.post('/knowledge-base', data),
  update: (id, data) => api.put(`/knowledge-base/${id}`, data),
  delete: (id) => api.delete(`/knowledge-base/${id}`),
  search: (query) => api.get(`/knowledge-base/search?q=${query}`),
  getCategories: () => api.get('/knowledge-base/categories'),
}

// File upload service
export const uploadService = {
  uploadFile: (file, type = 'general') => {
    const formData = new FormData()
    formData.append('file', file)
    formData.append('type', type)
    
    return api.post('/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
  
  uploadMultiple: (files, type = 'general') => {
    const formData = new FormData()
    files.forEach((file, index) => {
      formData.append(`files[${index}]`, file)
    })
    formData.append('type', type)
    
    return api.post('/upload/multiple', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },
}

// System services
export const systemService = {
  getHealth: () => api.get('/health'),
  getConfig: () => api.get('/system/config'),
  updateConfig: (config) => api.put('/system/config', config),
  backup: () => api.post('/system/backup'),
  getLogs: (params = {}) => api.get('/system/logs', { params }),
  getAuditLogs: (params = {}) => api.get('/system/audit-logs', { params }),
}

// Export the configured axios instance for custom requests
export default api