// Archivo src/config/api.ts: las solicitudes autenticadas y públicas hacia el backend. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
import { Platform } from 'react-native';

// Dirección de la API existente; se configura por entorno, nunca apunta directo a MariaDB.
// Configuración: API_BASE_URL establece un valor compartido por el módulo; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
export const API_BASE_URL = (
  Platform.OS === 'web'
    ? process.env.EXPO_PUBLIC_API_URL_WEB ?? 'http://localhost:3001/api'
    : process.env.EXPO_PUBLIC_API_URL ?? 'http://localhost:3001/api'
).replace(/\/$/, '');
// Configuración: SESSION_KEY establece clave con la que se identifica el token de sesión en el almacenamiento local; modificá esta constante solo si querés cambiar esa regla para toda la aplicación.
export const SESSION_KEY = 'estancia_access_token';
