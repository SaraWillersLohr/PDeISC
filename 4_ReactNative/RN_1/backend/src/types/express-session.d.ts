// Archivo backend/src/types/express-session.d.ts: tipos e interfaces compartidos relacionado con express-session. Aquí se concentra la responsabilidad indicada; las funciones documentadas abajo explican el flujo de sus operaciones principales.
// Amplía la sesión temporal de Express con el dato mínimo requerido por OAuth.
import 'express-session';

declare module 'express-session' {
  // Contrato de datos SessionData: define la forma y los tipos de los valores que este módulo recibe, comparte o devuelve.
  interface SessionData {
    rememberMe?: boolean;
    socialRedirect?: string;
    socialMode?: 'login' | 'register';
  }
}

export {};
