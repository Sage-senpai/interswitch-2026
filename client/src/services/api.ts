import axios from 'axios';
import { storage } from '../utils/storage';

const API_URL = process.env.EXPO_PUBLIC_API_URL || 'https://interswitch-2026-production.up.railway.app/api/v1';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token to every request
api.interceptors.request.use(async (config) => {
  const token = await storage.getItemAsync('authToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle auth errors
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.deleteItemAsync('authToken');
    }
    return Promise.reject(error);
  },
);

// ─── Auth ────────────────────────────────────────────────

export const authAPI = {
  register: (phone: string, name?: string) =>
    api.post('/auth/register', { phone, name }),

  verify: (phone: string, code: string, name?: string) =>
    api.post('/auth/verify', { phone, code, name }),

  login: (phone: string) =>
    api.post('/auth/login', { phone }),

  verifyLogin: (phone: string, code: string) =>
    api.post('/auth/verify-login', { phone, code }),
};

// ─── User ────────────────────────────────────────────────

export const userAPI = {
  getProfile: () => api.get('/users/me'),
  updateProfile: (data: Record<string, string>) => api.put('/users/me', data),
  getWalletBalance: () => api.get('/wallet/balance'),
  getTransactions: (page = 1) => api.get(`/wallet/transactions?page=${page}`),
};

// ─── Lessons ─────────────────────────────────────────────

export const lessonAPI = {
  getAll: (category?: string) =>
    api.get('/lessons', { params: category ? { category } : {} }),

  getOne: (id: string) => api.get(`/lessons/${id}`),

  complete: (id: string, score: number) =>
    api.post(`/lessons/${id}/complete`, { score }),
};

// ─── Savings ─────────────────────────────────────────────

export const savingsAPI = {
  getGoals: () => api.get('/savings/goals'),

  createGoal: (data: { name: string; category: string; target: number; targetDate?: string }) =>
    api.post('/savings/goals', data),

  deposit: (goalId: string, amount: number) =>
    api.post(`/savings/goals/${goalId}/deposit`, { amount }),

  withdraw: (goalId: string, amount: number) =>
    api.post(`/savings/goals/${goalId}/withdraw`, { amount }),

  enableAutoPay: (goalId: string, amount: number, frequency: string) =>
    api.post('/savings/autopay', { goalId, amount, frequency }),

  cancelAutoPay: (goalId: string) =>
    api.delete(`/savings/autopay/${goalId}`),
};

// ─── Payments ────────────────────────────────────────────

export const paymentAPI = {
  fundWallet: (amount: number) =>
    api.post('/payments/fund', { amount }),

  payBill: (data: { paymentCode: string; customerId: string; customerMobile: string; amount: number }) =>
    api.post('/payments/bills', data),

  getBillerCategories: () =>
    api.get('/payments/billers/categories'),

  getBillers: (categoryId: string) =>
    api.get(`/payments/billers?categoryId=${categoryId}`),

  getPaymentStatus: (reference: string) =>
    api.get(`/payments/status/${reference}`),
};

// ─── Transfers ───────────────────────────────────────────

export const transferAPI = {
  getBanks: () => api.get('/transfers/banks'),

  nameEnquiry: (bankCode: string, accountNumber: string) =>
    api.post('/transfers/name-enquiry', { bankCode, accountNumber }),

  send: (data: { bankCode: string; accountNumber: string; amount: number; recipientName: string; narration?: string }) =>
    api.post('/transfers/send', data),
};

// ─── WAGs ────────────────────────────────────────────────

export const wagAPI = {
  getMyWAGs: () => api.get('/wags'),

  create: (data: { name: string; description?: string; state: string; maxMembers?: number }) =>
    api.post('/wags', data),

  join: (wagId: string) => api.post(`/wags/${wagId}/join`),

  getDetails: (wagId: string) => api.get(`/wags/${wagId}`),

  contribute: (wagId: string, amount: number) =>
    api.post(`/wags/${wagId}/contribute`, { amount }),
};

// ─── AI ──────────────────────────────────────────────────

export const aiAPI = {
  chat: (message: string) => api.post('/ai/chat', { message }),
  getInsights: () => api.get('/ai/insights'),
};

export default api;
