import axios from 'axios';
import { authStorage, clearAuth } from './authStorage';
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
  const token = authStorage().getItem('greenlife_token');
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
      clearAuth();
      if (window.location.pathname !== '/login' && window.location.pathname !== '/signup') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// In-memory Client Cache for ultra-fast snappy reaction times (0ms tab switching)
const apiCache = new Map<string, { data: any; timestamp: number }>();
const CACHE_TTL_MS = 60 * 1000; // 60 seconds

function getCached<T>(key: string): T | null {
  const entry = apiCache.get(key);
  if (!entry) return null;
  if (Date.now() - entry.timestamp > CACHE_TTL_MS) {
    apiCache.delete(key);
    return null;
  }
  return entry.data as T;
}

function setCached(key: string, data: any) {
  apiCache.set(key, { data, timestamp: Date.now() });
}

export function clearApiCache(prefix?: string) {
  if (!prefix) {
    apiCache.clear();
    return;
  }
  for (const k of apiCache.keys()) {
    if (k.startsWith(prefix)) {
      apiCache.delete(k);
    }
  }
}

// Background Keep-Alive to prevent Render free-tier sleep & ensure 0ms cold starts
export const initKeepAlive = () => {
  const ping = () => {
    api.get('/health').catch(() => {});
  };
  ping();
  setInterval(ping, 8 * 60 * 1000); // Every 8 minutes
};

// Auto-run keepalive once on frontend load
if (typeof window !== 'undefined') {
  setTimeout(() => initKeepAlive(), 1000);
}

export const authApi = {
  login: (credentials: any) => api.post('/auth/login', credentials),
  signup: (userData: any) => api.post('/auth/signup', userData),
  getMe: () => api.get('/auth/me'),
};

export const customerApi = {
  list: async (params?: { search?: string; skip?: number; limit?: number }) => {
    const key = `customers_${JSON.stringify(params || {})}`;
    const cached = getCached<any>(key);
    if (cached) {
      // Revalidate in background
      api.get<Customer[]>('/customers', { params }).then((res) => setCached(key, res)).catch(() => {});
      return cached;
    }
    const res = await api.get<Customer[]>('/customers', { params });
    setCached(key, res);
    return res;
  },
  create: async (data: Partial<Customer>) => {
    clearApiCache('customers_');
    return api.post<Customer>('/customers', data);
  },
  get: (id: number) => api.get<Customer>(`/customers/${id}`),
  update: async (id: number, data: Partial<Customer>) => {
    clearApiCache('customers_');
    return api.put<Customer>(`/customers/${id}`, data);
  },
  delete: async (id: number) => {
    clearApiCache('customers_');
    return api.delete(`/customers/${id}`);
  },
};

export const productApi = {
  list: async (params?: { category?: string; search?: string; active_only?: boolean }) => {
    const key = `products_${JSON.stringify(params || {})}`;
    const cached = getCached<any>(key);
    if (cached) {
      // Revalidate in background
      api.get<Product[]>('/products', { params }).then((res) => setCached(key, res)).catch(() => {});
      return cached;
    }
    const res = await api.get<Product[]>('/products', { params });
    setCached(key, res);
    return res;
  },
  create: async (data: Partial<Product>) => {
    clearApiCache('products_');
    return api.post<Product>('/products', data);
  },
  createBatch: async (products: Partial<Product>[]) => {
    clearApiCache('products_');
    return api.post<Product[]>('/products/batch', { products });
  },
  parseText: (text: string) => api.post<{ count: number; items: any[] }>('/products/parse-text', { text }),
  get: (id: number) => api.get<Product>(`/products/${id}`),
  update: async (id: number, data: Partial<Product>) => {
    clearApiCache('products_');
    return api.put<Product>(`/products/${id}`, data);
  },
  delete: async (id: number) => {
    clearApiCache('products_');
    return api.delete(`/products/${id}`);
  },
};

export const orderApi = {
  list: (params?: { status?: string; customer_id?: number; skip?: number; limit?: number }) => api.get<Order[]>('/orders', { params }),
  create: async (data: any) => {
    clearApiCache('customers_');
    return api.post<Order>('/orders', data);
  },
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

export const purchaseApi = {
  list: (params?: { search?: string; category?: string; payment_status?: string; start_date?: string; end_date?: string; skip?: number; limit?: number }) =>
    api.get<any[]>('/purchases', { params }),
  get: (id: number) => api.get<any>(`/purchases/${id}`),
  create: (data: any) => api.post<any>('/purchases', data),
  delete: (id: number) => api.delete(`/purchases/${id}`),
  getStats: () => api.get<{ total_bills: number; total_amount: number; total_paid: number; total_due: number }>('/purchases/stats'),
  extractBill: (file: File) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post<{ success: boolean; file_name: string; data: any }>('/purchases/extract-bill', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

export const reportApi = {
  getDashboardStats: () => api.get<DashboardStats>('/reports/dashboard-stats'),
  getRevenueChart: (period: 'daily' | 'weekly' | 'monthly') => api.get<any[]>('/reports/revenue-chart', { params: { period } }),
  getSales: () => api.get<any[]>('/reports/sales'),
  getProducts: () => api.get<any[]>('/reports/products'),
  getCustomers: () => api.get<any[]>('/reports/customers'),
  getPayments: () => api.get<any[]>('/reports/payments'),
  getExportCsvUrl: () => `${API_BASE}/reports/export/csv`,
  getAnnualTax: (financial_year?: string) => api.get<any>('/reports/annual-tax', { params: { financial_year } }),
  getAnnualTaxExportCsvUrl: (financial_year?: string) =>
    `${API_BASE}/reports/annual-tax/export-csv${financial_year ? '?financial_year=' + encodeURIComponent(financial_year) : ''}`,
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
