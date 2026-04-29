import axios from 'axios';

// We import getToken lazily to avoid circular deps with zustand store
let _getToken: (() => string | null) | null = null;
export function registerTokenGetter(fn: () => string | null) {
  _getToken = fn;
}

const api = axios.create({
  baseURL: 'http://localhost:4000/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// ─── Request interceptor: attach Bearer token ──────────
api.interceptors.request.use((config) => {
  const token = _getToken?.();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ─── Response interceptor: normalize errors ────────────
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Surface readable message
    const message =
      error.response?.data?.error?.message ||
      error.response?.data?.message ||
      error.message ||
      'Une erreur est survenue';
    return Promise.reject(new Error(message));
  }
);

export default api;
