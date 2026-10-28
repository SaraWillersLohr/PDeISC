// guardo la caché y cola web sin abrir el módulo SQLite nativo.
import type { CachedResource, PendingOperation } from '../types/offline';

const cachePrefix = 'estancia-app-cache:';
const queueKey = 'estancia-app-pending-operations';

function browserStorage(): Storage | null {
  return typeof localStorage === 'undefined' ? null : localStorage;
}

export async function initializeOfflineDatabase(): Promise<void> {}

export async function saveCachedResource(resource: CachedResource): Promise<void> {
  browserStorage()?.setItem(`${cachePrefix}${resource.clave}`, JSON.stringify(resource));
}

export async function getCachedResource(key: string): Promise<CachedResource | null> {
  const raw = browserStorage()?.getItem(`${cachePrefix}${key}`);
  if (!raw) return null;
  try { return JSON.parse(raw) as CachedResource; }
  catch { return null; }
}

export async function removeCachedResource(key: string): Promise<void> {
  browserStorage()?.removeItem(`${cachePrefix}${key}`);
}

export async function enqueueOperation(operation: PendingOperation): Promise<void> {
  const storage = browserStorage();
  if (!storage) return;
  const operations = await getPendingOperations();
  if (!operations.some((item) => item.id_operacion === operation.id_operacion)) {
    storage.setItem(queueKey, JSON.stringify([...operations, operation]));
  }
}

export async function getPendingOperations(userId?: number): Promise<PendingOperation[]> {
  const raw = browserStorage()?.getItem(queueKey);
  if (!raw) return [];
  try {
    const operations = JSON.parse(raw) as PendingOperation[];
    return userId == null ? operations : operations.filter((item) => item.id_usuario === userId);
  }
  catch { return []; }
}

export async function markPendingOperationError(id: string, message: string): Promise<void> {
  const storage = browserStorage();
  if (!storage) return;
  const operations = await getPendingOperations();
  storage.setItem(queueKey, JSON.stringify(operations.map((item) => item.id_operacion === id ? { ...item, ultimo_error: message.slice(0,500) } : item)));
}

export async function removePendingOperation(id: string): Promise<void> {
  const storage = browserStorage();
  if (!storage) return;
  storage.setItem(queueKey, JSON.stringify((await getPendingOperations()).filter((item) => item.id_operacion !== id)));
}
