// conecto las solicitudes de acceso a las acciones administrativas de la api.
import { apiUrl } from '../config/api';

export type RequestedRole = 'dueno' | 'peon' | 'veterinario';
export interface RegistrationRequest {
  id_solicitud: number;
  nombre: string;
  apellido: string;
  email: string;
  created_at: string;
}

// envío una petición autenticada y convierto respuestas de error en mensajes legibles.
async function adminRequest<T>(token: string, path: string, method = 'GET', payload?: unknown): Promise<T> {
  if (!apiUrl) throw new Error('falta configurar expo_public_api_url');
  const response = await fetch(`${apiUrl}/admin/${path}`, {
    method,
    headers: { Authorization: `Bearer ${token}`, ...(payload ? { 'Content-Type': 'application/json' } : {}) },
    body: payload ? JSON.stringify(payload) : undefined,
  });
  const body = await response.json().catch(() => null) as { message?: string; data?: T } | null;
  if (!response.ok) throw new Error(body?.message ?? 'no se pudo completar la acción administrativa');
  return body?.data as T;
}

// consulto las solicitudes con correo verificado que todavía esperan revisión.
export async function listRegistrationRequests(token: string): Promise<RegistrationRequest[]> {
  return adminRequest<RegistrationRequest[]>(token, 'registration-requests');
}

// apruebo una solicitud y asigno el rol que eligió el administrador.
export async function approveRegistrationRequest(token: string, requestId: number, rol: RequestedRole): Promise<void> {
  await adminRequest(token, `registration-requests/${requestId}/approve`, 'POST', { rol });
}

// rechazo una solicitud pendiente sin crear una cuenta activa.
export async function rejectRegistrationRequest(token: string, requestId: number): Promise<void> {
  await adminRequest(token, `registration-requests/${requestId}/reject`, 'POST', {});
}
