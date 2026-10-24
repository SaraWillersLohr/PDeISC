// conecto los paneles productivos con endpoints protegidos por la api.
import { apiUrl } from '../config/api';
import type { Session } from '../types/auth';

export interface DashboardMetrics { crias_ano: number; servicios_90_dias: number; muertes_pendientes: number; alertas_sanitarias: number; hembras_prenadas: number; }
export interface FieldReport { id_animal: number; fecha: string; motivo: string; latitud?: number; longitud?: number; }
export interface MapPoint { lat: number; lon: number; }

// centralizo errores http y autorización en una función tipada.
async function request<T>(session: Session, path: string, method = 'GET', payload?: unknown): Promise<T> {
  if (!apiUrl) throw new Error('Falta configurar EXPO_PUBLIC_API_URL.');
  const response = await fetch(`${apiUrl}${path}`, { method, headers: { Authorization: `Bearer ${session.accessToken}`, ...(payload ? { 'Content-Type': 'application/json' } : {}) }, body: payload ? JSON.stringify(payload) : undefined });
  const result = await response.json().catch(() => ({})) as { data?: T; message?: string };
  if (!response.ok) throw new Error(result.message ?? 'No se pudo completar la operación.');
  return result.data as T;
}

// consulto los indicadores productivos del dashboard.
export function getDashboard(session: Session): Promise<DashboardMetrics> { return request(session, '/dashboard'); }

// registro un pesaje con fecha de campo.
export function recordWeight(session: Session, id: number, peso_kg: number, fecha: string): Promise<void> { return request(session, `/animals/${id}/weights`, 'POST', { peso_kg, fecha }); }

// envío reportes sanitarios o muerte con gps solo cuando se conoce.
export function reportAnimal(session: Session, kind: 'sanitario' | 'muerte', report: FieldReport): Promise<void> { return request(session, `/reports/${kind}`, 'POST', report); }

// reviso reportes de muerte pendientes y guardo decisión del administrador.
export interface DeathReport extends FieldReport { id_reporte: number; identificador: string; nombre: string | null; corral: string; estado: string; }
export function listPendingDeaths(session: Session): Promise<DeathReport[]> { return request(session, '/deaths'); }
export function reviewDeath(session: Session, id: number, decision: 'confirmar' | 'rechazar', motivo_revision?: string): Promise<void> { return request(session, `/deaths/${id}/review`, 'PATCH', { decision, motivo_revision }); }

// cargo la geometría fija guardada para cada corral.
export interface MapArea { id_corral: number; nombre: string; capacidad: number; puntos_mapa: MapPoint[] | string | null; }
export function listMapAreas(session: Session): Promise<MapArea[]> { return request(session, '/map/areas'); }
export function saveMapArea(session: Session, id: number, puntos: MapPoint[]): Promise<void> { return request(session, `/map/areas/${id}`, 'PUT', { puntos }); }
