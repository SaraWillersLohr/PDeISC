// Archivo src/services/authApi.ts: las solicitudes de autenticación, registro, verificación y acceso social. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { API_BASE_URL } from '../config/api';
import type { ApiResponse, LoginResult, PublicUser } from '../types/auth';

export class ApiError extends Error {
  // Este constructor inicializa el objeto de error de API con un mensaje legible y el estado HTTP recibido, para que la interfaz pueda distinguir fallos del servidor. Recibe message, status como entrada.
  constructor(message: string, readonly status: number) {
    super(message);
    this.name = 'ApiError';
  }
}
// Esta función interpreta el sobre JSON común de la API, comprueba el estado HTTP y el indicador success, devuelve data y convierte errores en ApiError. Recibe response como entrada.
async function readResponse<T>(response: Response): Promise<T> {
  const body = (await response.json()) as ApiResponse<T>;
  if (!response.ok || !body.success) {
    throw new ApiError(body.message || 'No se pudo completar la solicitud.', response.status);
  }
  return body.data as T;
}
// Esta función envía un POST JSON a una ruta de autenticación, revisa la respuesta del servidor y devuelve su mensaje o lanza ApiError. Recibe path, payload como entrada.
async function postMessage(path: string, payload: unknown): Promise<string> {
  const response = await fetch(`${API_BASE_URL}/auth/${path}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(payload),
  });
  const result = await response.json() as ApiResponse<unknown>;
  if (!response.ok || !result.success) throw new ApiError(result.message || 'No se pudo completar la solicitud.', response.status);
  return result.message;
}
// Esta función envía al backend el nombre, apellido, correo y contraseña para iniciar una solicitud de registro por correo. Recibe payload como entrada.
export const registerApi = (payload: { nombre: string; apellido: string; email: string; password: string }) => postMessage('register', payload);
// Esta función envía el correo y el código de seis dígitos al backend para confirmar la solicitud de registro. Recibe email, code como entrada.
export const verifyEmailApi = (email: string, code: string) => postMessage('verify-email', { email, code });
// Esta función solicita al backend un nuevo código para una solicitud que todavía espera verificar el correo. Recibe email como entrada.
export const resendVerificationApi = (email: string) => postMessage('resend-verification', { email });
// Esta función solicita el reenvío del token temporal únicamente para una cuenta aprobada que todavía debe ingresar. Recibe email como entrada.
export const resendAccessTokenApi = (email: string) => postMessage('resend-access-token', { email });

// Canjea el token enviado después de que el administrador aprueba el registro.
export async function redeemAccessTokenApi(email: string, token: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/access-token`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, token }),
  });
  return readResponse<LoginResult>(response);
}

// Inicia sesión contra el endpoint Node/Express existente.
export async function loginApi(email: string, password: string): Promise<LoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, password }),
  });
  return readResponse<LoginResult>(response);
}

// Recupera el perfil actual; el backend valida el JWT en cada petición.
export async function getProfileApi(token: string): Promise<PublicUser> {
  const response = await fetch(`${API_BASE_URL}/auth/me`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return readResponse<PublicUser>(response);
}
// Esta función envía la nueva contraseña junto con el JWT y devuelve el perfil actualizado. Recibe token, password como entrada.
export async function changeInitialPasswordApi(token: string, password: string): Promise<PublicUser> {
  const response = await fetch(`${API_BASE_URL}/auth/cambiar-password-inicial`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
    body: JSON.stringify({ password }),
  });
  return readResponse<PublicUser>(response);
}

// Contrato de datos SocialProviderId: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export type SocialProviderId = 'google' | 'facebook' | 'github' | 'discord' | 'twitch' | 'twitter';
// Contrato de datos SocialLoginResult: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
export interface SocialLoginResult extends LoginResult { rememberMe: boolean; }

// Lista solo proveedores OAuth cuyas dos credenciales están configuradas en el backend.
export async function listSocialProvidersApi(): Promise<SocialProviderId[]> {
  const response = await fetch(`${API_BASE_URL}/auth/social/providers`);
  const result = await readResponse<{ providers: SocialProviderId[] }>(response);
  return result.providers;
}

// Canjea el código efímero recibido al volver del proveedor por la sesión normal.
export async function exchangeSocialCodeApi(code: string): Promise<SocialLoginResult> {
  const response = await fetch(`${API_BASE_URL}/auth/social/exchange`, {
    method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ code }),
  });
  return readResponse<SocialLoginResult>(response);
}
