// Archivo src/services/api.ts: las solicitudes autenticadas y públicas hacia el backend. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { API_BASE_URL } from '../config/api';
import type { ApiResponse } from '../types/domain';

export class ApiError extends Error {
  // Este constructor inicializa el objeto de error de API con un mensaje legible y el estado HTTP recibido, para que la interfaz pueda distinguir fallos del servidor. Recibe message, status como entrada.
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}
// Esta función realiza una petición autenticada a la API, incorpora el token Bearer y devuelve data o comunica el error HTTP. Recibe path, token, init como entrada.
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
// Esta función realiza una petición pública a la API y procesa la respuesta JSON con el formato común del backend. Recibe path, init como entrada.
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
