// guardo cambios localmente y reintento su aplicación idempotente al recuperar conexión.
import * as Crypto from 'expo-crypto';
import { apiUrl } from '../config/api';
import type { Session } from '../types/auth';
import type { PendingOperation } from '../types/offline';
import { apiFetch, friendlyApiMessage } from './apiErrors';
import { enqueueOperation, getCachedResource, getPendingOperations, markPendingOperationError, removeCachedResource, removePendingOperation, saveCachedResource } from './offlineDatabase';

export type OfflineWriteStatus = { estado: 'sincronizada' } | { estado: 'pendiente'; mensaje: string };
interface SyncResponse { data?: { id_operacion: string; estado: 'aplicada' | 'repetida' | 'rechazada'; mensaje?: string }[]; message?: string; }

export async function submitOfflineOperation(session: Session, type: string, entity: string, payload: unknown): Promise<OfflineWriteStatus> {
  const operation: PendingOperation = {
    id_operacion: Crypto.randomUUID(), tipo_operacion: type, entidad: entity,
    payload: JSON.stringify(payload), created_at: new Date().toISOString(), id_usuario: session.usuario.id_usuario,
  };
  await enqueueOperation(operation);
  const error = await synchronizePendingOperations(session);
  const stillPending = (await getPendingOperations(session.usuario.id_usuario)).find((item) => item.id_operacion === operation.id_operacion);
  if (!stillPending) return { estado: 'sincronizada' };
  await applyOptimisticCache(session, type, payload);
  return { estado: 'pendiente', mensaje: error || stillPending.ultimo_error || 'El cambio quedó guardado en este dispositivo y espera conexión.' };
}

export async function synchronizePendingOperations(session: Session): Promise<string | null> {
  const operations = await getPendingOperations(session.usuario.id_usuario);
  if (!operations.length) return null;
  if (!apiUrl) return 'Falta configurar el servidor; los cambios siguen guardados en este dispositivo.';
  let response: Response;
  try {
    response = await apiFetch(`${apiUrl}/sync/operations`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${session.accessToken}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ operaciones: operations.map((operation) => ({ ...operation, payload: operation.payload })) }),
    });
  } catch (error) { return error instanceof Error ? error.message : 'Sin conexión con el servidor.'; }
  const result = await response.json().catch(() => ({})) as SyncResponse;
  if (!response.ok || !Array.isArray(result.data)) return friendlyApiMessage(result.message, response.status, 'No se pudieron sincronizar los cambios guardados.');
  for (const item of result.data) {
    if (item.estado === 'aplicada' || item.estado === 'repetida') {
      await removePendingOperation(item.id_operacion);
      await invalidateFieldCaches(session);
      continue;
    }
    const message = item.mensaje || 'El servidor rechazó el cambio. Revisá los datos antes de reintentar.';
    await markPendingOperationError(item.id_operacion, message);
    return message;
  }
  return null;
}

async function invalidateFieldCaches(session: Session): Promise<void> {
  const prefix = `${session.usuario.id_usuario}:${session.usuario.rol}:`;
  const paths = ['/animals', '/animals?incluir_inactivos=true', '/corrals', '/health/nursing', '/notifications'];
  await Promise.all(paths.map((path) => removeCachedResource(`${prefix}${path}`).catch(() => undefined)));
}

async function applyOptimisticCache(session: Session, type: string, payload: unknown): Promise<void> {
  if (!payload || typeof payload !== 'object') return;
  const operation = payload as Record<string, unknown>;
  const prefix = `${session.usuario.id_usuario}:${session.usuario.rol}:`;
  const animalId = Number(operation.id_animal);
  if (!Number.isInteger(animalId)) return;
  const paths = ['/animals', '/animals?incluir_inactivos=true'];
  if (type === 'pesaje') {
    await updateListCache(prefix, paths, (animal) => animal.id_animal === animalId ? { ...animal, peso_kg: Number(operation.peso_kg) } : animal);
    return;
  }
  if (type === 'reporte_muerte') {
    await updateListCache(prefix, paths, (animal) => animal.id_animal === animalId ? { ...animal, activo: 0, motivo_baja: 'muerte', fecha_baja: operation.fecha } : animal);
    return;
  }
  if (type !== 'movimiento' && type !== 'reporte_sanitario') return;
  const destinationId = Number(type === 'movimiento' ? operation.id_corral_destino : operation.id_corral_destino);
  if (!Number.isInteger(destinationId)) return;
  const activeAnimals = await readCachedList<Record<string, unknown>>(`${prefix}/animals`);
  const previousId = Number(activeAnimals?.find((item) => Number(item.id_animal) === animalId)?.id_corral);
  const corral = await readCachedList<Record<string, unknown>>(`${prefix}/corrals`);
  const destination = corral?.find((item) => Number(item.id_corral) === destinationId);
  await updateListCache(prefix, paths, (animal) => animal.id_animal === animalId
    ? { ...animal, id_corral: destinationId, corral: destination?.nombre ?? animal.corral, estado_salud: type === 'reporte_sanitario' ? 'enfermo' : animal.estado_salud }
    : animal);
  if (destination) {
    await updateListCache(prefix, ['/corrals'], (item) => {
      const corralId = Number(item.id_corral);
      if (corralId === destinationId && previousId !== destinationId) return { ...item, ocupacion: Number(item.ocupacion ?? 0) + 1 };
      if (corralId === previousId && previousId !== destinationId) return { ...item, ocupacion: Math.max(0, Number(item.ocupacion ?? 0) - 1) };
      return item;
    });
  }
}

async function updateListCache(prefix: string, paths: string[], update: (item: Record<string, unknown>) => Record<string, unknown>): Promise<void> {
  for (const path of paths) {
    const resource = await getCachedResource(`${prefix}${path}`).catch(() => null);
    if (!resource) continue;
    try {
      const rows = JSON.parse(resource.contenido) as Record<string, unknown>[];
      await saveCachedResource({ ...resource, contenido: JSON.stringify(rows.map(update)), actualizado_en: new Date().toISOString() });
    } catch { /* conservo la copia original si no se pudo interpretar */ }
  }
}

async function readCachedList<T extends Record<string, unknown>>(key: string): Promise<T[] | null> {
  const resource = await getCachedResource(key).catch(() => null);
  if (!resource) return null;
  try { return JSON.parse(resource.contenido) as T[]; } catch { return null; }
}
