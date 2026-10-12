import { Platform } from 'react-native';

/** Dirección de la API existente; se configura por entorno, nunca apunta directo a MariaDB. */
export const API_BASE_URL = (
  Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB ?? 'http://localhost:3001/api'
    : process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api'
).replace(/\/$/, '');

export const SESSION_KEY = 'estancia_access_token';
