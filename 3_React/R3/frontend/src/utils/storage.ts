// helpers para localstorage / sessionstorage con manejo seguro de json

const isBrowser = typeof window !== 'undefined';

export function getStorageItem<T>(key: string, persistent = true): T | null {
  if (!isBrowser) return null;
  const storage = persistent ? localStorage : sessionStorage;
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : null;
  } catch {
    return null;
  }
}

export function setStorageItem<T>(key: string, value: T, persistent = true): void {
  if (!isBrowser) return;
  const storage = persistent ? localStorage : sessionStorage;
  storage.setItem(key, JSON.stringify(value));
}

// ejecuto removestorageitem
export function removeStorageItem(key: string): void {
  if (!isBrowser) return;
  localStorage.removeItem(key);
  sessionStorage.removeItem(key);
}

// busco sesi�n en localstorage (recordarme) o sessionstorage (sesi�n temporal)
export function getSessionStorage<T>(key: string): { data: T; persistent: boolean } | null {
  const fromLocal = getStorageItem<T>(key, true);
  if (fromLocal) return { data: fromLocal, persistent: true };

  const fromSession = getStorageItem<T>(key, false);
  if (fromSession) return { data: fromSession, persistent: false };

  return null;
}

// claves centralizadas para evitar typos
export const STORAGE_KEYS = {
  THEME: 'estancia_theme',
  SESSION: 'estancia_session',
  LOGIN_MODE: 'estancia_login_mode',
} as const;

