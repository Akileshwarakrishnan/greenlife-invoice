import axios from 'axios';
import {
  Customer,
  Product,
  Order,
  Invoice,
  Payment,
  DashboardStats,
  WorkflowLog,
  ExtractedInvoiceData,
  SystemSettings
} from '../types';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_BASE,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Interceptor to attach token
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('greenlife_token');
  if (token && config.headers) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
}, (error) => Promise.reject(error));

// Interceptor for 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('greenlife_token');
      localStorage.removeItem('greenlife_user');
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  signup: (userData: any) => api.post('/auth/signup', userData),
  getMe: () => api.get('/auth/me'),
};

export const customerApi = {
  list: (params?: { search?: string; skip?: number; limit?: number }) => api.get<Customer[]>('/customers', { params }),
  create: (data: Partial<Customer>) => api.post<Customer>('/customers', data),
  get: (id: number) => api.get<Customer>(`/customers/${id}`),
  update: (id: number, data: Partial<Customer>) => api.put<Customer>(`/customers/${id}`, data),
  delete: (id: number) => api.delete(`/customers/${id}`),
};

export const productApi = {
  list: (params?: { category?: string; search?: string; active_only?: boolean }) => api.get<Product[]>('/products', { params }),
  create: (data: Partial<Product>) => api.post<Product>('/products', data),
  createBatch: (products: Partial<Product>[]) => api.post<Product[]>('/products/batch', { products }),
  parseText: (text: string) => api.post<{ count: number; items: any[] }>('/products/parse-text', { text }),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  update: (id: number, data: Partial<Product>) => api.put<Product>(`/products/${id}`, data),
  delete: (id: number) => api.delete(`/products/${id}`),
};

export const orderApi = {
  list: (params?: { status?: string; customer_id?: number; skip?: number; limit?: number }) => api.get<Order[]>('/orders', { params }),
  create: (data: any) => api.post<Order>('/orders', data),
  get: (id: number) => api.get<Order>(`/orders/${id}`),
  calculate: (data: any) => api.post('/orders/calculate', data),
};

export const invoiceApi = {
  list: (params?: { status?: string; search?: string; skip?: number; limit?: number }) => api.get<Invoice[]>('/invoices', { params }),
  get: (id: number) => api.get<Invoice>(`/invoices/${id}`),
  generate: (orderId: number, notes?: string) => api.post<Invoice>('/invoices/generate', { order_id: orderId, notes }),
  getPdfUrl: (id: number) => `${API_BASE}/invoices/${id}/pdf`,
  resend: (id: number, channel: 'email' | 'whatsapp' | 'both') => api.post(`/invoices/${id}/resend`, { channel }),
};

export const paymentApi = {
  list: (params?: { invoice_id?: number; customer_id?: number }) => api.get<Payment[]>('/payments', { params }),
  create: (data: any) => api.post<Payment>('/payments', data),
};

export const reportApi = {
  getDashboardStats: () => api.get<DashboardStats>('/reports/dashboard-stats'),
  getRevenueChart: (period: 'daily' | 'weekly' | 'monthly') => api.get<any[]>('/reports/revenue-chart', { params: { period } }),
  getSales: () => api.get<any[]>('/reports/sales'),
  getProducts: () => api.get<any[]>('/reports/products'),
  getCustomers: () => api.get<any[]>('/reports/customers'),
  getPayments: () => api.get<any[]>('/reports/payments'),
  getExportCsvUrl: () => `${API_BASE}/reports/export/csv`,
};

export const aiApi = {
  extractInvoice: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{
      success: boolean;
      extraction_id: number;
      file_name: string;
      data: ExtractedInvoiceData;
      confidence_score: number;
    }>('/ai/extract-invoice', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  query: (query: string) => api.post<{ query: string; answer: string; action_taken?: string; data?: any }>('/ai/chat-query', { query }),
};

export const automationApi = {
  getStatus: (params?: { workflow_name?: string }) => api.get<WorkflowLog[]>('/automation/status', { params }),
  trigger: (workflowName: string, payload?: any) => api.post('/automation/trigger', { workflow_name: workflowName, ...payload }),
  retry: (workflowLogId: number) => api.post('/automation/retry', { workflow_log_id: workflowLogId }),
};

export const settingsApi = {
  get: () => api.get<SystemSettings>('/settings'),
  updateBusiness: (data: any) => api.put('/settings/business', data),
};

export const auditApi = {
  list: (params?: { entity?: string; skip?: number; limit?: number }) => api.get<any[]>('/audit', { params }),
};

export default api;
