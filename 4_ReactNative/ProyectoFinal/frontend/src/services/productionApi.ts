// conecto los paneles productivos con endpoints protegidos por la api.
import { apiUrl } from '../config/api';
import { apiConfigurationMessage, apiFetch, friendlyApiMessage } from './apiErrors';
import { removeCachedResource } from './offlineDatabase';
import { submitOfflineOperation, type OfflineWriteStatus } from './offlineSync';
import type { Session } from '../types/auth';

export interface DashboardMetrics { crias_ano: number; servicios_90_dias: number; muertes_pendientes: number; muertes_ano: number; ventas_ano: number; alertas_sanitarias: number; hembras_prenadas: number; }
export interface FieldReport { id_animal: number; fecha: string; motivo?: string; latitud?: number | string; longitud?: number | string; foto?: string | null; id_corral_destino?: number; }

async function invalidateAnimalViews(session: Session, animalId?: number): Promise<void> {
  const prefix = `${session.usuario.id_usuario}:${session.usuario.rol}:`;
  const paths = ['/animals', '/animals?incluir_inactivos=true', '/corrals', '/health/nursing', '/notifications'];
  if (animalId) paths.push(`/health/animals/${animalId}/records`);
  await Promise.all(paths.map((path) => removeCachedResource(`${prefix}${path}`).catch(() => undefined)));
}

// centralizo errores http y autorización en una función tipada.
async function request<T>(session: Session, path: string, method = 'GET', payload?: unknown): Promise<T> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}${path}`, { method, headers: { Authorization: `Bearer ${session.accessToken}`, ...(payload ? { 'Content-Type': 'application/json' } : {}) }, body: payload ? JSON.stringify(payload) : undefined });
  const result = await response.json().catch(() => ({})) as { data?: T; message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(result.message, response.status, 'No se pudo completar la operación.'));
  return result.data as T;
}

// consulto los indicadores productivos del dashboard.
export function getDashboard(session: Session): Promise<DashboardMetrics> { return request(session, '/dashboard'); }

// registro un pesaje con fecha de campo.
export async function recordWeight(session: Session, id: number, peso_kg: number, fecha: string): Promise<OfflineWriteStatus> {
  const status = await submitOfflineOperation(session, 'pesaje', 'animal', { id_animal: id, peso_kg, fecha });
  if (status.estado === 'sincronizada') await invalidateAnimalViews(session, id);
  return status;
}

// envío reportes sanitarios o muerte con gps solo cuando se conoce.
export async function reportAnimal(session: Session, kind: 'sanitario' | 'muerte', report: FieldReport): Promise<OfflineWriteStatus> {
  const operationType = kind === 'muerte' ? 'reporte_muerte' : 'reporte_sanitario';
  const status = await submitOfflineOperation(session, operationType, 'animal', report);
  if (status.estado === 'sincronizada') await invalidateAnimalViews(session, report.id_animal);
  return status;
}

// reviso reportes de muerte pendientes y guardo decisión del administrador.
export interface DeathReport extends FieldReport { id_reporte: number; identificador: string; nombre: string | null; corral: string; estado: string; foto: string | null; }
export function listPendingDeaths(session: Session): Promise<DeathReport[]> { return request(session, '/deaths'); }
export function reviewDeath(session: Session, id: number, decision: 'confirmar' | 'rechazar', motivo_revision?: string): Promise<void> { return request(session, `/deaths/${id}/review`, 'PATCH', { decision, motivo_revision }); }

