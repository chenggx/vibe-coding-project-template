import axios from 'axios';
import { getToken, clearToken } from '@/utils/token';

export interface ApiError extends Error {
  code: number;
}

let isRedirecting = false;

function redirectToLogin() {
  if (isRedirecting) return;
  isRedirecting = true;
  clearToken();
  window.location.href = '/login';
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
    if (response.data === null || typeof response.data !== 'object') {
      return response.data;
    }
    const raw = response.data as Record<string, unknown>;
    const code = raw.code as number;
    const message = (raw.message as string) || '请求异常';
    const data = raw.data;
    if (code !== 0) {
      if (code === 10002) {
        redirectToLogin();
      }
      const error = new Error(message) as ApiError;
      error.code = code;
      return Promise.reject(error);
    }
    if ('meta' in raw && raw.meta !== undefined) {
      return { data, meta: raw.meta };
    }
    return data;
  },
  (error) => {
    if (error.response?.status === 401) {
      redirectToLogin();
    }

    const data = error.response?.data;
    if (data && typeof data === 'object' && 'message' in data) {
      const apiError = new Error(data.message as string) as ApiError;
      apiError.code = (data.code as number) ?? -1;
      return Promise.reject(apiError);
    }

    return Promise.reject(error);
  }
);

export default api;
