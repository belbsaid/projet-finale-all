import axios from "axios";
import { useAuthStore } from "@/lib/auth";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 30000,
});

// Request interceptor – inject auth token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

// Response interceptor – handle 401
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      useAuthStore.getState().logout();
      if (typeof window !== "undefined") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;

// ─── Auth ───────────────────────────────────────────────────────────────────

export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  me: () => api.get("/auth/me"),
  changePassword: (currentPassword: string, newPassword: string) =>
    api.patch("/auth/change-password", { currentPassword, newPassword }),
};

// ─── Cars ────────────────────────────────────────────────────────────────────

export const carsApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/cars", { params }),
  getOne: (id: string) => api.get(`/cars/${id}`),
  create: (data: FormData | Record<string, unknown>) =>
    api.post("/cars", data, {
      headers:
        data instanceof FormData
          ? { "Content-Type": "multipart/form-data" }
          : {},
    }),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/cars/${id}`, data),
  delete: (id: string) => api.delete(`/cars/${id}`),
  updateStatus: (id: string, status: string) =>
    api.put(`/cars/${id}/status`, { status }),
  uploadPhotos: (id: string, formData: FormData) =>
    api.post(`/cars/${id}/photos`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deletePhoto: (id: string, filename: string) =>
    api.delete(`/cars/${id}/photos`, { data: { filename } }),
  uploadDocuments: (id: string, formData: FormData) =>
    api.post(`/cars/${id}/documents`, formData, {
      headers: { "Content-Type": "multipart/form-data" },
    }),
  deleteDocument: (id: string, docId: string) =>
    api.delete(`/cars/${id}/documents/${docId}`),
  getByBrand: (brandId: string) =>
    api.get(`/cars`, { params: { brand: brandId } }),
  getByModel: (modelId: string) =>
    api.get(`/cars`, { params: { model: modelId } }),
};

// ─── Brands ──────────────────────────────────────────────────────────────────

export const brandsApi = {
  getAll: () => api.get("/brands"),
  getOne: (id: string) => api.get(`/brands/${id}`),
  create: (data: Partial<{
    name: string;
    origin: string;
    logo: string;
    description: string;
    isActive: boolean;
    popularity: number;
    warrantyYears: number;
    hasLocalServiceCenter: boolean;
    website: string;
  }>) =>
    api.post("/brands", data),
  update: (
    id: string,
    data: Partial<{
      name: string;
      origin: string;
      logo: string;
      description: string;
      isActive: boolean;
      popularity: number;
      warrantyYears: number;
      hasLocalServiceCenter: boolean;
      website: string;
    }>,
  ) => api.put(`/brands/${id}`, data),
  delete: (id: string) => api.delete(`/brands/${id}`),
};

// ─── Models ──────────────────────────────────────────────────────────────────

export const modelsApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/models", { params }),
  getOne: (id: string) => api.get(`/models/${id}`),
  create: (data: {
    name: string;
    brand: string;
    category: string;
    year: number;
  }) => api.post("/models", data),
  update: (
    id: string,
    data: Partial<{
      name: string;
      brand: string;
      category: string;
      year: number;
    }>,
  ) => api.put(`/models/${id}`, data),
  delete: (id: string) => api.delete(`/models/${id}`),
};

// ─── Categories ──────────────────────────────────────────────────────────────

export const categoriesApi = {
  getAll: () => api.get("/categories"),
  getOne: (id: string) => api.get(`/categories/${id}`),
  create: (data: { name: string; description?: string }) =>
    api.post("/categories", data),
  update: (id: string, data: Partial<{ name: string; description: string }>) =>
    api.put(`/categories/${id}`, data),
  delete: (id: string) => api.delete(`/categories/${id}`),
};

// ─── Leads ───────────────────────────────────────────────────────────────────

export const leadsApi = {
  getAll: (params?: Record<string, unknown>) => api.get("/leads", { params }),
  getOne: (id: string) => api.get(`/leads/${id}`),
  create: (data: Record<string, unknown>) => api.post("/leads", data),
  update: (id: string, data: Record<string, unknown>) =>
    api.put(`/leads/${id}`, data),
  updateStatus: (id: string, status: string) =>
    api.put(`/leads/${id}/status`, { status }),
  assignCar: (id: string, carId: string | null) =>
    api.put(`/leads/${id}/car`, { carId }),
  delete: (id: string) => api.delete(`/leads/${id}`),
  getBookedDates: () => api.get("/leads/booked-dates"),
};

// ─── Documents ───────────────────────────────────────────────────────────────

export const documentsApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/documents", { params }),
  delete: (id: string) => api.delete(`/documents/${id}`),
};

// ─── Reports ─────────────────────────────────────────────────────────────────

export const reportsApi = {
  getRevenue: (params?: Record<string, unknown>) => {
    // Backend requires month & year query params
    const now = new Date();
    const defaults = {
      month: String(now.getMonth() + 1),
      year: String(now.getFullYear()),
    };
    return api.get("/reports/revenue", { params: { ...defaults, ...params } });
  },
  getTopModels: (params?: Record<string, unknown>) =>
    api.get("/reports/top-models", { params }),
  getSummary: () => api.get("/reports/stats"),
};

// ─── Activities (Audit Log) ──────────────────────────────────────────────────

export const activitiesApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/activities", { params }),
};

// ─── Users (Admin) ───────────────────────────────────────────────────────────

export const usersApi = {
  getAll: (params?: Record<string, unknown>) =>
    api.get("/users", { params }),
  getOne: (id: string) => api.get(`/users/${id}`),
};
