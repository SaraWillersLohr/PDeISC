// conecto el formulario móvil con los endpoints de autenticación del backend.
import { apiUrl } from '../config/api';
import type { Session } from '../types/auth';

interface LoginCredentials {
  email: string;
  password: string;
}

// convierto errores de red y respuestas de api en mensajes entendibles.
async function getErrorMessage(response: Response): Promise<string> {
  const body = (await response.json().catch(() => null)) as { message?: string } | null;

  return body?.message ?? 'no se pudo completar la solicitud';
}

// envío las credenciales al backend y devuelvo una sesión válida.
export async function login(credentials: LoginCredentials): Promise<Session> {
  if (!apiUrl) {
    throw new Error('falta configurar expo_public_api_url');
  }

  const response = await fetch(`${apiUrl}/auth/login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(credentials),
  });

  if (!response.ok) {
    throw new Error(await getErrorMessage(response));
  }

  return (await response.json()) as Session;
}

interface ApiMessage {
  message?: string;
}

// envío un formulario público de autenticación y devuelvo el mensaje de la api.
async function postMessage(path: string, payload: unknown): Promise<string> {
  if (!apiUrl) throw new Error('falta configurar expo_public_api_url');
  const response = await fetch(`${apiUrl}/auth/${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  const body = (await response.json().catch(() => null)) as ApiMessage | null;
  if (!response.ok) throw new Error(body?.message ?? 'no se pudo completar la solicitud');
  return body?.message ?? 'operación completada';
}

// creo una solicitud de acceso que debe verificar el correo y aprobar el administrador.
export async function requestAccount(payload: LoginCredentials & { nombre: string; apellido: string }): Promise<string> {
  return postMessage('register', payload);
}

// verifico el correo de una solicitud con el código temporal enviado por email.
export async function verifyAccountEmail(email: string, code: string): Promise<string> {
  return postMessage('verify-email', { email, code });
}

// solicito otro código cuando el correo todavía no quedó verificado.
export async function resendAccountCode(email: string): Promise<string> {
  return postMessage('resend-verification', { email });
}

// canjeo el código enviado después de la aprobación y recibo la sesión activa.
export async function redeemAccountCode(email: string, code: string): Promise<Session> {
  if (!apiUrl) throw new Error('falta configurar expo_public_api_url');
  const response = await fetch(`${apiUrl}/auth/access-code`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const body = (await response.json().catch(() => null)) as { message?: string; data?: Session } | null;
  if (!response.ok || !body?.data) throw new Error(body?.message ?? 'no se pudo activar el acceso');
  return body.data;
}

// solicito el reenvío del código temporal de una cuenta aprobada.
export async function resendAccessCode(email: string): Promise<string> {
  return postMessage('resend-access-code', { email });
}

// solicito un código por correo sin revelar si la cuenta existe.
export async function requestPasswordRecovery(email: string): Promise<string> {
  return postMessage('password-recovery/request', { email });
}

// canjeo el código de seis dígitos por un permiso temporal de cambio de contraseña.
export async function redeemPasswordRecoveryCode(email: string, code: string): Promise<string> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/auth/password-recovery/redeem`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email, code }),
  });
  const body = await response.json() as { message?: string; data?: { resetToken?: string } };
  if (!response.ok || !body.data?.resetToken) throw new Error(body.message ?? 'No se pudo validar el código.');
  return body.data.resetToken;
}

// guardo la nueva contraseña y recibo una sesión autenticada.
export async function completePasswordRecovery(resetToken: string, password: string): Promise<Session> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}/auth/password-recovery/reset`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ resetToken, password }),
  });
  const body = await response.json() as { message?: string; data?: Session };
  if (!response.ok || !body.data?.accessToken) throw new Error(body.message ?? 'No se pudo cambiar la contraseña.');
  return body.data;
}
