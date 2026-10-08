import { API_BASE_URL } from '../config/api';
import type { ApiResponse } from '../types/domain';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

export async function apiRequest<T>(path: string, token: string, init: RequestInit = {}): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}`, ...init.headers },
    });
  } catch {
    throw new Error(`No se pudo conectar con ${API_BASE_URL}. Revisá la API, la red y la URL configurada.`);
  }
  const body = await response.json() as ApiResponse<T>;
  if (!response.ok || !body.success) throw new ApiError(body.message || 'Error de API.', response.status);
  return body.data;
}

export async function publicRequest<T>(path: string, init: RequestInit): Promise<T> {
  let response: Response;
  try {
    response = await fetch(`${API_BASE_URL}${path}`, {
      ...init,
      headers: { 'Content-Type': 'application/json', ...init.headers },
    });
  } catch {
    throw new Error(`No se pudo conectar con ${API_BASE_URL}. Revisá la API, la red y la URL configurada.`);
  }
  const body = await response.json() as ApiResponse<T>;
  if (!response.ok || !body.success || body.data === undefined) throw new ApiError(body.message || 'Error de API.', response.status);
  return body.data;
}
