 import axios from "axios";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ??
  "https://exclusivedeal-1.onrender.com/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  // withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

// Attach JWT token
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

/* ================= AUTH API ================= */
export const authAPI = {
  register: (data: any) => api.post("/auth/register", data),
  login: (data: any) => api.post("/auth/login", data),
};

/* ================= DEALS API ================= */
export const dealsAPI = {
  getAll: (params?: any) => api.get("/deals", { params }),
  getById: (id: string) => api.get(`/deals/${id}`),
};

/* ================= CLAIMS API ================= */
export const claimsAPI = {
  claimDeal: (dealId: string) => api.post(`/claims/${dealId}/claim`),
  getUserClaims: () => api.get("/claims/user/claims"),
  getClaimById: (claimId: string) => api.get(`/claims/${claimId}`),
};

/* ================= USERS API ================= */
export const usersAPI = {
  getProfile: () => api.get("/users/profile"),
  verifyUser: (data: any) => api.post("/users/verify", data),
  updateProfile: (data: any) => api.put("/users/profile", data),
};

/* ================= PAYMENTS API ================= */
export const paymentsAPI = {
  getPacks: () => api.get("/payments/packs"),
  createOrder: (coins: number) =>
    api.post("/payments/create-order", { coins }),
  verify: (data: {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
    coins: number;
  }) => api.post("/payments/verify", data),
};

export default api;
