// consulto los recursos ganaderos protegidos por la sesión vigente.
import { apiUrl } from '../config/api';
import { apiConfigurationMessage, apiFetch, friendlyApiMessage } from './apiErrors';
import { getCachedResource, removeCachedResource, saveCachedResource } from './offlineDatabase';
import { submitOfflineOperation, type OfflineWriteStatus } from './offlineSync';
import type { Session } from '../types/auth';

export type AnimalGender = 'hembra' | 'macho' | 'no_especificado';

export interface AnimalRecord {
  id_animal: number;
  id_raza: number;
  version_dato: number;
  identificador: string;
  nombre: string | null;
  foto: string | null;
  genero: AnimalGender;
  fecha_nacimiento: string | null;
  peso_kg: number | string | null;
  estado_salud: string;
  activo: number;
  motivo_baja: 'venta' | 'muerte' | 'otro' | null;
  detalle_baja: string | null;
  fecha_baja: string | null;
  id_corral: number;
  corral: string;
  raza: string;
  especie: string;
  alta_pendiente_traslado: number;
}

export interface CorralRecord {
  id_corral: number;
  nombre: string;
  capacidad: number;
  es_enfermeria: number;
  ocupacion: number;
}

export interface NursingAnimalRecord {
  id_animal: number;
  foto: string | null;
  identificador: string;
  nombre: string | null;
  estado_salud: string;
  peso_kg: number | string | null;
  corral: string;
  raza: string;
  especie: string;
  alta_pendiente_traslado: number;
  reporte_sanitario: string | null;
}

export interface VeterinaryRecord {
  id_registro: string;
  id_animal: number;
  fecha: string;
  tipo: 'tratamiento' | 'nota' | 'alta' | 'reporte_sanitario' | 'estado_salud' | 'ingreso_enfermeria' | 'movimiento';
  detalle: string;
  foto: string | null;
  created_at: string;
  nombre_autor: string;
  apellido_autor: string;
}

export interface NotificationRecord {
  id_notificacion: number;
  id_animal: number | null;
  titulo: string;
  mensaje: string;
  tipo: string;
  leida: number;
  estado_respuesta: string | null;
  created_at: string;
}

export interface NotificationPage { data: NotificationRecord[]; hasMore: boolean; }

async function invalidate(session: Session, paths: string[]): Promise<void> {
  await Promise.all(paths.map((path) => removeCachedResource(`${session.usuario.id_usuario}:${session.usuario.rol}:${path}`).catch(() => undefined)));
}

async function invalidateInventory(session: Session): Promise<void> {
  await invalidate(session, ['/animals', '/animals?incluir_inactivos=true', '/corrals', '/health/nursing']);
}

// solicito un recurso y convierto respuestas fallidas en mensajes legibles.
async function getData<T>(path: string, session: Session): Promise<T[]> {
  const cacheKey = `${session.usuario.id_usuario}:${session.usuario.rol}:${path}`;
  const readCache = async (): Promise<T[] | null> => {
    try {
      const cached = await getCachedResource(cacheKey);
      return cached ? JSON.parse(cached.contenido) as T[] : null;
    } catch { return null; }
  };
  if (!apiUrl) {
    const cached = await readCache();
    if (cached) return cached;
    throw new Error(apiConfigurationMessage);
  }
  let response: Response;
  try { response = await apiFetch(`${apiUrl}${path}`, { headers: { Authorization: `Bearer ${session.accessToken}` } }); }
  catch (error) {
    const cached = await readCache();
    if (cached) return cached;
    throw error;
  }
  const payload = await response.json().catch(() => ({})) as { data?: T[]; message?: string };
  if (!response.ok) {
    if (response.status >= 500) {
      const cached = await readCache();
      if (cached) return cached;
    }
    throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudieron cargar los datos.'));
  }
  const data = payload.data ?? [];
  await saveCachedResource({ clave: cacheKey, contenido: JSON.stringify(data), actualizado_en: new Date().toISOString() }).catch(() => undefined);
  return data;
}

export function listAnimals(session: Session, includeInactive = false): Promise<AnimalRecord[]> {
  return getData<AnimalRecord>(includeInactive ? '/animals?incluir_inactivos=true' : '/animals', session);
}
export function listCorrals(session: Session): Promise<CorralRecord[]> { return getData<CorralRecord>('/corrals', session); }

export async function createAnimal(session: Session, input: { identificador: string; nombre?: string; foto?: string | null; genero: AnimalGender; id_raza: number; id_corral: number; fecha_nacimiento?: string; peso_kg?: number }): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/animals`, { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(input) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo registrar el animal.'));
  await invalidateInventory(session);
}

// actualizo la ficha optimista usando versionado para detectar cambios simultáneos.
export async function updateAnimal(session: Session, animal: AnimalRecord, data: { nombre: string; identificador: string; fecha_nacimiento: string; genero: AnimalGender }): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/animals/${animal.id_animal}`, { method: 'PUT', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ ...data, id_raza: animal.id_raza, version_dato: animal.version_dato }) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo actualizar el animal.'));
  await invalidateInventory(session);
}

