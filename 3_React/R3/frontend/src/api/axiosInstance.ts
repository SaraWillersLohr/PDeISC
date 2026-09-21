// cliente http con token jwt
import axios from 'axios';
import { getSessionStorage, STORAGE_KEYS } from '@/utils/storage';
import type { AuthSession } from '@/types';

// instancia axios centralizada � adjunta token jwt si existe sesi�n
const axiosInstance = axios.create({
  baseURL: '/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use((config) => {
  const stored = getSessionStorage<AuthSession>(STORAGE_KEYS.SESSION);
  if (stored?.data.token) {
    config.headers.Authorization = `Bearer ${stored.data.token}`;
  }
  return config;
});

// extraigo mensaje de error legible desde respuesta axios
export function getApiErrorMessage(error: unknown): string {
  if (axios.isAxiosError(error)) {
    return error.response?.data?.message ?? error.message ?? 'error de conexión';
  }
  if (error instanceof Error) return error.message;
  return 'error inesperado';
}

export default axiosInstance;

