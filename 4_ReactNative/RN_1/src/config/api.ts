/** Dirección de la API existente; se configura por entorno, nunca apunta directo a MariaDB. */
export const API_BASE_URL = (
  process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api'
).replace(/\/$/, '');

export const SESSION_KEY = 'estancia_access_token';
