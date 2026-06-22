import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

// Create axios instance with defaults
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor — attach auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('vpass_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('vpass_token');
      localStorage.removeItem('vpass_user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ===== Auth API =====
export const authAPI = {
  login: (data) => api.post('/auth/login', data),
  register: (data) => api.post('/auth/register', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/update-profile', data),
};

// ===== Users API =====
export const usersAPI = {
  getAll: (params) => api.get('/users', { params }),
  getById: (id) => api.get(`/users/${id}`),
  update: (id, data) => api.put(`/users/${id}`, data),
  remove: (id) => api.delete(`/users/${id}`),
};

// ===== Visitors API =====
export const visitorsAPI = {
  create: (formData) => api.post('/visitors', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  getAll: (params) => api.get('/visitors', { params }),
  getById: (id) => api.get(`/visitors/${id}`),
  update: (id, formData) => api.put(`/visitors/${id}`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  }),
  preRegister: (data) => api.post('/visitors/pre-register', data),
  verifyOtp: (data) => api.post('/visitors/verify-otp', data),
};

// ===== Appointments API =====
export const appointmentsAPI = {
  create: (data) => api.post('/appointments', data),
  getAll: (params) => api.get('/appointments', { params }),
  getById: (id) => api.get(`/appointments/${id}`),
  update: (id, data) => api.put(`/appointments/${id}`, data),
  approve: (id) => api.put(`/appointments/${id}/approve`),
  reject: (id) => api.put(`/appointments/${id}/reject`),
};

// ===== Passes API =====
export const passesAPI = {
  issue: (data) => api.post('/passes', data),
  getAll: (params) => api.get('/passes', { params }),
  getById: (id) => api.get(`/passes/${id}`),
  verify: (passCode) => api.get(`/passes/verify/${passCode}`),
  download: (id) => api.get(`/passes/${id}/download`, { responseType: 'blob' }),
  revoke: (id) => api.put(`/passes/${id}/revoke`),
};

// ===== Check Logs API =====
export const checkLogsAPI = {
  checkIn: (data) => api.post('/checklogs/checkin', data),
  checkOut: (data) => api.post('/checklogs/checkout', data),
  getAll: (params) => api.get('/checklogs', { params }),
  getActive: () => api.get('/checklogs/active'),
};

// ===== Dashboard API =====
export const dashboardAPI = {
  getStats: () => api.get('/dashboard/stats'),
  getRecentActivity: () => api.get('/dashboard/recent-activity'),
  getVisitorTrend: (days) => api.get('/dashboard/visitor-trend', { params: { days } }),
  exportLogs: (params) => api.get('/dashboard/export', { params, responseType: 'blob' }),
};

export default api;
