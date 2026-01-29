import axios from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth API
export const authAPI = {
  register: (data: any) => api.post('/auth/register', data),
  login: (data: any) => api.post('/auth/login', data),
};

// Deals API
export const dealsAPI = {
  getAll: (params?: any) => api.get('/deals', { params }),
  getById: (id: string) => api.get(`/deals/${id}`),
};

// Claims API
export const claimsAPI = {
  claimDeal: (dealId: string) => api.post(`/claims/${dealId}/claim`),
  getUserClaims: () => api.get('/claims/user/claims'),
  getClaimById: (claimId: string) => api.get(`/claims/${claimId}`),
};

// Users API
export const usersAPI = {
  getProfile: () => api.get('/users/profile'),
  verifyUser: (data: any) => api.post('/users/verify', data),
  updateProfile: (data: any) => api.put('/users/profile', data),
};

// Payments API (Razorpay — purchase coins)
export const paymentsAPI = {
  getPacks: () => api.get('/payments/packs'),
  createOrder: (coins: number) => api.post('/payments/create-order', { coins }),
  verify: (data: { razorpay_order_id: string; razorpay_payment_id: string; razorpay_signature: string; coins: number }) =>
    api.post('/payments/verify', data),
};

export default api;
