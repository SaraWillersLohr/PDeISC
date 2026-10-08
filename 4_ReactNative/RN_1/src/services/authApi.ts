import { API_BASE_URL } from '../config/api';
import type { ApiResponse, LoginResult, PublicUser } from '../types/auth';

export class ApiError extends Error {
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}

async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    throw new ApiError(body.message || 'No se pudo completar la solicitud.', response.status);
  }
  return body.data as T;
}

async function postMessage(path: string, payload: unknown): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  const result = await response.json() as ApiResponse<unknown>;
  if (!response.ok || !result.success) throw new ApiError(result.message || 'No se pudo completar la solicitud.', response.status);
  return result.message;
}

export const registerApi = (payload: { nombre: string; apellido: string; email: string; password: string }) => postMessage('register', payload);
export const verifyEmailApi = (email: string, code: string) => postMessage('verify-email', { email, code });
export const resendVerificationApi = (email: string) => postMessage('resend-verification', { email });

/** Inicia sesión contra el endpoint Node/Express existente. */
export async function loginApi(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return readResponse<LoginResult>(response);
}

/** Recupera el perfil actual; el backend valida el JWT en cada petición. */
export async function getProfileApi(token: string): Promise<PublicUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse<PublicUser>(response);
}

export async function changeInitialPasswordApi(token: string, password: string): Promise<PublicUser> {
  const response = await fetch(`${API_BASE_URL}/auth/cambiar-password-inicial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password }),
  });
  return readResponse<PublicUser>(response);
}
