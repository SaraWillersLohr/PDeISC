// consulto usuarios y administro solicitudes del catálogo de la estancia.
import { apiUrl } from '../config/api';
import type { Session } from '../types/auth';

export interface OrganizationUser { id_usuario: number; nombre: string; apellido: string; email: string; activo: number; rol: string; }
export interface Species { id_especie: number; nombre: string; }
export interface Breed { id_raza: number; id_especie: number; nombre: string; }
export interface CatalogRequest { id_solicitud_catalogo: number; tipo: 'especie'|'raza'; nombre: string; especie?: string; estado: string; }
export interface CatalogData { especies: Species[]; razas: Breed[]; pendientes: CatalogRequest[]; }

async function request<T>(session: Session, path: string, method = 'GET', body?: unknown): Promise<T> {
  if (!apiUrl) throw new Error('Falta configurar la dirección de la API.');
  const response = await fetch(`${apiUrl}/organization${path}`, { method, headers: { Authorization: `Bearer ${session.accessToken}`, ...(body ? { 'Content-Type': 'application/json' } : {}) }, body: body ? JSON.stringify(body) : undefined });
  const payload = await response.json().catch(() => ({})) as { data?: T; message?: string };
  if (!response.ok) throw new Error(payload.message ?? 'No se pudo completar la operación.');
  return payload.data as T;
}

export function listOrganizationUsers(session: Session): Promise<OrganizationUser[]> { return request(session, '/users'); }
export function updateOrganizationUser(session: Session, user: OrganizationUser, role: string): Promise<void> { return request(session, `/users/${user.id_usuario}`, 'PUT', { nombre: user.nombre, apellido: user.apellido || '-', rol: role }); }
export function deactivateOrganizationUser(session: Session, id: number): Promise<void> { return request(session, `/users/${id}`, 'DELETE'); }
export function listCatalog(session: Session): Promise<CatalogData> { return request(session, '/catalog'); }
export function requestCatalog(session: Session, tipo: 'especie'|'raza', nombre: string, id_especie?: number): Promise<void> { return request(session, '/catalog/requests', 'POST', { tipo, nombre, ...(id_especie ? { id_especie } : {}) }); }
export function reviewCatalog(session: Session, id: number, decision: 'aprobar'|'rechazar'): Promise<void> { return request(session, `/catalog/requests/${id}`, 'PATCH', { decision }); }
