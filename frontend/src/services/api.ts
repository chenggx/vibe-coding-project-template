import axios from 'axios';
import { getToken, clearToken } from '@/utils/token';

export interface ApiError extends Error {
  code: number;
}

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api',
  timeout: 10000,
  headers: { Accept: 'application/json' },
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => {
    const raw = response.data as Record<string, unknown>;
    const code = raw.code as number;
    const message = raw.message as string;
    const data = raw.data;
    if (code !== 0) {
      if (code === 10002) {
        clearToken();
        window.location.href = '/login';
      }
      const error = new Error(message) as ApiError;
      error.code = code;
      return Promise.reject(error);
    }
    if ('meta' in raw) {
      return { data, meta: raw.meta };
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      clearToken();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;