// doy de baja un animal y conservo la ficha con su motivo.
export async function deactivateAnimal(session: Session, id: number, motivo: 'venta' | 'muerte' | 'otro', detalle: string, location?: { latitude: number; longitude: number; foto?: string }): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/animals/${id}/deactivate`, { method: 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ motivo, detalle, ...(location ? { latitud: location.latitude, longitud: location.longitude, foto: location.foto } : {}) }) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo dar de baja el animal.'));
  await invalidateInventory(session);
}

// elimino definitivamente una ficha inactiva y sus registros vinculados.
export async function permanentlyDeleteInactiveAnimal(session: Session, id: number): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/animals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.accessToken}` } });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo eliminar definitivamente la ficha.'));
  await invalidateInventory(session);
}

// creo y edito corrales desde el panel del dueño o administrador.
export async function saveCorral(session: Session, corral: { id_corral?: number; nombre: string; capacidad: number }): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/corrals${corral.id_corral ? `/${corral.id_corral}` : ''}`, { method: corral.id_corral ? 'PUT' : 'POST', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify(corral) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo guardar el corral.'));
  await invalidate(session, ['/corrals']);
}

// doy de baja un corral vacío; el servidor bloquea si conserva animales.
export async function deleteCorral(session: Session, id: number): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/corrals/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${session.accessToken}` } });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo dar de baja el corral.'));
  await invalidate(session, ['/corrals']);
}

// registro el movimiento sin permitir que la app omita validaciones del backend.
export async function moveAnimal(session: Session, animalId: number, destinationId: number): Promise<OfflineWriteStatus> {
  const status = await submitOfflineOperation(session, 'movimiento', 'animal', { id_animal: animalId, id_corral_destino: destinationId });
  if (status.estado === 'sincronizada') await invalidateInventory(session);
  return status;
}

// consulto animales en enfermería y registro el alta veterinaria.
export function listNursingAnimals(session: Session): Promise<NursingAnimalRecord[]> { return getData<NursingAnimalRecord>('/health/nursing', session); }
export function listVeterinaryRecords(session: Session, animalId: number): Promise<VeterinaryRecord[]> { return getData<VeterinaryRecord>(`/health/animals/${animalId}/records`, session); }
export async function createVeterinaryRecord(session: Session, animalId: number, input: { fecha: string; tipo: 'tratamiento' | 'nota'; detalle: string; foto?: string | null }): Promise<OfflineWriteStatus> {
  const status = await submitOfflineOperation(session, 'nota_veterinaria', 'animal', { id_animal: animalId, ...input });
  if (status.estado === 'sincronizada') await invalidate(session, ['/health/nursing', `/health/animals/${animalId}/records`]);
  return status;
}
export async function updateNursingHealthStatus(session: Session, animalId: number, status: 'enfermo' | 'herido'): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/health/animals/${animalId}/status`, { method: 'PATCH', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ estado_salud: status }) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo actualizar el diagnóstico.'));
  await invalidate(session, ['/health/nursing', `/health/animals/${animalId}/records`]);
}
export async function dischargeAnimal(session: Session, animalId: number, notes: string): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/health/animals/${animalId}/discharge`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ observaciones: notes }),
  });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo registrar el alta.'));
  await invalidateInventory(session);
  await invalidate(session, [`/health/animals/${animalId}/records`]);
}

// consulto avisos dirigidos al rol autenticado.
export async function listNotifications(session: Session, before?: number): Promise<NotificationPage> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const cursor = before ? `?before=${before}` : '';
  const response = await apiFetch(`${apiUrl}/notifications${cursor}`, { headers: { Authorization: `Bearer ${session.accessToken}` } });
  const payload = await response.json().catch(() => ({})) as { data?: NotificationRecord[]; hasMore?: boolean; message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudieron cargar las notificaciones.'));
  return { data: payload.data ?? [], hasMore: Boolean(payload.hasMore) };
}

export async function updateNotification(session: Session, id: number, action: 'read' | 'delete' | 'accept' | 'reject'): Promise<void> {
  if (!apiUrl) throw new Error(apiConfigurationMessage);
  const response = await apiFetch(`${apiUrl}/notifications/${id}`, { method: 'PATCH', headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' }, body: JSON.stringify({ action }) });
  const payload = await response.json().catch(() => ({})) as { message?: string };
  if (!response.ok) throw new Error(friendlyApiMessage(payload.message, response.status, 'No se pudo actualizar la notificación.'));
}
