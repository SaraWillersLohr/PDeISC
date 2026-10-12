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
export const resendAccessTokenApi = (email: string) => postMessage('resend-access-token', { email });

/** Canjea el token enviado después de que el administrador aprueba el registro. */
export async function redeemAccessTokenApi(email: string, token: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  });
  return readResponse<LoginResult>(response);
}

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

export type SocialProviderId = 'google' | 'facebook' | 'github' | 'discord' | 'twitch' | 'twitter';
export interface SocialLoginResult extends LoginResult { rememberMe: boolean; }

/** Lista solo proveedores OAuth cuyas dos credenciales están configuradas en el backend. */
export async function listSocialProvidersApi(): Promise<SocialProviderId[]> {
  const response = await fetch(`${API_BASE_URL}/auth/social/providers`);
  const result = await readResponse<{ providers: SocialProviderId[] }>(response);
  return result.providers;
}

/** Canjea el código efímero recibido al volver del proveedor por la sesión normal. */
export async function exchangeSocialCodeApi(code: string): Promise<SocialLoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/social/exchange`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
  });
  return readResponse<SocialLoginResult>(response);
}
